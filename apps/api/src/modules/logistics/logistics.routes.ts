import { Router } from 'express';
import { LogisticsController } from './logistics.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const controller = new LogisticsController();

router.use(requireAuth);

// Vehicles
router.get('/vehicles', requirePermission('vehicle.view'), controller.getVehicles);
router.get('/vehicles/:id', requirePermission('vehicle.view'), controller.getVehicleById);
router.post('/vehicles', requirePermission('vehicle.create'), controller.createVehicle);
router.patch('/vehicles/:id', requirePermission('vehicle.update'), controller.updateVehicle);

// Drivers
router.get('/drivers', requirePermission('driver.view'), controller.getDrivers);
router.get('/drivers/:id', requirePermission('driver.view'), controller.getDriverById);
router.post('/drivers', requirePermission('driver.create'), controller.createDriver);
router.patch('/drivers/:id', requirePermission('driver.update'), controller.updateDriver);

// Trips
router.get('/trips', requirePermission('trip.view'), controller.getTrips);
router.get('/trips/:id', requirePermission('trip.view'), controller.getTripById);
router.post('/trips', requirePermission('trip.create'), controller.createTrip);
router.patch('/trips/:id', requirePermission('trip.update'), controller.updateTrip);
router.post('/trips/:id/dispatch', requirePermission('trip.dispatch'), controller.dispatchTrip);
router.post('/trips/:id/complete', requirePermission('trip.complete'), controller.completeTrip);

export const logisticsRouter = router;
