import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

router.use(requireAuth);

router.get('/categories', requirePermission('inventory.view'), inventoryController.getCategories);

router.get('/', requirePermission('inventory.view'), inventoryController.getItems);

router.post('/', requirePermission('inventory.create'), inventoryController.createItem);

router.get('/:id', requirePermission('inventory.view'), inventoryController.getItem);

router.patch('/:id', requirePermission('inventory.update'), inventoryController.updateItem);

router.delete('/:id', requirePermission('inventory.archive'), inventoryController.archiveItem);

router.post(
  '/:id/restore',
  requirePermission('inventory.restore'),
  inventoryController.restoreItem
);

export default router;
