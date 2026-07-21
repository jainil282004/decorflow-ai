import { Router } from 'express';
import { WorkforceController } from './workforce.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new WorkforceController();

router.use(requireAuth);

// Employees
router.get('/employees', requirePermission('employee.view'), controller.getEmployees);
router.get('/employees/:id', requirePermission('employee.view'), controller.getEmployeeById);
router.post('/employees', requirePermission('employee.create'), controller.createEmployee);
router.patch('/employees/:id', requirePermission('employee.update'), controller.updateEmployee);

// Teams
router.get('/teams', requirePermission('team.manage'), controller.getTeams);
router.get('/teams/:id', requirePermission('team.manage'), controller.getTeamById);
router.post('/teams', requirePermission('team.manage'), controller.createTeam);
router.patch('/teams/:id', requirePermission('team.manage'), controller.updateTeam);

// Tasks
router.get('/tasks', requirePermission('task.assign'), controller.getTasks);
router.get('/tasks/:id', requirePermission('task.assign'), controller.getTaskById);
router.post('/tasks', requirePermission('task.create'), controller.createTask);
router.patch('/tasks/:id', requirePermission('task.assign'), controller.updateTask);
router.post('/tasks/:id/checklist', requirePermission('task.assign'), controller.addTaskChecklist);
router.patch(
  '/tasks/:id/checklist/:itemId',
  requirePermission('task.assign'),
  controller.toggleTaskChecklist
);

// Attendance
router.post('/attendance/check-in', requirePermission('attendance.manage'), controller.checkIn);
router.patch(
  '/attendance/:id/check-out',
  requirePermission('attendance.manage'),
  controller.checkOut
);

export const workforceRouter = router;
