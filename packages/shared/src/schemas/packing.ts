import { z } from 'zod';

export const createPackingJobSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  warehouseId: z
    .string()
    .min(1)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, 'Variant is required'),
        expectedQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
});

export type CreatePackingJobDTO = z.infer<typeof createPackingJobSchema>;

export const updatePackingItemSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, 'Invalid item ID'),
      pickedQuantity: z.number().int().min(0).optional(),
      missingQuantity: z.number().int().min(0).optional(),
      damagedQuantity: z.number().int().min(0).optional(),
      packingNotes: z.string().optional(),
    })
  ),
});

export type UpdatePackingItemDTO = z.infer<typeof updatePackingItemSchema>;

export const verifyPackingSchema = z.object({
  verificationNotes: z.string().optional(),
});

export type VerifyPackingDTO = z.infer<typeof verifyPackingSchema>;

export const dispatchJobSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  driverId: z.string().min(1).optional(),
  dispatchChecklist: z.string().optional(),
  dispatchNotes: z.string().optional(),
});

export type DispatchJobDTO = z.infer<typeof dispatchJobSchema>;

export const receiveReturnSchema = z.object({
  returnNotes: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string().min(1, 'Invalid item ID'),
      returnedQuantity: z.number().int().min(0),
      returnMissingQuantity: z.number().int().min(0),
      returnDamagedQuantity: z.number().int().min(0),
      needsCleaningQuantity: z.number().int().min(0),
      needsRepairQuantity: z.number().int().min(0),
      returnNotes: z.string().optional(),
    })
  ),
});

export type ReceiveReturnDTO = z.infer<typeof receiveReturnSchema>;
