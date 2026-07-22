import { z } from 'zod';

export const CreateInventoryItemSchema = z.object({
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional().nullable(),
  purchasePrice: z.number().nonnegative().optional(),
  rentalPrice: z.number().nonnegative().optional(),
  replacementCost: z.number().nonnegative().optional(),
  barcode: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  status: z.string().optional(),
  minStock: z.number().int().nonnegative().optional(),
  maxStock: z.number().int().nonnegative().optional().nullable(),
  bufferHours: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  isTracked: z.boolean().optional(),
  isActive: z.boolean().optional(),
  requiresCleaning: z.boolean().optional(),
});

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();

export const AdjustStockSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().optional(),
  fromBinId: z.string().uuid().optional(),
  toBinId: z.string().uuid().optional(),
});

export type CreateInventoryItemDTO = z.infer<typeof CreateInventoryItemSchema>;
export type UpdateInventoryItemDTO = z.infer<typeof UpdateInventoryItemSchema>;
export type AdjustStockDTO = z.infer<typeof AdjustStockSchema>;

export interface InventoryCategoryResponseDTO {
  id: string;
  name: string;
  parentId?: string | null;
  bufferHours?: number;
}

export interface InventoryItemResponseDTO {
  id: string;
  companyId: string;
  categoryId: string;
  subcategoryId?: string | null;
  name: string;
  sku: string;
  description?: string | null;
  purchasePrice: number;
  rentalPrice: number;
  replacementCost: number;
  barcode?: string | null;
  qrCode?: string | null;
  serialNumber?: string | null;
  batchNumber?: string | null;
  unit?: string | null;
  status: string;
  currentQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  minStock: number;
  maxStock?: number | null;
  bufferHours?: number | null;
  notes?: string | null;
  isTracked: boolean;
  isActive: boolean;
  requiresCleaning: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  category?: InventoryCategoryResponseDTO | null;
  subcategory?: InventoryCategoryResponseDTO | null;
}
