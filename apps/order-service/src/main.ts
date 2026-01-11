import dotenv from 'dotenv';
dotenv.config();

console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';

import checkoutRoutes from './routes/checkout.routes'; // frontend initializer
import orderRoutes from './routes/order.routes'; // other order routes
import { createOrder } from './controllers/order.controller'; // webhook finalizer

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(express.json()); // must come before checkoutRoutes
app.use(cookieParser());

// --- Health check ---
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

// --- Routes ---
// 1️⃣ Frontend initializer: POST /api/checkout-session
app.use('/api', checkoutRoutes);

// 2️⃣ Stripe webhook: POST /api/stripe-webhook
app.post(
  '/api/stripe-webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

// 3️⃣ Other order routes
app.use('/api', orderRoutes);

// --- Error handling ---
app.use(errorMiddleware);

// --- Startup ---
const port = process.env.PORT || 6004;
if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Order service running on port ${port}`);
    console.log(`Listening at http://localhost:${port}/api`);
  });
  server.on('error', console.error);
}
