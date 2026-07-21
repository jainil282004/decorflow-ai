import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';
import { UpdateNotificationPreferenceSchema } from '@decorflow/shared';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getNotifications(
      req.user!.id,
      req.user!.companyId!,
      Number(page),
      Number(limit)
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(req.user!.id, id);
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id, req.user!.companyId!);
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await notificationService.delete(req.user!.id, id);
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await notificationService.getPreferences(req.user!.id);
    return sendSuccess(res, prefs);
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateNotificationPreferenceSchema.parse(req.body);
    const prefs = await notificationService.updatePreferences(req.user!.id, validatedData);
    return sendSuccess(res, prefs);
  } catch (error) {
    next(error);
  }
};
