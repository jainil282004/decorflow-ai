import { Router } from 'express';
import { eventsController } from './events.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

router.get('/types', requirePermission('event.view'), eventsController.getTypes);

router.get('/statuses', requirePermission('event.view'), eventsController.getStatuses);

router.get('/', requirePermission('event.view'), eventsController.getEvents);

router.post('/', requirePermission('event.create'), eventsController.createEvent);

router.get('/:id', requirePermission('event.view'), eventsController.getEvent);

router.patch('/:id', requirePermission('event.update'), eventsController.updateEvent);

router.delete('/:id', requirePermission('event.delete'), eventsController.archiveEvent);

router.post('/:id/restore', requirePermission('event.restore'), eventsController.restoreEvent);

router.post(
  '/:id/duplicate',
  requirePermission('event.duplicate'),
  eventsController.duplicateEvent
);

export default router;
