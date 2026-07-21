import { Router } from 'express';
import { ProcurementController } from './procurement.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new ProcurementController();

router.use(requireAuth);

// Vendors
router.get('/vendors', requirePermission('vendor.view'), controller.getVendors);
router.get('/vendors/:id', requirePermission('vendor.view'), controller.getVendorById);
router.post('/vendors', requirePermission('vendor.create'), controller.createVendor);
router.patch('/vendors/:id', requirePermission('vendor.update'), controller.updateVendor);

// Requisitions
router.get('/requisitions', requirePermission('purchase.create'), controller.getRequisitions);
router.post('/requisitions', requirePermission('purchase.create'), controller.createRequisition);
router.patch(
  '/requisitions/:id/status',
  requirePermission('purchase.approve'),
  controller.updateRequisitionStatus
);

// Orders
router.get('/orders', requirePermission('purchase.create'), controller.getOrders);
router.get('/orders/:id', requirePermission('purchase.create'), controller.getOrderById);
router.post('/orders', requirePermission('purchase.create'), controller.createOrder);
router.patch(
  '/orders/:id/status',
  requirePermission('purchase.approve'),
  controller.updateOrderStatus
);

// GRN
router.post('/orders/:id/receive', requirePermission('grn.receive'), controller.receiveGoods);

// Analytics
router.get('/analytics/low-stock', requirePermission('purchase.create'), controller.getLowStock);

export const procurementRouter = router;
