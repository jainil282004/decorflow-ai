import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  timeZone: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  name: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  email: z
    .union([z.string().email(), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' ? null : v)),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  roleId: z.string().uuid().optional(),
});

export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  isLocked: z.boolean(),
});

export const subscriptionUpgradeSchema = z.object({
  planId: z.string().uuid(),
});

export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;
export type InviteUserDTO = z.infer<typeof inviteUserSchema>;
export type SuspendUserDTO = z.infer<typeof suspendUserSchema>;
export type SubscriptionUpgradeDTO = z.infer<typeof subscriptionUpgradeSchema>;
