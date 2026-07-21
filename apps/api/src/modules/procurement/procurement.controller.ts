import { Request, Response, NextFunction } from 'express';
import { ProcurementService } from './procurement.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import {
  createVendorSchema,
  updateVendorSchema,
  createPurchaseRequisitionSchema,
  updatePurchaseRequisitionSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  createGoodsReceiptSchema,
} from '@decorflow/shared';

const procurementService = new ProcurementService();

export class ProcurementController {
  // ==========================================
  // VENDORS
  // ==========================================
  async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const vendors = await procurementService.findAllVendors(req.user!.companyId!);
      return sendSuccess(res, vendors);
    } catch (error) {
      next(error);
    }
  }

  async getVendorById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await procurementService.findVendorById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, vendor);
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVendorSchema.parse(req.body);
      const vendor = await procurementService.createVendor(req.user!.companyId!, data);
      return sendCreated(res, vendor);
    } catch (error) {
      next(error);
    }
  }

  async updateVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateVendorSchema.parse(req.body);
      const vendor = await procurementService.updateVendor(
        req.params.id,
        req.user!.companyId!,
        data
      );
      return sendSuccess(res, vendor);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // REQUISITIONS
  // ==========================================
  async getRequisitions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await procurementService.findAllRequisitions(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createRequisition(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPurchaseRequisitionSchema.parse(req.body);
      const reqDoc = await procurementService.createRequisition(req.user!.companyId!, data);
      return sendCreated(res, reqDoc);
    } catch (error) {
      next(error);
    }
  }

  async updateRequisitionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updatePurchaseRequisitionSchema.parse(req.body);
      const reqDoc = await procurementService.updateRequisitionStatus(
        req.params.id,
        req.user!.companyId!,
        status
      );
      return sendSuccess(res, reqDoc);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await procurementService.findAllOrders(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await procurementService.findOrderById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPurchaseOrderSchema.parse(req.body);
      const order = await procurementService.createOrder(req.user!.companyId!, data);
      return sendCreated(res, order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updatePurchaseOrderSchema.parse(req.body);
      const order = await procurementService.updateOrderStatus(
        req.params.id,
        req.user!.companyId!,
        status
      );
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // GOODS RECEIPT
  // ==========================================
  async receiveGoods(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGoodsReceiptSchema.parse(req.body);
      const grn = await procurementService.receiveGoods(
        req.params.id,
        req.user!.companyId!,
        req.user!.id,
        data
      );
      return sendCreated(res, grn);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ANALYTICS
  // ==========================================
  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await procurementService.getLowStockItems(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
