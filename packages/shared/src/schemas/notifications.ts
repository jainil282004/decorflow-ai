import { z } from 'zod';

// ==========================================
// NOTIFICATIONS
// ==========================================
export const NotificationResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  icon: z.string().nullable().optional(),
  module: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  createdById: z.string().nullable().optional(),
  priority: z.string(),
  link: z.string().nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.date().or(z.string()),
});

export type NotificationResponseDTO = z.infer<typeof NotificationResponseSchema>;

export const CreateNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['SUCCESS', 'WARNING', 'ERROR', 'INFO']).default('INFO'),
  icon: z.string().optional(),
  module: z.string().optional(),
  entityId: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('LOW'),
  link: z.string().optional(),
});

export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>;

// ==========================================
// NOTIFICATION PREFERENCES
// ==========================================
export const NotificationPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  mutedModules: z.string().nullable().optional(), // JSON
  priorityThreshold: z.string(),
});

export type NotificationPreferenceDTO = z.infer<typeof NotificationPreferenceSchema>;

export const UpdateNotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  mutedModules: z.string().optional(),
  priorityThreshold: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
});

export type UpdateNotificationPreferenceDTO = z.infer<typeof UpdateNotificationPreferenceSchema>;

// ==========================================
// ACTIVITY LOG & TIMELINE
// ==========================================
export const ActivityLogResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  userId: z.string().nullable().optional(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.string().nullable().optional(), // JSON
  createdAt: z.date().or(z.string()),
});

export type ActivityLogResponseDTO = z.infer<typeof ActivityLogResponseSchema>;

export const CreateActivityLogSchema = z.object({
  action: z.string(), // CREATED, UPDATED, APPROVED, REJECTED, DELETED, ASSIGNED, COMPLETED, DISPATCHED
  entityType: z.string(),
  entityId: z.string(),
  details: z.string().optional(), // JSON
});

export type CreateActivityLogDTO = z.infer<typeof CreateActivityLogSchema>;

// ==========================================
// REMINDERS
// ==========================================
export const ReminderResponseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  type: z.string(),
  entityId: z.string(),
  title: z.string(),
  dueDate: z.date().or(z.string()),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ReminderResponseDTO = z.infer<typeof ReminderResponseSchema>;

export const CreateReminderSchema = z.object({
  type: z.string(),
  entityId: z.string(),
  title: z.string(),
  dueDate: z.string(), // ISO string
});

export type CreateReminderDTO = z.infer<typeof CreateReminderSchema>;
