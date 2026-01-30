import { NextFunction, Response } from 'express';
import { ValidationError } from '../packages/error-handler';

// fetching notifications for sellers
export const sellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: sellerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// mark notifications as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError('Notification id is required!'));
    }

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: 'Read' },
    });

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
