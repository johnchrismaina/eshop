// import { ValidationError } from '@eshop/error-handler';
import { prisma } from '@eshop/libs/prisma';
import redis from '@eshop/redis';
import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
// import { Prisma } from '@prisma/client';
import { sendEmail } from '../utils/send-email';
import { getStripeClient } from '../utils/stripe-client';
import { NotFoundError, ValidationError } from '@eshop/error-handler';
// import { ReceiverType, NotificationStatus } from '@prisma/client';

// Local type for embedded actions
// type ActionEntry = {
//   productId: string | null;
//   shopId: string | null;
//   action: string;
//   timestamp: Date; // ✅ matches schema DateTime
// };

// Create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  const customerAmount = Math.round(amount * 100);
  // const platformFee = Math.floor(customerAmount * 0.1);

  console.log(sellerStripeAccountId);

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      // application_fee_amount: platformFee,
      // transfer_data: {
      //   destination: sellerStripeAccountId,
      // },
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, coupon, selectedAddressId, userId } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid.' });
    }

    // Calculate total
    const totalAmount = cart.reduce(
      (sum: number, item: any) => sum + item.sale_price * item.quantity,
      0
    );

    // 🔎 1. Check Redis for existing session
    const existingKeys = await redis.keys(`payment-session:*`);
    const existingKey = existingKeys.find(async (key) => {
      const data = await redis.get(key);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed.userId === userId;
    });

    if (existingKey) {
      const sessionData = await redis.get(existingKey);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // ✅ Return the same sessionId and payload
        return res.status(200).json(session);
      }
    }

    // 🆕 2. Otherwise create a new PaymentIntent
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'usd',
      metadata: { userId },
    });

    const sessionId = crypto.randomUUID();
    const sessionPayload = {
      sessionId,
      userId,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
      cart,
      coupon,
      selectedAddressId,
    };

    await redis.set(
      `payment-session:${sessionId}`,
      JSON.stringify(sessionPayload),
      'EX',
      60 * 30 // 30 minutes TTL
    );

    console.log('Saved session to Redis:', sessionId);

    return res.status(200).json(sessionPayload);
  } catch (error) {
    return next(error);
  }
};

// GET /order/api/payment-session/:sessionId
export const getPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found or expired.' });
    }

    let session;
    try {
      session = JSON.parse(sessionData);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse session data.' });
    }

    // Return the session fields directly
    return res.status(200).json({
      success: true,
      clientSecret: session.clientSecret,
      totalAmount: session.totalAmount,
      cart: session.cart,
      coupon: session.coupon,
    });
  } catch (error) {
    return next(error);
  }
};

