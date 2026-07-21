import { z } from 'zod';

// =====================================
// Address Schema
// =====================================
export const CustomerAddressSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['BILLING', 'SHIPPING', 'EVENT', 'OFFICE', 'OTHER']).default('BILLING'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP is required'),
  country: z.string().default('India'),
});

// =====================================
// Contact Schema
// =====================================
export const CustomerContactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().nullable(),
});

// =====================================
// Customer Schemas
// =====================================
export const CreateCustomerSchema = z.object({
  type: z.enum(['INDIVIDUAL', 'BUSINESS']).default('INDIVIDUAL'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Nested Creation
  addresses: z.array(CustomerAddressSchema).optional(),
  contacts: z.array(CustomerContactSchema).optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// =====================================
// Types
// =====================================
export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
export type CustomerAddressDTO = z.infer<typeof CustomerAddressSchema>;
export type CustomerContactDTO = z.infer<typeof CustomerContactSchema>;

export interface CustomerResponseDTO {
  id: string;
  companyId: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  addresses?: CustomerAddressDTO[];
  contacts?: CustomerContactDTO[];
}
