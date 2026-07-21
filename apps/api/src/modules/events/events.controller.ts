import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { CreateEventSchema, UpdateEventSchema } from '@decorflow/shared';
import { ApiError } from '../../utils/errors';
import { sendSuccess, sendCreated } from '../../utils/response';

export class EventsController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const statusId = req.query.statusId as string;
      const typeId = req.query.typeId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await eventsService.findAll(
        req.user!.companyId!,
        page,
        limit,
        search,
        statusId,
        typeId,
        startDate,
        endDate
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventsService.findById(req.user!.companyId!, req.params.id);
      if (!event) {
        throw new ApiError(404, 'NOT_FOUND', 'Event not found');
      }
      return sendSuccess(res, event);
    } catch (error) {
      next(error);
    }
  }

  async getTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await eventsService.getTypes(req.user!.companyId!);
      return sendSuccess(res, types);
    } catch (error) {
      next(error);
    }
  }

  async getStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      const statuses = await eventsService.getStatuses(req.user!.companyId!);
      return sendSuccess(res, statuses);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateEventSchema.parse(req.body);
      const event = await eventsService.create(req.user!.companyId!, data);
      return sendCreated(res, event);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateEventSchema.parse(req.body);
      const event = await eventsService.update(req.user!.companyId!, req.params.id, data);
      return sendSuccess(res, event);
    } catch (error) {
      next(error);
    }
  }

  async archiveEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await eventsService.remove(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  async restoreEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await eventsService.restore(req.user!.companyId!, req.params.id);
      return sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  async duplicateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventsService.duplicate(req.user!.companyId!, req.params.id);
      return sendCreated(res, event);
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
