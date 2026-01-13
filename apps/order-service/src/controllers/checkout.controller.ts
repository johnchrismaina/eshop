// Import Express types for request/response handling
import { Request, Response, NextFunction } from 'express';

// Import UUID generator to create unique session IDs
import { v4 as uuidv4 } from 'uuid';

// Import Redis client (your shared package @eshop/redis)
import redis from '@eshop/redis';

// Import lazy-loaded Stripe client
import { getStripeClient } from '../utils/stripe-client';

// Controller function: handles POST /api/create-order (via checkout.routes)
export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1️⃣ Extract payload from request body
    // These fields come from the frontend cart page
    const { cart, coupon, totalAmount, selectedAddressId, userId } = req.body;

    console.log('Checkout payload:', req.body);

    // 2️⃣ Validate totalAmount
    // Ensure it exists and is numeric, otherwise reject early
    if (totalAmount === undefined || isNaN(Number(totalAmount))) {
      return res
        .status(400)
        .json({ message: 'Invalid totalAmount', body: req.body });
    }

    // 3️⃣ Convert amount to cents (Stripe expects smallest currency unit)
    const amountInCents = Math.round(Number(totalAmount) * 100);

    // 3.5️⃣ Generate a unique sessionId FIRST (before creating PaymentIntent)
    const sessionId = uuidv4();

    // 4️⃣ Create a PaymentIntent with Stripe
    // - amount: total in cents
    // - currency: USD
    // - automatic_payment_methods: lets Stripe decide best payment method (card, wallet, etc.)
    // - metadata: attach userId AND sessionId for later reconciliation
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId, sessionId }, // ✅ Include sessionId in metadata
    });

    // 5️⃣ Build payload to store in Redis
    // Includes everything needed to resume/recover the checkout flow
    const payload = {
      sessionId,
      clientSecret: paymentIntent.client_secret, // used by frontend to confirm payment
      cart,
      coupon,
      totalAmount,
      shippingAddressId: selectedAddressId,
    };

    // 6️⃣ Save payload in Redis with TTL (30 minutes)
    // Key: payment-session:<sessionId>
    // Value: JSON string of payload
    // 'EX', 1800 → expire after 1800 seconds (30 minutes)
    await redis.set(
      `payment-session:${sessionId}`,
      JSON.stringify(payload),
      'EX',
      1800
    );

    // 7️⃣ Respond to frontend with sessionId + clientSecret
    // Frontend uses sessionId to redirect and clientSecret to confirm payment
    return res.status(201).json({
      sessionId,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    // 8️⃣ Error handling
    // Log error for debugging and return generic 500 response
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
