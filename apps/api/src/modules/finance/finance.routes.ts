import { Router } from 'express';
import { FinanceController } from './finance.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new FinanceController();

router.use(requireAuth);

// Quotations
router.get('/quotations', requirePermission('invoice.view'), controller.getQuotations);
router.get('/quotations/:id', requirePermission('invoice.view'), controller.getQuotationById);
router.post('/quotations', requirePermission('invoice.create'), controller.createQuotation);
router.patch(
  '/quotations/:id/status',
  requirePermission('invoice.update'),
  controller.updateQuotationStatus
);

// Invoices & Payments
router.get('/invoices', requirePermission('invoice.view'), controller.getInvoices);
router.get('/invoices/:id', requirePermission('invoice.view'), controller.getInvoiceById);
router.post('/invoices', requirePermission('invoice.create'), controller.createInvoice);
router.patch(
  '/invoices/:id/status',
  requirePermission('invoice.update'),
  controller.updateInvoiceStatus
);
router.post('/payments', requirePermission('payment.record'), controller.recordPayment);

// Vendor Bills & Payments
router.get('/vendor-bills', requirePermission('finance.view'), controller.getVendorBills);
router.post('/vendor-bills', requirePermission('expense.manage'), controller.createVendorBill);
router.post(
  '/vendor-payments',
  requirePermission('payment.record'),
  controller.recordVendorPayment
);

// Expenses
router.get('/expenses', requirePermission('finance.view'), controller.getExpenses);
router.post('/expenses', requirePermission('expense.manage'), controller.createExpense);
router.patch(
  '/expenses/:id/status',
  requirePermission('expense.manage'),
  controller.updateExpenseStatus
);

// Analytics
router.get('/analytics/cash-flow', requirePermission('finance.view'), controller.getCashFlow);

export const financeRouter = router;
