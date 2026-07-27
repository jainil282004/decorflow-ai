import { z } from 'zod';

/**
 * Optional FK id. Empty string / null → null.
 * Do NOT use .uuid() here — empty optional fields must never show "Invalid uuid".
 * Leave undefined unset (important for PATCH).
 */
const optionalFkId = z.preprocess((v) => {
  if (v === undefined) return undefined;
  if (v === '' || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return typeof v === 'string' ? v.trim() : v;
}, z.string().min(1).nullable().optional());

/** Accept number / numeric string / empty → number | undefined (clearable money fields). */
const optionalAmount = z.preprocess((v) => {
  if (v === undefined) return undefined;
  if (v === '' || v === null) return undefined;
  if (typeof v === 'number' && Number.isNaN(v)) return undefined;
  return v;
}, z.coerce.number().nonnegative().optional());

const optionalInt = z.preprocess((v) => {
  if (v === undefined) return undefined;
  if (v === '' || v === null) return undefined;
  if (typeof v === 'number' && Number.isNaN(v)) return undefined;
  return v;
}, z.coerce.number().int().nonnegative().optional());

const optionalNullableInt = z.preprocess((v) => {
  if (v === undefined) return undefined;
  if (v === '' || v === null) return null;
  if (typeof v === 'number' && Number.isNaN(v)) return null;
  return v;
}, z.coerce.number().int().nonnegative().nullable().optional());

export const CreateInventoryItemSchema = z.object({
  categoryId: z.string().uuid('Select a category'),
  subcategoryId: optionalFkId,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional().nullable(),
  purchasePrice: optionalAmount,
  rentalPrice: optionalAmount,
  replacementCost: optionalAmount,
  barcode: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  status: z.string().optional(),
  minStock: optionalInt,
  maxStock: optionalNullableInt,
  bufferHours: optionalNullableInt,
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
