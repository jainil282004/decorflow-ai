import { Request, Response, NextFunction } from 'express';
import { FinanceService } from './finance.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import {
  createQuotationSchema,
  updateQuotationStatusSchema,
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  recordPaymentSchema,
  createVendorBillSchema,
  recordVendorPaymentSchema,
  createExpenseSchema,
  updateExpenseStatusSchema,
} from '@decorflow/shared';

const financeService = new FinanceService();

export class FinanceController {
  // Quotations
  async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findAllQuotations(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getQuotationById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findQuotationById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createQuotationSchema.parse(req.body);
      const result = await financeService.createQuotation(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateQuotationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateQuotationStatusSchema.parse(req.body);
      const result = await financeService.updateQuotationStatus(
        req.params.id,
        req.user!.companyId!,
        status
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Invoices
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findAllInvoices(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findInvoiceById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const result = await financeService.createInvoice(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateInvoiceStatusSchema.parse(req.body);
      const result = await financeService.updateInvoiceStatus(
        req.params.id,
        req.user!.companyId!,
        status
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = recordPaymentSchema.parse(req.body);
      const result = await financeService.recordPayment(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Vendor Bills
  async getVendorBills(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findAllVendorBills(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createVendorBill(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVendorBillSchema.parse(req.body);
      const result = await financeService.createVendorBill(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async recordVendorPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = recordVendorPaymentSchema.parse(req.body);
      const result = await financeService.recordVendorPayment(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Expenses
  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.findAllExpenses(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createExpenseSchema.parse(req.body);
      const result = await financeService.createExpense(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateExpenseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateExpenseStatusSchema.parse(req.body);
      const result = await financeService.updateExpenseStatus(
        req.params.id,
        req.user!.companyId!,
        status,
        req.user!.id
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Analytics
  async getCashFlow(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getCashFlow(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
