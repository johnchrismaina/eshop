// controllers/checkout.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import redis from '@eshop/redis';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //   apiVersion: '2025-10-29.clover',
  apiVersion: '2025-10-29.clover',
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, coupon, totalAmount, selectedAddressId, userId } = req.body;

    console.log('Checkout payload:', req.body);

    if (totalAmount === undefined || isNaN(Number(totalAmount))) {
      return res
        .status(400)
        .json({ message: 'Invalid totalAmount', body: req.body });
    }

    const amountInCents = Math.round(Number(totalAmount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    const sessionId = uuidv4();
    const payload = {
      sessionId,
      clientSecret: paymentIntent.client_secret,
      cart,
      coupon,
      totalAmount,
      shippingAddressId: selectedAddressId,
    };

    await redis.set(
      `payment-session:${sessionId}`,
      JSON.stringify(payload),
      'EX',
      1800
    );

    return res.status(201).json({
      sessionId,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
