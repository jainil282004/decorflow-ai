import { Request, Response, NextFunction } from 'express';
import { CleaningService } from './cleaning.service';
import { sendSuccess } from '../../utils/response';
import { updateCleaningJobSchema } from '@decorflow/shared';

const cleaningService = new CleaningService();

export class CleaningController {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const overdue = req.query.overdue === 'true';
      const recentlyWashed = req.query.recentlyWashed === 'true';

      const result = await cleaningService.findAll(req.user!.companyId!, {
        page,
        limit,
        status,
        overdue,
        recentlyWashed,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const reminders = await cleaningService.findReminders(req.user!.companyId!);
      return sendSuccess(res, reminders);
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await cleaningService.findById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCleaningJobSchema.parse(req.body);
      const job = await cleaningService.update(
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
