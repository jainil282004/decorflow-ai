import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { CreateInventoryItemSchema, UpdateInventoryItemSchema } from '@decorflow/shared';
import { sendSuccess, sendCreated } from '../../utils/response';

export class InventoryController {
  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;

      const result = await inventoryService.findAll(
        req.user!.companyId!,
        page,
        limit,
        search,
        categoryId
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.findById(req.user!.companyId!, req.params.id);
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await inventoryService.getCategories(req.user!.companyId!);
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateInventoryItemSchema.parse(req.body);
      const item = await inventoryService.create(req.user!.companyId!, data);
      return sendCreated(res, item);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateInventoryItemSchema.parse(req.body);
      const item = await inventoryService.update(req.user!.companyId!, req.params.id, data);
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async archiveItem(req: Request, res: Response, next: NextFunction) {
    try {
      await inventoryService.archive(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  async restoreItem(req: Request, res: Response, next: NextFunction) {
    try {
      await inventoryService.restore(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
