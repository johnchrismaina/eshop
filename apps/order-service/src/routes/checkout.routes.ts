import { Router } from 'express';
import redis from '@eshop/redis';
import { createCheckoutSession } from '../controllers/checkout.controller';

const router = Router();

// Receives forwarded path: POST http://localhost:6004/api/create-checkout-session
router.post('/create-checkout-session', createCheckoutSession);

// new GET route to fetch session
router.get('/payment-session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await redis.get(`payment-session:${id}`);
    if (!data) {
      return res.status(404).json({ message: 'Session not found or expired' });
    }
    return res.status(200).json(JSON.parse(data));
  } catch (err) {
    console.error('Error fetching payment session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
