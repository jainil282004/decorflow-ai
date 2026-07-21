import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth);

router.get('/executive', requirePermission('dashboard.view'), controller.getExecutiveSummary);
router.get('/financial', requirePermission('analytics.view'), controller.getFinancialAnalytics);
router.get('/inventory', requirePermission('analytics.view'), controller.getInventoryAnalytics);
router.get('/customers', requirePermission('analytics.view'), controller.getCustomerAnalytics);

router.get('/reports', requirePermission('reports.view'), controller.getSavedReports);
router.post('/reports', requirePermission('reports.view'), controller.saveReport);

export const analyticsRouter = router;
