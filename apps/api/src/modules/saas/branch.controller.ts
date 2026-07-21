import { Request, Response, NextFunction } from 'express';
import { BranchService } from './branch.service';
import { createBranchSchema, updateBranchSchema } from '@decorflow/shared';
import { sendSuccess, sendCreated } from '../../utils/response';

const branchService = new BranchService();

export class BranchController {
  async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await branchService.getBranches(req.user!.companyId!);
      return sendSuccess(res, branches);
    } catch (error) {
      next(error);
    }
  }

  async getBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await branchService.getBranch(req.params.id, req.user!.companyId!);
      return sendSuccess(res, branch);
    } catch (error) {
      next(error);
    }
  }

  async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBranchSchema.parse(req.body);
      const branch = await branchService.createBranch(req.user!.companyId!, data);
      return sendCreated(res, branch);
    } catch (error) {
      next(error);
    }
  }

  async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateBranchSchema.parse(req.body);
      const branch = await branchService.updateBranch(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, branch);
    } catch (error) {
      next(error);
    }
  }
}
