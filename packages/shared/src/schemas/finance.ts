import { z } from 'zod';

// ==========================================
// QUOTATIONS
// ==========================================
export const createQuotationItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().default(0),
});

export const createQuotationSchema = z.object({
  customerId: z.string().uuid(),
  eventId: z.string().uuid().optional(),
  date: z.string().datetime(),
  validUntil: z.string().datetime(),
  discountTotal: z.number().nonnegative().default(0),
  items: z.array(createQuotationItemSchema).min(1),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']),
});

// ==========================================
// INVOICES
// ==========================================
export const createInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().default(0),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  eventId: z.string().uuid().optional(),
  quotationId: z.string().uuid().optional(),
  date: z.string().datetime(),
  dueDate: z.string().datetime(),
  discountTotal: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  items: z.array(createInvoiceItemSchema).min(1),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']),
});

// ==========================================
// CUSTOMER PAYMENTS
// ==========================================
export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
});

// ==========================================
// VENDOR BILLS
// ==========================================
export const createVendorBillSchema = z.object({
  vendorId: z.string().uuid(),
  purchaseId: z.string().uuid().optional(),
  billNumber: z.string().min(1, 'Bill number is required'),
  date: z.string().datetime(),
  dueDate: z.string().datetime(),
  totalAmount: z.number().nonnegative(),
});

export const updateVendorBillStatusSchema = z.object({
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'CANCELLED']),
});

// ==========================================
// VENDOR PAYMENTS
// ==========================================
export const recordVendorPaymentSchema = z.object({
  vendorBillId: z.string().uuid(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
});

// ==========================================
// EXPENSES
// ==========================================
export const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive(),
  date: z.string().datetime(),
  description: z.string().optional(),
});

export const updateExpenseStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAID']),
});

// ==========================================
// TYPES
// ==========================================
export type CreateQuotationDTO = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationStatusDTO = z.infer<typeof updateQuotationStatusSchema>;

export type CreateInvoiceDTO = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceStatusDTO = z.infer<typeof updateInvoiceStatusSchema>;

export type RecordPaymentDTO = z.infer<typeof recordPaymentSchema>;

export type CreateVendorBillDTO = z.infer<typeof createVendorBillSchema>;
export type UpdateVendorBillStatusDTO = z.infer<typeof updateVendorBillStatusSchema>;

export type RecordVendorPaymentDTO = z.infer<typeof recordVendorPaymentSchema>;

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseStatusDTO = z.infer<typeof updateExpenseStatusSchema>;
