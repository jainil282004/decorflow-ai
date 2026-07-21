import { z } from 'zod';

// ==========================================
// RETURN INSPECTION SCHEMAS
// ==========================================
export const createReturnInspectionItemSchema = z.object({
  packingJobItemId: z.string().uuid(),
  returnedQuantity: z.number().int().min(0),
  missingQuantity: z.number().int().min(0).default(0),
  damagedQuantity: z.number().int().min(0).default(0),
  dirtyQuantity: z.number().int().min(0).default(0),
  lostQuantity: z.number().int().min(0).default(0),
  inspectionNotes: z.string().optional(),
});

export const createReturnInspectionSchema = z.object({
  eventId: z.string().uuid(),
  packingJobId: z.string().uuid(),
  items: z.array(createReturnInspectionItemSchema).min(1, 'At least one item must be inspected'),
  inspectionNotes: z.string().optional(),
});

export const updateReturnInspectionSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED']),
});

// ==========================================
// CLEANING JOB SCHEMAS
// ==========================================
export const createCleaningJobSchema = z.object({
  inspectionItemId: z.string().uuid(),
  variantId: z.string().uuid(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  quantity: z.number().int().min(1),
  dueDate: z.string().datetime().optional(),
  assignedStaffId: z.string().uuid().optional(),
  cleaningNotes: z.string().optional(),
});

export const updateCleaningJobSchema = z.object({
  status: z.enum(['PENDING', 'CLEANING', 'DONE']).optional(),
  assignedStaffId: z.string().uuid().optional().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  cleaningNotes: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

// ==========================================
// REPAIR JOB SCHEMAS
// ==========================================
export const createRepairJobSchema = z.object({
  inspectionItemId: z.string().uuid(),
  variantId: z.string().uuid(),
  damageCategory: z.string(),
  repairPriority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  quantity: z.number().int().min(1),
  cost: z.number().min(0).optional(),
  expectedCompletion: z.string().datetime().optional(),
  assignedTechnicianId: z.string().uuid().optional(),
  repairNotes: z.string().optional(),
});

export const updateRepairJobSchema = z.object({
  status: z.enum(['PENDING', 'REPAIRING', 'DONE']).optional(),
  assignedTechnicianId: z.string().uuid().optional().nullable(),
  repairPriority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  cost: z.number().min(0).optional(),
  repairNotes: z.string().optional(),
  expectedCompletion: z.string().datetime().optional().nullable(),
});

// ==========================================
// QUALITY CHECK SCHEMAS
// ==========================================
export const createQualityCheckSchema = z.object({
  inspectionItemId: z.string().uuid(),
  status: z.enum(['PASS', 'MINOR_ISSUE', 'REPAIR_AGAIN', 'DISCARD']),
  notes: z.string().optional(),
});

// ==========================================
// TYPES
// ==========================================
export type CreateReturnInspectionDTO = z.infer<typeof createReturnInspectionSchema>;
export type CreateReturnInspectionItemDTO = z.infer<typeof createReturnInspectionItemSchema>;
export type UpdateReturnInspectionDTO = z.infer<typeof updateReturnInspectionSchema>;

export type CreateCleaningJobDTO = z.infer<typeof createCleaningJobSchema>;
export type UpdateCleaningJobDTO = z.infer<typeof updateCleaningJobSchema>;

export type CreateRepairJobDTO = z.infer<typeof createRepairJobSchema>;
export type UpdateRepairJobDTO = z.infer<typeof updateRepairJobSchema>;

export type CreateQualityCheckDTO = z.infer<typeof createQualityCheckSchema>;
