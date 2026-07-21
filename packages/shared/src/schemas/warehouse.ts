import { z } from 'zod';

export const CreateWarehouseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema.partial();

export type CreateWarehouseDTO = z.infer<typeof CreateWarehouseSchema>;
export type UpdateWarehouseDTO = z.infer<typeof UpdateWarehouseSchema>;

export interface WarehouseResponseDTO {
  id: string;
  companyId: string;
  name: string;
  address?: string | null;
  isActive: boolean;
}
