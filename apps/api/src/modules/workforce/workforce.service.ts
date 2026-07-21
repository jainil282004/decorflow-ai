import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CreateTeamDTO,
  UpdateTeamDTO,
  CreateEventAssignmentDTO,
  UpdateEventAssignmentDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateTaskChecklistDTO,
  CheckInDTO,
  CheckOutDTO,
} from '@decorflow/shared';

export class WorkforceService {
  // ==========================================
  // EMPLOYEES
  // ==========================================
  async findAllEmployees(companyId: string) {
    return prisma.employee.findMany({
      where: { companyId },
      include: { user: true, teamMemberships: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEmployeeById(id: string, companyId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id, companyId },
      include: {
        user: true,
        ledTeams: true,
        teamMemberships: true,
        eventAssignments: true,
        attendance: { take: 10, orderBy: { date: 'desc' } },
      },
    });
    if (!employee) throw new ApiError(404, 'Employee not found');
    return employee;
  }

  async createEmployee(companyId: string, data: CreateEmployeeDTO) {
    return prisma.employee.create({
      data: {
        companyId,
        ...data,
      },
      include: { user: true },
    });
  }

  async updateEmployee(id: string, companyId: string, data: UpdateEmployeeDTO) {
    await this.findEmployeeById(id, companyId);
    return prisma.employee.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  // ==========================================
  // TEAMS
  // ==========================================
  async findAllTeams(companyId: string) {
    return prisma.team.findMany({
      where: { companyId },
      include: { leader: { include: { user: true } }, members: { include: { user: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findTeamById(id: string, companyId: string) {
    const team = await prisma.team.findUnique({
      where: { id, companyId },
      include: {
        leader: { include: { user: true } },
        members: { include: { user: true } },
        eventAssignments: true,
      },
    });
    if (!team) throw new ApiError(404, 'Team not found');
    return team;
  }

  async createTeam(companyId: string, data: CreateTeamDTO) {
    const { memberIds, ...rest } = data;
    return prisma.team.create({
      data: {
        companyId,
        ...rest,
        members: memberIds ? { connect: memberIds.map((id) => ({ id })) } : undefined,
      },
      include: { leader: true, members: true },
    });
  }

  async updateTeam(id: string, companyId: string, data: UpdateTeamDTO) {
    await this.findTeamById(id, companyId);
    const { memberIds, ...rest } = data;
    return prisma.team.update({
      where: { id },
      data: {
        ...rest,
        members: memberIds ? { set: memberIds.map((mid) => ({ id: mid })) } : undefined,
      },
      include: { leader: true, members: true },
    });
  }

  // ==========================================
  // EVENT ASSIGNMENTS
  // ==========================================
  private async checkAssignmentConflict(
    employeeId: string | undefined,
    teamId: string | undefined,
    start: Date,
    end: Date,
    excludeId?: string
  ) {
    if (!employeeId && !teamId) return;

    const conflicts = await prisma.eventAssignment.findMany({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [{ employeeId: employeeId || undefined }, { teamId: teamId || undefined }],
        reportingTime: { lte: end },
        setupTime: { gte: start },
      },
    });

    if (conflicts.length > 0) {
      throw new ApiError(400, 'Scheduling conflict detected for the selected employee or team');
    }
  }

  async createEventAssignment(data: CreateEventAssignmentDTO) {
    if (data.reportingTime && data.setupTime) {
      const start = new Date(data.reportingTime);
      const end = new Date(data.setupTime);
      if (start >= end) {
        throw new ApiError(400, 'Setup time must be after reporting time');
      }
      await this.checkAssignmentConflict(data.employeeId, data.teamId, start, end);
    }

    return prisma.eventAssignment.create({
      data,
      include: { employee: { include: { user: true } }, team: true, event: true },
    });
  }

  // ==========================================
  // TASKS
  // ==========================================
  async findAllTasks(companyId: string) {
    return prisma.task.findMany({
      where: { companyId },
      include: { assignments: { include: { assignee: true } }, checklists: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTaskById(id: string, companyId: string) {
    const task = await prisma.task.findUnique({
      where: { id, companyId },
      include: { assignments: { include: { assignee: true } }, checklists: true },
    });
    if (!task) throw new ApiError(404, 'Task not found');
    return task;
  }

  async createTask(companyId: string, data: CreateTaskDTO) {
    const { assigneeIds, ...rest } = data;
    return prisma.task.create({
      data: {
        companyId,
        ...rest,
        assignments: assigneeIds
          ? {
              create: assigneeIds.map((id) => ({ assigneeId: id })),
            }
          : undefined,
      },
      include: { assignments: true },
    });
  }

  async updateTask(id: string, companyId: string, data: UpdateTaskDTO) {
    await this.findTaskById(id, companyId);
    const { assigneeIds, ...rest } = data;

    // Simplistic handling: if assigneeIds are provided, we delete old and recreate
    if (assigneeIds) {
      await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...rest,
        assignments: assigneeIds
          ? {
              create: assigneeIds.map((aid) => ({ assigneeId: aid })),
            }
          : undefined,
      },
      include: { assignments: { include: { assignee: true } }, checklists: true },
    });
  }

  async addTaskChecklist(taskId: string, companyId: string, data: CreateTaskChecklistDTO) {
    await this.findTaskById(taskId, companyId);
    return prisma.taskChecklistItem.create({
      data: {
        taskId,
        ...data,
      },
    });
  }

  async toggleTaskChecklist(
    itemId: string,
    taskId: string,
    companyId: string,
    isCompleted: boolean
  ) {
    await this.findTaskById(taskId, companyId);
    return prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: { isCompleted },
    });
  }

  // ==========================================
  // ATTENDANCE
  // ==========================================
  async checkIn(companyId: string, data: CheckInDTO) {
    // Basic check to ensure employee belongs to company
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId, companyId },
    });
    if (!employee) throw new ApiError(404, 'Employee not found');

    const date = new Date(data.date);
    date.setUTCHours(0, 0, 0, 0);

    return prisma.employeeAttendance.upsert({
      where: { employeeId_date: { employeeId: data.employeeId, date } },
      update: { checkIn: data.checkIn, shiftStart: data.shiftStart, status: data.status },
      create: {
        employeeId: data.employeeId,
        date,
        checkIn: data.checkIn,
        shiftStart: data.shiftStart,
        status: data.status,
      },
    });
  }

  async checkOut(id: string, companyId: string, data: CheckOutDTO) {
    // Basic verification could be added here
    return prisma.employeeAttendance.update({
      where: { id },
      data: { checkOut: data.checkOut, shiftEnd: data.shiftEnd, overtimeHours: data.overtimeHours },
    });
  }
}
