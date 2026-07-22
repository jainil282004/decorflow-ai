import { Router } from 'express';
import { PackingController } from './packing.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new PackingController();

// All routes require authentication
router.use(requireAuth);

// Packing Job Routes
router.get('/', requirePermission('packing.view'), controller.getJobs);
router.get('/:id', requirePermission('packing.view'), controller.getJobById);
router.post('/', requirePermission('packing.create'), controller.createJob);
router.patch('/:id', requirePermission('packing.update'), controller.updateItems);

// Workflow Action Routes
router.post('/:id/start', requirePermission('packing.update'), controller.startPacking);
router.post('/:id/verify', requirePermission('packing.verify'), controller.verifyJob);
router.post('/:id/dispatch', requirePermission('dispatch.create'), controller.dispatchJob);
router.post('/:id/return', requirePermission('return.receive'), controller.receiveReturns);

export { router as packingRouter };
