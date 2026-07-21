import { Request, Response, NextFunction } from 'express';
import { WorkforceService } from './workforce.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  createTeamSchema,
  updateTeamSchema,
  createTaskSchema,
  updateTaskSchema,
  createTaskChecklistSchema,
  updateTaskChecklistSchema,
  checkInSchema,
  checkOutSchema,
} from '@decorflow/shared';

const workforceService = new WorkforceService();

export class WorkforceController {
  // ==========================================
  // EMPLOYEES
  // ==========================================
  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await workforceService.findAllEmployees(req.user!.companyId!);
      return sendSuccess(res, employees);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await workforceService.findEmployeeById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const employee = await workforceService.createEmployee(req.user!.companyId!, data);
      return sendCreated(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateEmployeeSchema.parse(req.body);
      const employee = await workforceService.updateEmployee(
        req.params.id,
        req.user!.companyId!,
        data
      );
      return sendSuccess(res, employee);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // TEAMS
  // ==========================================
  async getTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await workforceService.findAllTeams(req.user!.companyId!);
      return sendSuccess(res, teams);
    } catch (error) {
      next(error);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await workforceService.findTeamById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, team);
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamSchema.parse(req.body);
      const team = await workforceService.createTeam(req.user!.companyId!, data);
      return sendCreated(res, team);
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTeamSchema.parse(req.body);
      const team = await workforceService.updateTeam(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, team);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // TASKS
  // ==========================================
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await workforceService.findAllTasks(req.user!.companyId!);
      return sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await workforceService.findTaskById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await workforceService.createTask(req.user!.companyId!, data);
      return sendCreated(res, task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await workforceService.updateTask(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async addTaskChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaskChecklistSchema.parse(req.body);
      const checklist = await workforceService.addTaskChecklist(
        req.params.id,
        req.user!.companyId!,
        data
      );
      return sendCreated(res, checklist);
    } catch (error) {
      next(error);
    }
  }

  async toggleTaskChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { isCompleted } = req.body; // simplistic
      const checklist = await workforceService.toggleTaskChecklist(
        req.params.itemId,
        req.params.id,
        req.user!.companyId!,
        isCompleted
      );
      return sendSuccess(res, checklist);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ATTENDANCE
  // ==========================================
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = checkInSchema.parse(req.body);
      const attendance = await workforceService.checkIn(req.user!.companyId!, data);
      return sendCreated(res, attendance);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const data = checkOutSchema.parse(req.body);
      const attendance = await workforceService.checkOut(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, attendance);
    } catch (error) {
      next(error);
    }
  }
}
