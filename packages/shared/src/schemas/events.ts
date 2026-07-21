import { z } from 'zod';
import { VenueResponseDTO } from './venues';
import { CustomerResponseDTO } from './customers';

export const CreateEventSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  typeId: z.string().uuid(),
  statusId: z.string().uuid(),
  theme: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  setupDate: z.string().datetime().optional().nullable(),
  dismantleDate: z.string().datetime().optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  expectedRevenue: z.number().positive().optional(),
  venueId: z.string().uuid().optional().nullable(),
  totalAmount: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;

export interface EventResponseDTO {
  id: string;
  companyId: string;
  customerId: string;
  title: string;
  typeId: string;
  statusId: string;
  theme?: string | null;
  priority?: string | null;
  startDate: string;
  endDate: string;
  setupDate?: string | null;
  dismantleDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  guestCount?: number | null;
  budget?: number | null;
  expectedRevenue?: number | null;
  venueId?: string | null;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Relations
  venue?: VenueResponseDTO | null;
  customer?: CustomerResponseDTO | null;
  status?: { id: string; name: string; color?: string | null; isTerminal: boolean };
  type?: { id: string; name: string; color?: string | null };
}
