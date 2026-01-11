import { Router } from 'express';
import {
  createPaymentSession,
  getPaymentSession,
} from '../controllers/paymentSession.controller';

const router = Router();

router.post('/payment-session', createPaymentSession);
router.get('/payment-session/:sessionId', getPaymentSession);

export default router;