// Create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      console.error('❌ Missing Stripe signature');
      return res.status(400).send('Missing Stripe signature');
    }

    // ✅ When using bodyParser.raw(), req.body IS the Buffer
    // Do NOT use (req as any).rawBody - that was the old workaround
    const rawBody = req.body;

    let event;
    const stripe = getStripeClient();
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('✅ Webhook verified successfully');
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('📦 Webhook event type:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      console.log('💳 Processing payment_intent.succeeded event');
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      console.log('📋 Session ID:', sessionId);
      console.log('👤 User ID:', userId);

      // ✅ Stripe always sends amount in cents → convert to dollars
      const stripeAmount = paymentIntent.amount / 100;
      console.log('💰 Stripe Amount:', stripeAmount);

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn('⚠️  Session data expired or missing for', sessionKey);
        return res
          .status(200)
          .send('No session found, skipping order creation');
      }

      console.log('✅ Found session data in Redis');

      // ⚠️ Do NOT trust totalAmount from Redis here
      const { cart, shippingAddressId, coupon } = JSON.parse(sessionData);

      console.log('🛒 Cart items:', cart.length);
      console.log('📍 Shipping Address ID:', shippingAddressId);

      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user) {
        console.error('❌ User not found:', userId);
        return res.status(400).send('User not found');
      }
      const name = user.name;
      const email = user.email;

      console.log('👤 User found:', name, email);

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      console.log('🏪 Shops in order:', Object.keys(shopGrouped));

      for (const shopId in shopGrouped) {
        console.log(`\n📦 Processing shop: ${shopId}`);
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

        console.log('💵 Order total before discount:', orderTotal);

        // Apply discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            orderTotal -= discount;
            console.log('🎉 Discount applied:', discount);
          }
        }

        console.log('💵 Final order total:', orderTotal);

        try {
          // Create order in DB
          const createdOrder = await prisma.orders.create({
            data: {
              userId: userId,
              shopId: shopId,
              total: orderTotal, // ✅ per-shop total
              status: 'Paid',
              deliveryStatus: 'Ordered',
              shippingAddressId: shippingAddressId || null,
              couponCode: coupon?.code || null,
              discountAmount: coupon?.discountAmount ?? 0,
              items: {
                create: orderItems.map((item: any) => ({
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.sale_price,
                  selectedOptions: item.selectedOptions ?? {},
                })),
              },
            },
          });

          console.log('✅ Order created:', createdOrder.id);
        } catch (err: any) {
          console.error('❌ Error creating order:', err.message);
          console.error('Error details:', err);
          throw err;
        }

        // … stock updates, analytics, notifications unchanged …

        // ✅ Use stripeAmount for email total
        try {
          await sendEmail(
            email,
            '🛍 Your Eshop Order Confirmation',
            'order-confirmation',
            {
              name,
              cart,
              totalAmount: coupon?.discountAmount
                ? stripeAmount - coupon?.discountAmount
                : stripeAmount,
              trackingUrl: `https://eshop.com/order/${sessionId}`,
            }
          );
          console.log('✅ Confirmation email sent');
        } catch (err: any) {
          console.error('❌ Error sending email:', err.message);
        }

        try {
          await redis.del(sessionKey);
          console.log('✅ Session cleared from Redis');
        } catch (err: any) {
          console.error('❌ Error clearing session:', err.message);
        }
      }

      console.log('✅ All orders processed successfully');
    } else {
      console.log('⏭️  Ignoring event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return next(error);
  }
};

// get sellers orders
export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // get shop information based on the logged in seller
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId: req.seller.id,
      },
    });

    // fetch all orders for this shop
    const orders = await prisma.orders.findMany({
      where: {
        shopId: shop?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {}
};

// get order details
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new NotFoundError('Order not found with the id!'));
    }

    const shippingAddress = order.shippingAddressId
      ? await prisma.address.findUnique({
          where: {
            id: order?.shippingAddressId,
          },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma?.discount_codes.findUnique({
          where: {
            discountCode: order.couponCode,
          },
        })
      : null;

    // fetch all products details in one go
    const productIds = order.items.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = order.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// update order status
export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return res
        .status(400)
        .json({ error: 'Order ID and delivery status are required.' });
    }

    const allowedStatuses = [
      'Ordered',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError('Invalid delivery status provided.'));
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return next(new NotFoundError('Order not found with the provided ID.'));
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

// verify coupon code
export const verifyCouponCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;

    if (!couponCode || !cart || cart.length === 0) {
      return next(new ValidationError('Coupon code and cart are required!'));
    }

    // fetch the discount code
    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(
        new ValidationError('The coupon code you entered is invalid')
      );
    }

    // Find matching product that includes this discount code
    const matchingProduct = cart.find((item: any) =>
      item.discount_codes?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: 'No matching product found in cart for this coupon.',
      });
    }

    let discountAmount = 0;
    const price = matchingProduct.sale_price * matchingProduct.quantity;

    if (discount.discountType === 'percentage') {
      discountAmount = (price * discount.discountValue) / 100;
    } else if (discount.discountType === 'flat') {
      discountAmount = discount.discountValue;
    }

    // Prevent discount from being greater than total price
    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: 'Discount applied to 1 eligible product',
    });
  } catch (error) {
    next(error);
  }
};

// get user orders
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};
