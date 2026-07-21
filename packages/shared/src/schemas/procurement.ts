import { z } from 'zod';

// ==========================================
// VENDOR SCHEMAS
// ==========================================
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  panNumber: z.string().optional(),
  bankDetails: z.string().optional(),
  categories: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  isPreferred: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateVendorSchema = createVendorSchema.partial();

// ==========================================
// PURCHASE REQUISITION SCHEMAS
// ==========================================
export const createPurchaseRequisitionItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createPurchaseRequisitionSchema = z.object({
  requestedById: z.string().uuid(),
  warehouseId: z.string().uuid(),
  requiredDate: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().optional(),
  items: z.array(createPurchaseRequisitionItemSchema).min(1),
});

export const updatePurchaseRequisitionSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ORDERED']),
});

// ==========================================
// PURCHASE ORDER SCHEMAS
// ==========================================
export const createPurchaseItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  date: z.string().datetime(),
  expectedDelivery: z.string().datetime().optional(),
  tax: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  items: z.array(createPurchaseItemSchema).min(1),
});

export const updatePurchaseOrderSchema = z.object({
  expectedDelivery: z.string().datetime().optional(),
  status: z.enum([
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'ORDERED',
    'PARTIAL_RECEIPT',
    'RECEIVED',
    'CANCELLED',
  ]),
});

// ==========================================
// GOODS RECEIPT (GRN) SCHEMAS
// ==========================================
export const createGoodsReceiptItemSchema = z.object({
  purchaseItemId: z.string().uuid(),
  receivedQuantity: z.number().int().nonnegative(),
  damagedQuantity: z.number().int().nonnegative().default(0),
  shortQuantity: z.number().int().nonnegative().default(0),
  passedQualityCheck: z.boolean().default(true),
});

export const createGoodsReceiptSchema = z.object({
  purchaseId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(createGoodsReceiptItemSchema).min(1),
});

// ==========================================
// PURCHASE RETURN SCHEMAS
// ==========================================
export const createPurchaseReturnSchema = z.object({
  purchaseId: z.string().uuid(),
  reason: z.string().min(1, 'Return reason is required'),
  refundAmount: z.number().nonnegative().default(0),
});

export const updatePurchaseReturnSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED']),
});

// ==========================================
// TYPES
// ==========================================
export type CreateVendorDTO = z.infer<typeof createVendorSchema>;
export type UpdateVendorDTO = z.infer<typeof updateVendorSchema>;

export type CreatePurchaseRequisitionDTO = z.infer<typeof createPurchaseRequisitionSchema>;
export type UpdatePurchaseRequisitionDTO = z.infer<typeof updatePurchaseRequisitionSchema>;

export type CreatePurchaseOrderDTO = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderDTO = z.infer<typeof updatePurchaseOrderSchema>;

export type CreateGoodsReceiptDTO = z.infer<typeof createGoodsReceiptSchema>;

export type CreatePurchaseReturnDTO = z.infer<typeof createPurchaseReturnSchema>;
export type UpdatePurchaseReturnDTO = z.infer<typeof updatePurchaseReturnSchema>;
