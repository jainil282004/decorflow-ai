import { z } from 'zod';

// ==========================================
// EMPLOYEE SCHEMAS
// ==========================================
export const createEmployeeSchema = z.object({
  userId: z.string().uuid(),
  employeeCode: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  joinDate: z.string().datetime().optional(),
  salary: z.number().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
  skills: z.string().optional(),
  certifications: z.string().optional(),
  contactNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// ==========================================
// TEAM SCHEMAS
// ==========================================
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  leaderId: z.string().uuid().optional(),
  capacity: z.number().int().optional(),
  skills: z.string().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

// ==========================================
// EVENT ASSIGNMENT SCHEMAS
// ==========================================
export const createEventAssignmentSchema = z.object({
  eventId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  role: z.string().min(1, 'Role is required'),
  reportingTime: z.string().datetime().optional(),
  setupTime: z.string().datetime().optional(),
  eventDuty: z.enum(['SETUP', 'DISMANTLING', 'BOTH']),
  status: z.enum(['PENDING', 'COMPLETED']).default('PENDING'),
});

export const updateEventAssignmentSchema = createEventAssignmentSchema.partial();

// ==========================================
// TASK SCHEMAS
// ==========================================
export const createTaskSchema = z.object({
  eventId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  progress: z.number().int().min(0).max(100).default(0),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const createTaskChecklistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isCompleted: z.boolean().default(false),
});

export const updateTaskChecklistSchema = createTaskChecklistSchema.partial();

// ==========================================
// ATTENDANCE SCHEMAS
// ==========================================
export const checkInSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().datetime(), // Usually midnight UTC for the day
  checkIn: z.string().datetime(),
  shiftStart: z.string().datetime().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY']).default('PRESENT'),
});

export const checkOutSchema = z.object({
  checkOut: z.string().datetime(),
  shiftEnd: z.string().datetime().optional(),
  overtimeHours: z.number().optional(),
});

// ==========================================
// TYPES
// ==========================================
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;

export type CreateTeamDTO = z.infer<typeof createTeamSchema>;
export type UpdateTeamDTO = z.infer<typeof updateTeamSchema>;

export type CreateEventAssignmentDTO = z.infer<typeof createEventAssignmentSchema>;
export type UpdateEventAssignmentDTO = z.infer<typeof updateEventAssignmentSchema>;

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

export type CreateTaskChecklistDTO = z.infer<typeof createTaskChecklistSchema>;
export type UpdateTaskChecklistDTO = z.infer<typeof updateTaskChecklistSchema>;

export type CheckInDTO = z.infer<typeof checkInSchema>;
export type CheckOutDTO = z.infer<typeof checkOutSchema>;
