import { z } from 'zod';

export const saveReportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['FINANCIAL', 'INVENTORY', 'EVENT', 'WORKFORCE', 'CUSTOMER']),
  config: z.record(z.any()),
});

export const scheduleReportSchema = z.object({
  reportId: z.string().uuid(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
});

export type SaveReportDTO = z.infer<typeof saveReportSchema>;
export type ScheduleReportDTO = z.infer<typeof scheduleReportSchema>;
