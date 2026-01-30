import express from 'express';

const router = express.Router();

router.get(
  '/seller-notifications',
  isAuthenticated,
  isSeller,
  sellerNotifications
);
router.post(
  '/mark-notification-as-read',
  isAuthenticated,
  markNotificationAsRead
);

export default router;
