import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, { Router } from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
} from '../controllers/order.controller';
import { createOrder } from '../controllers/order.controller';

const router: Router = express.Router();

router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);
router.post('/stripe-webhook', createOrder);
// router.get(
//   '/verifying-payment-session',
//   isAuthenticated,
//   verifyingPaymentSession
// );

export default router;
