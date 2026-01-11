import { Request, Response, NextFunction } from 'express';
import redis from '@eshop/redis';

// ✅ Create and save a payment session
export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId, clientSecret, cart, coupon, totalAmount } = req.body;

    const payload = { sessionId, clientSecret, cart, coupon, totalAmount };

    await redis.set(`payment-session:${sessionId}`, JSON.stringify(payload));

    console.log(`Saved session to Redis: ${sessionId}`);

    return res
      .status(201)
      .json({ message: 'Payment session created', sessionId });
  } catch (err) {
    console.error('Error creating payment session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Fetch a payment session
export const getPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sessionId } = req.params;

  try {
    const data = await redis.get(`payment-session:${sessionId}`);
    if (!data) {
      return res.status(404).json({ message: 'Payment session not found' });
    }
    return res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error fetching payment session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
