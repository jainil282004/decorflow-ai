import { Request, Response, NextFunction } from 'express';
import { activityService } from './activity.service';
import { sendSuccess } from '../../utils/response';

export const getGlobalFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await activityService.getGlobalFeed(
      req.user!.companyId!,
      Number(page),
      Number(limit)
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId } = req.params;
    const timeline = await activityService.getTimeline(req.user!.companyId!, entityType, entityId);
    return sendSuccess(res, timeline);
  } catch (error) {
    next(error);
  }
};
