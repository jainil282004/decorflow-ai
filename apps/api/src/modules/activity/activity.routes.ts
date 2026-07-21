import { Router } from 'express';
import { getGlobalFeed, getTimeline } from './activity.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

// Middleware to ensure user is logged in
router.use(requireAuth);

router.get('/feed', requirePermission('activity.view'), getGlobalFeed);
router.get('/timeline/:entityType/:entityId', requirePermission('timeline.view'), getTimeline);

export default router;
