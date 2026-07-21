import { z } from 'zod';

export const CreateVenueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  googleMapsUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  coordinates: z.string().optional(),
  indoorOutdoor: z.string().optional(),
  parkingNotes: z.string().optional(),
  loadingNotes: z.string().optional(),
  siteInstructions: z.string().optional(),
});

export const UpdateVenueSchema = CreateVenueSchema.partial();

export type CreateVenueDTO = z.infer<typeof CreateVenueSchema>;
export type UpdateVenueDTO = z.infer<typeof UpdateVenueSchema>;

export interface VenueResponseDTO {
  id: string;
  companyId: string;
  name: string;
  type?: string | null;
  address: string;
  googleMapsUrl?: string | null;
  coordinates?: string | null;
  indoorOutdoor?: string | null;
  parkingNotes?: string | null;
  loadingNotes?: string | null;
  siteInstructions?: string | null;
  createdAt: string;
  updatedAt: string;
}
