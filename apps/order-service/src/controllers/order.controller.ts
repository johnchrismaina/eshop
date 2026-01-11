// import { ValidationError } from '@eshop/error-handler';
import { prisma } from '@eshop/libs/prisma';
import redis from '@eshop/redis';
import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { sendEmail } from '../utils/send-email';
import { ReceiverType, NotificationStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Local type for embedded actions
type ActionEntry = {
  productId: string | null;
  shopId: string | null;
  action: string;
  timestamp: Date; // ✅ matches schema DateTime
};

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
      return res.status(400).send('Missing Stripe signature');
    }

    const rawBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn('Session data expired or missing for', sessionId);
        return res
          .status(200)
          .send('No session found, skipping order creation');
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

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
          }
        }

        // Define a type for order items
        type OrderItemInput = {
          id: string;
          quantity: number;
          sale_price: number;
          selectedOptions?: Record<string, any>; // or a stricter type if you know the shape
        };

        // Create order
        await prisma.order.create({
          data: {
            user: { connect: { id: userId } }, // ✅ relational connect
            shop: { connect: { id: shopId } }, // ✅ relational connect
            total: orderTotal,
            status: 'Paid',
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount ?? 0,
            items: {
              create: orderItems.map((item: OrderItemInput) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions ?? {}, // ✅ JSON-safe default
              })),
            },
          },
        });

        // Update product & analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });

          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });

          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          });

          // const newAction = {
          //   productId,
          //   shopId,
          //   action: 'purchase',
          //   timestamp: Date.now(),
          // };

          const newAction: ActionEntry = {
            productId,
            shopId,
            action: 'purchase',
            timestamp: new Date(), // ✅ Date works here
          };

          // const currentActions = Array.isArray(existingAnalytics?.actions)
          //   ? (existingAnalytics.actions as Prisma.JsonArray)
          //   : [];

          const currentActions: ActionEntry[] = Array.isArray(
            existingAnalytics?.actions
          )
            ? (existingAnalytics.actions as unknown as ActionEntry[])
            : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            });
          }
        }

        // Send email for user
        await sendEmail(
          email,
          '🛍 Your Eshop Order Confirmation',
          'order-confirmation',
          {
            name,
            cart,
            totalAmount: coupon?.discountAmount
              ? totalAmount - coupon?.discountAmount
              : totalAmount,
            trackingUrl: `https://eshop.com/order/${sessionId}`,
          }
        );

        // Create notifications for sellers
        const createdShopIds = Object.keys(shopGrouped);
        const sellerShops = await prisma.shops.findMany({
          where: { id: { in: createdShopIds } },
          select: {
            id: true,
            sellerId: true,
            name: true,
          },
        });

        // Collect seller notifications
        // Explicit type annotation here
        const notificationsData: Prisma.NotificationCreateManyInput[] =
          sellerShops.map((shop) => {
            const firstProduct = shopGrouped[shop.id][0];
            const productTitle = firstProduct?.title || 'new item';

            return {
              title: '🛒 New Order Received',
              message: `A customer just ordered ${productTitle} from your shop.`,
              creatorId: userId,
              receiverId: shop.sellerId,
              receiverType: ReceiverType.SELLER, // ✅ enum
              redirect_link: `https://eshop.com/order/${sessionId}`,
              status: NotificationStatus.UNREAD, // ✅ enum
            };
          });

        // Add admin notification
        notificationsData.push({
          title: '📦 Platform Order Alert',
          message: `A new order was placed by ${name}.`,
          creatorId: userId,
          receiverId: 'admin',
          receiverType: ReceiverType.ADMIN, // ✅ enum
          redirect_link: `https://eshop.com/order/${sessionId}`,
          status: NotificationStatus.UNREAD,
        });

        // Add customer notification
        notificationsData.push({
          title: '✅ Order Confirmation',
          message: `Thanks ${name}, your order has been placed successfully!`,
          creatorId: userId,
          receiverId: userId,
          receiverType: ReceiverType.CUSTOMER, // ✅ enum
          redirect_link: `https://eshop.com/order/${sessionId}`,
          status: NotificationStatus.UNREAD,
        });

        // Create all notifications in one go
        // await prisma.notifications.createMany({
        //   data: notificationsData,
        // });
        try {
          await prisma.notification.createMany({ data: notificationsData });
        } catch (error) {
          console.error('Failed to create notifications:', error);
        }

        await redis.del(sessionKey);
      }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
