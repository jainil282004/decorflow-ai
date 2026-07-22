import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type {
  CreateVehicleDTO,
  UpdateVehicleDTO,
  CreateDriverDTO,
  UpdateDriverDTO,
  CreateTripDTO,
  UpdateTripDTO,
  DispatchTripDTO,
  CompleteTripDTO,
} from '@decorflow/shared';

export class LogisticsService {
  // ==========================================
  // VEHICLES
  // ==========================================
  async findAllVehicles(companyId: string) {
    return prisma.vehicle.findMany({
      where: { companyId },
      include: { type: true, assignedDriver: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findVehicleById(id: string, companyId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id, companyId },
      include: { type: true, assignedDriver: { include: { user: true } } },
    });
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
    return vehicle;
  }

  async createVehicle(companyId: string, data: CreateVehicleDTO) {
    return prisma.vehicle.create({
      data: {
        companyId,
        ...data,
      },
      include: { type: true, assignedDriver: { include: { user: true } } },
    });
  }

  async findAllVehicleTypes(companyId: string) {
    const defaults = ['Pickup Truck', 'Tempo', 'Truck', 'Van', 'Car'];
    const existing = await prisma.vehicleType.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
    const existingNames = new Set(existing.map((t) => t.name.toLowerCase()));
    const missing = defaults.filter((name) => !existingNames.has(name.toLowerCase()));
    if (missing.length) {
      await prisma.vehicleType.createMany({
        data: missing.map((name) => ({ companyId, name })),
      });
      return prisma.vehicleType.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
      });
    }
    return existing;
  }

  async updateVehicle(id: string, companyId: string, data: UpdateVehicleDTO) {
    await this.findVehicleById(id, companyId);
    return prisma.vehicle.update({
      where: { id },
      data,
      include: { type: true },
    });
  }

  // ==========================================
  // DRIVERS
  // ==========================================
  async findAllDrivers(companyId: string) {
    return prisma.driver.findMany({
      where: { companyId },
      include: { user: true, assignedVehicles: true },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async findDriverById(id: string, companyId: string) {
    const driver = await prisma.driver.findUnique({
      where: { id, companyId },
      include: { user: true, assignedVehicles: true },
    });
    if (!driver) throw new ApiError(404, 'Driver not found');
    return driver;
  }

  async createDriver(companyId: string, data: CreateDriverDTO) {
    return prisma.driver.create({
      data: {
        companyId,
        ...data,
      },
      include: { user: true },
    });
  }

  async updateDriver(id: string, companyId: string, data: UpdateDriverDTO) {
    await this.findDriverById(id, companyId);
    return prisma.driver.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  // ==========================================
  // TRIPS
  // ==========================================
  async findAllTrips(companyId: string) {
    return prisma.trip.findMany({
      where: { companyId },
      include: {
        event: true,
        vehicle: true,
        driver: { include: { user: true } },
        pickupWarehouse: true,
        destinationVenue: true,
      },
      orderBy: { plannedDeparture: 'asc' },
    });
  }

  async findTripById(id: string, companyId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id, companyId },
      include: {
        event: true,
        vehicle: true,
        driver: { include: { user: true } },
        pickupWarehouse: true,
        destinationVenue: true,
      },
    });
    if (!trip) throw new ApiError(404, 'Trip not found');
    return trip;
  }

  private async checkConflict(
    companyId: string,
    vehicleId: string,
    driverId: string,
    start: Date,
    end: Date,
    excludeTripId?: string
  ) {
    const conflicts = await prisma.trip.findMany({
      where: {
        companyId,
        id: excludeTripId ? { not: excludeTripId } : undefined,
        status: { in: ['PENDING', 'DISPATCHED'] },
        OR: [{ vehicleId }, { driverId }],
        plannedDeparture: { lte: end },
        plannedArrival: { gte: start },
      },
    });

    if (conflicts.length > 0) {
      throw new ApiError(400, 'Scheduling conflict detected for the selected vehicle or driver');
    }
  }

  async createTrip(companyId: string, data: CreateTripDTO) {
    if (data.plannedDeparture && data.plannedArrival) {
      const start = new Date(data.plannedDeparture);
      const end = new Date(data.plannedArrival);
      if (start >= end) {
        throw new ApiError(400, 'Planned arrival must be after planned departure');
      }
      await this.checkConflict(companyId, data.vehicleId, data.driverId, start, end);
    }

    return prisma.trip.create({
      data: {
        companyId,
        ...data,
        status: 'PENDING',
      },
      include: { vehicle: true, driver: true },
    });
  }

  async updateTrip(id: string, companyId: string, data: UpdateTripDTO) {
    const trip = await this.findTripById(id, companyId);

    if (data.plannedDeparture && data.plannedArrival) {
      const start = new Date(data.plannedDeparture);
      const end = new Date(data.plannedArrival);
      if (start >= end) {
        throw new ApiError(400, 'Planned arrival must be after planned departure');
      }

      const checkVehicle = data.vehicleId || trip.vehicleId;
      const checkDriver = data.driverId || trip.driverId;
      await this.checkConflict(companyId, checkVehicle, checkDriver, start, end, id);
    }

    return prisma.trip.update({
      where: { id },
      data,
    });
  }

  async dispatchTrip(id: string, companyId: string, data: DispatchTripDTO) {
    const trip = await this.findTripById(id, companyId);
    if (trip.status !== 'PENDING') {
      throw new ApiError(400, 'Trip can only be dispatched if it is PENDING');
    }

    // Begin a transaction to update the trip and also mark driver availability
    return prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          actualDeparture: data.actualDeparture,
          checkVehicleInspection: data.checkVehicleInspection,
          checkFuel: data.checkFuel,
          checkDocuments: data.checkDocuments,
          checkLoadVerification: data.checkLoadVerification,
          checkSafetyEquipment: data.checkSafetyEquipment,
        },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { availabilityStatus: 'ON_TRIP' },
      });

      return updatedTrip;
    });
  }

  async completeTrip(id: string, companyId: string, data: CompleteTripDTO) {
    const trip = await this.findTripById(id, companyId);
    if (trip.status !== 'DISPATCHED') {
      throw new ApiError(400, 'Trip can only be completed if it is DISPATCHED');
    }

    return prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualArrival: data.actualArrival,
          distance: data.distance,
          postVehicleInspection: data.postVehicleInspection,
          postDamageReport: data.postDamageReport,
          postFuelLog: data.postFuelLog,
          postOdometerUpdate: data.postOdometerUpdate,
        },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { availabilityStatus: 'AVAILABLE' },
      });

      if (data.postOdometerUpdate && data.distance && data.distance > 0) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: {
            odometerReading: { increment: data.distance },
          },
        });
      }

      return updatedTrip;
    });
  }
}
