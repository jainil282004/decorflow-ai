import { z } from 'zod';

// ==========================================
// VEHICLE SCHEMAS
// ==========================================
export const createVehicleSchema = z.object({
  typeId: z.string().uuid(),
  make: z.string(),
  model: z.string(),
  year: z.number().int().optional(),
  licensePlate: z.string(),
  capacity: z.number().optional(),
  weightCapacity: z.number().optional(),
  volumeCapacity: z.number().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']).default('ACTIVE'),
  insuranceExpiry: z.string().datetime().optional(),
  fitnessExpiry: z.string().datetime().optional(),
  serviceDueDate: z.string().datetime().optional(),
  odometerReading: z.number().optional(),
  fuelType: z.string().optional(),
  assignedDriverId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

// ==========================================
// DRIVER SCHEMAS
// ==========================================
export const createDriverSchema = z.object({
  userId: z.string().uuid(),
  licenseNumber: z.string(),
  licenseExpiry: z.string().datetime(),
  contactNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE']).default('AVAILABLE'),
  notes: z.string().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

// ==========================================
// TRIP SCHEMAS
// ==========================================
export const createTripSchema = z.object({
  eventId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  pickupWarehouseId: z.string().uuid().optional(),
  destinationVenueId: z.string().uuid().optional(),
  plannedDeparture: z.string().datetime().optional(),
  plannedArrival: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  status: z.enum(['PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED']).optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  plannedDeparture: z.string().datetime().optional(),
  plannedArrival: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// ==========================================
// TRIP DISPATCH / COMPLETE SCHEMAS
// ==========================================
export const dispatchTripSchema = z.object({
  actualDeparture: z.string().datetime(),
  checkVehicleInspection: z
    .boolean()
    .refine((val) => val === true, { message: 'Vehicle inspection must be checked' }),
  checkFuel: z.boolean().refine((val) => val === true, { message: 'Fuel check must be completed' }),
  checkDocuments: z
    .boolean()
    .refine((val) => val === true, { message: 'Document check must be completed' }),
  checkLoadVerification: z
    .boolean()
    .refine((val) => val === true, { message: 'Load verification must be completed' }),
  checkSafetyEquipment: z
    .boolean()
    .refine((val) => val === true, { message: 'Safety equipment must be checked' }),
});

export const completeTripSchema = z.object({
  actualArrival: z.string().datetime(),
  distance: z.number().min(0).optional(),
  postVehicleInspection: z
    .boolean()
    .refine((val) => val === true, { message: 'Post vehicle inspection must be checked' }),
  postDamageReport: z
    .boolean()
    .refine((val) => val === true, { message: 'Post damage report must be checked' }),
  postFuelLog: z
    .boolean()
    .refine((val) => val === true, { message: 'Post fuel log must be checked' }),
  postOdometerUpdate: z
    .boolean()
    .refine((val) => val === true, { message: 'Post odometer update must be checked' }),
});

// ==========================================
// TYPES
// ==========================================
export type CreateVehicleDTO = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDTO = z.infer<typeof updateVehicleSchema>;

export type CreateDriverDTO = z.infer<typeof createDriverSchema>;
export type UpdateDriverDTO = z.infer<typeof updateDriverSchema>;

export type CreateTripDTO = z.infer<typeof createTripSchema>;
export type UpdateTripDTO = z.infer<typeof updateTripSchema>;

export type DispatchTripDTO = z.infer<typeof dispatchTripSchema>;
export type CompleteTripDTO = z.infer<typeof completeTripSchema>;
