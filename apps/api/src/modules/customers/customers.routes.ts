import { Router } from 'express';
import { customersController } from './customers.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

// Apply auth middleware to all customer routes
router.use(requireAuth);

router.get('/', requirePermission('customers:read'), customersController.getCustomers);

router.get('/:id', requirePermission('customers:read'), customersController.getCustomer);

router.post('/', requirePermission('customers:create'), customersController.createCustomer);

router.patch('/:id', requirePermission('customers:update'), customersController.updateCustomer);

router.delete('/:id', requirePermission('customers:archive'), customersController.archiveCustomer);

router.post(
  '/:id/restore',
  requirePermission('customers:restore'),
  customersController.restoreCustomer
);

export default router;
