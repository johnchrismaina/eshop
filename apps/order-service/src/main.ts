import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { logInfo, logError } from '@packages/utils/logger';

import checkoutRoutes from './routes/checkout.routes'; // frontend initializer
import orderRoutes from './routes/order.routes'; // other order routes
import { createOrder } from './controllers/order.controller'; // webhook finalizer

logInfo('Stripe key loaded:', !!process.env.STRIPE_SECRET_KEY);

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

// 2️⃣ Stripe webhook: POST /api/create-order (MUST come before express.json())
app.post(
  '/api/create-order',
  bodyParser.raw({ type: 'application/json' }),
  createOrder
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

// 3️⃣ Other order routes
app.use('/api', orderRoutes);

// --- Error handling ---
app.use(errorMiddleware);

// --- Startup ---
const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  logInfo(`Order service running on port ${port}`);
  logInfo(`Listening at http://localhost:${port}/api`);
});
server.on('error', (error) => {
  logError('Server error:', error);
});
