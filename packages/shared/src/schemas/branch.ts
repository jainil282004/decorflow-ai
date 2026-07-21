import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export type CreateBranchDTO = z.infer<typeof createBranchSchema>;
export type UpdateBranchDTO = z.infer<typeof updateBranchSchema>;

export interface BranchResponseDTO {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
