import { Request, Response, NextFunction } from 'express';
import { customersService } from './customers.service';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@decorflow/shared';
import { ApiError } from '../../utils/errors';
import { sendSuccess, sendCreated } from '../../utils/response';

export class CustomersController {
  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await customersService.findAll(req.user!.companyId!, page, limit, search);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customersService.findById(req.user!.companyId!, req.params.id);
      if (!customer) {
        throw new ApiError(404, 'NOT_FOUND', 'Customer not found');
      }
      return sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateCustomerSchema.parse(req.body);
      const customer = await customersService.create(req.user!.companyId!, data);
      return sendCreated(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateCustomerSchema.parse(req.body);
      const customer = await customersService.update(req.user!.companyId!, req.params.id, data);
      return sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async archiveCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      await customersService.remove(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  async restoreCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      await customersService.restore(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }
}

export const customersController = new CustomersController();
