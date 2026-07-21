import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from './notification.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

// Middleware to ensure user is logged in
router.use(requireAuth);

// Base notification routes
router.get('/', requirePermission('notification.view'), getNotifications);
router.patch('/read-all', requirePermission('notification.manage'), markAllAsRead);
router.patch('/:id/read', requirePermission('notification.manage'), markAsRead);
router.delete('/:id', requirePermission('notification.manage'), deleteNotification);

// Preferences routes
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

export default router;
