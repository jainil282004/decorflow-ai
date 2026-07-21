import { Request, Response, NextFunction } from 'express';
import { LogisticsService } from './logistics.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import {
  createVehicleSchema,
  updateVehicleSchema,
  createDriverSchema,
  updateDriverSchema,
  createTripSchema,
  updateTripSchema,
  dispatchTripSchema,
  completeTripSchema,
} from '@decorflow/shared';

const logisticsService = new LogisticsService();

export class LogisticsController {
  // ==========================================
  // VEHICLES
  // ==========================================
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await logisticsService.findAllVehicles(req.user!.companyId!);
      return sendSuccess(res, vehicles);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await logisticsService.findVehicleById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, vehicle);
    } catch (error) {
      next(error);
    }
  }

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVehicleSchema.parse(req.body);
      const vehicle = await logisticsService.createVehicle(req.user!.companyId!, data);
      return sendCreated(res, vehicle);
    } catch (error) {
      next(error);
    }
  }

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateVehicleSchema.parse(req.body);
      const vehicle = await logisticsService.updateVehicle(
        req.params.id,
        req.user!.companyId!,
        data
      );
      return sendSuccess(res, vehicle);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // DRIVERS
  // ==========================================
  async getDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const drivers = await logisticsService.findAllDrivers(req.user!.companyId!);
      return sendSuccess(res, drivers);
    } catch (error) {
      next(error);
    }
  }

  async getDriverById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await logisticsService.findDriverById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  }

  async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDriverSchema.parse(req.body);
      const driver = await logisticsService.createDriver(req.user!.companyId!, data);
      return sendCreated(res, driver);
    } catch (error) {
      next(error);
    }
  }

  async updateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateDriverSchema.parse(req.body);
      const driver = await logisticsService.updateDriver(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, driver);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // TRIPS
  // ==========================================
  async getTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await logisticsService.findAllTrips(req.user!.companyId!);
      return sendSuccess(res, trips);
    } catch (error) {
      next(error);
    }
  }

  async getTripById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await logisticsService.findTripById(req.params.id, req.user!.companyId!);
      return sendSuccess(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTripSchema.parse(req.body);
      const trip = await logisticsService.createTrip(req.user!.companyId!, data);
      return sendCreated(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTripSchema.parse(req.body);
      const trip = await logisticsService.updateTrip(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async dispatchTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dispatchTripSchema.parse(req.body);
      const trip = await logisticsService.dispatchTrip(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async completeTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = completeTripSchema.parse(req.body);
      const trip = await logisticsService.completeTrip(req.params.id, req.user!.companyId!, data);
      return sendSuccess(res, trip);
    } catch (error) {
      next(error);
    }
  }
}
