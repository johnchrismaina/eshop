import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from '@gateway/libs/initializeSiteConfig';
import siteConfigRouter from './routes/siteConfig';
import { logInfo, logError } from '@packages/utils/logger';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.set('trust proxy', 1);

//Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// app.use(limiter);
// Apply limiter only to sensitive endpoints
app.use('/api/auth', limiter);
app.use('/api/signup', limiter);
app.use('/api/login', limiter);
app.use('/api/password-reset', limiter);
// Leave bootstrap endpoints unrestricted // e.g. /api/logged-in-user, /api/get-layouts

// app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/chatting', proxy('http://localhost:6006')); // Chatting Service
app.use('/admin', proxy('http://localhost:6005')); // Admin Service
// app.use(
//   '/order',
//   proxy('http://localhost:6004', {
//     proxyReqPathResolver: (req) => `/api${req.url}`,
//   })
// );
app.use(
  '/order',
  proxy('http://localhost:6004', {
    proxyReqPathResolver: (req) => `/api${req.url.replace('/order', '')}`,
  })
); // Order Service
app.use('/seller', proxy('http://localhost:6003')); // Seller Service
app.use(
  '/product',
  proxy('http://localhost:6002', {
    proxyReqPathResolver: (req) => `/api${req.url.replace('/product', '')}`,
  })
); // Product Service
// app.use('/', proxy('http://localhost:6001')); // Auth Service
app.use('/api', proxy('http://localhost:6001')); // Auth Service

// Register your siteConfig routes
app.use('/api/site-config', siteConfigRouter);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logInfo(`Listening at http://localhost:${port}/api`);

  try {
    initializeSiteConfig();
    logInfo('Site config initialized successfully!');
  } catch (error) {
    logError('Failed to initialize site config:', error);
  }
});
server.on('error', (error) => {
  logError('Server error:', error);
});
