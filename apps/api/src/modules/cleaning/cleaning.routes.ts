import { Router } from 'express';
import { CleaningController } from './cleaning.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new CleaningController();

router.use(requireAuth);

router.get('/', requirePermission('inventory.view'), controller.getJobs);
router.get('/reminders', requirePermission('inventory.view'), controller.getReminders);
router.get('/:id', requirePermission('inventory.view'), controller.getJobById);
router.patch('/:id', requirePermission('return.receive'), controller.updateJob);

export { router as cleaningRouter };
