import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { saveReportSchema } from '@decorflow/shared';
import { sendSuccess, sendCreated } from '../../utils/response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getExecutiveSummary(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getFinancialAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getFinancialAnalytics(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getInventoryAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getInventoryAnalytics(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCustomerAnalytics(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async saveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = saveReportSchema.parse(req.body);
      const result = await analyticsService.saveReport(req.user!.companyId!, data);
      return sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSavedReports(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getSavedReports(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
