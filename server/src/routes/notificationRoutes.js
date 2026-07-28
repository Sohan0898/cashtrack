import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
  updateNotificationPreferences,
  getNotificationPreferences,
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/subscribe', protect, subscribeToNotifications);
router.post('/unsubscribe', protect, unsubscribeFromNotifications);
router.put('/preferences', protect, updateNotificationPreferences);
router.get('/preferences', protect, getNotificationPreferences);

export default router;
