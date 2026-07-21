import { Request, Response, NextFunction } from 'express';
import { PackingService } from './packing.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import {
  createPackingJobSchema,
  updatePackingItemSchema,
  verifyPackingSchema,
  dispatchJobSchema,
  receiveReturnSchema,
} from '@decorflow/shared';

const packingService = new PackingService();

export class PackingController {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await packingService.findAll(req.user!.companyId!, page, limit, status);
      return sendSuccess(res, result); // Has its own pagination format in result
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await packingService.findById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPackingJobSchema.parse(req.body);
      const job = await packingService.create(req.user!.companyId!, req.user!.id, data);
      return sendCreated(res, job);
    } catch (error) {
      next(error);
    }
  }

  async updateItems(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updatePackingItemSchema.parse(req.body);
      const job = await packingService.updatePackingItems(
        req.params.id,
        req.user!.companyId!,
        req.user!.id,
        data
      );
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  async verifyJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = verifyPackingSchema.parse(req.body);
      const job = await packingService.verifyJob(
        req.params.id,
        req.user!.companyId!,
        req.user!.id,
        data
      );
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  async dispatchJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dispatchJobSchema.parse(req.body);
      const job = await packingService.dispatchJob(
        req.params.id,
        req.user!.companyId!,
        req.user!.id,
        data
      );
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  async receiveReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const data = receiveReturnSchema.parse(req.body);
      const job = await packingService.receiveReturns(
        req.params.id,
        req.user!.companyId!,
        req.user!.id,
        data
      );
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }
}
