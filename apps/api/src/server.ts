import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { appConfig } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { logger } from '@decorflow/logger';
import { authRoutes } from './modules/auth/auth.routes';
import customersRoutes from './modules/customers/customers.routes';
import eventsRoutes from './modules/events/events.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import { packingRouter } from './modules/packing/packing.routes';
import { cleaningRouter } from './modules/cleaning/cleaning.routes';
import { logisticsRouter } from './modules/logistics/logistics.routes';
import { workforceRouter } from './modules/workforce/workforce.routes';
import { procurementRouter } from './modules/procurement/procurement.routes';
import { financeRouter } from './modules/finance/finance.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { saasRouter } from './modules/saas/saas.routes';
import notificationsRoutes from './modules/notifications/notification.routes';
import activityRoutes from './modules/activity/activity.routes';
import { requireAuth } from './middlewares/auth.middleware';

const app = express();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: appConfig.isProduction ? false : undefined,
  })
);
app.use(
  cors({
    origin: appConfig.corsOrigin || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', requireAuth, customersRoutes);
app.use('/api/v1/events', requireAuth, eventsRoutes);
app.use('/api/v1/inventory', requireAuth, inventoryRoutes);
app.use('/api/v1/packing', requireAuth, packingRouter);
app.use('/api/v1/cleaning', requireAuth, cleaningRouter);
app.use('/api/v1/logistics', logisticsRouter);
app.use('/api/v1/workforce', workforceRouter);
app.use('/api/v1/procurement', procurementRouter);
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/saas', saasRouter);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/activity', activityRoutes);

// Basic health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the Vite-built SPA from the same origin.
if (appConfig.isProduction) {
  const candidates = [
    path.resolve(process.cwd(), 'apps/web/dist'),
    path.resolve(__dirname, '../../../web/dist'),
    path.resolve(__dirname, '../../web/dist'),
  ];
  const webDist = candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

  if (webDist) {
    app.use(express.static(webDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      return res.sendFile(path.join(webDist, 'index.html'));
    });
    logger.info(`Serving frontend from ${webDist}`);
  } else {
    logger.warn('Production mode but apps/web/dist was not found');
  }
}

// Error handling must be last
app.use(errorHandler);

app.listen(appConfig.port, () => {
  logger.info(`Server is running in ${appConfig.env} mode on port ${appConfig.port}`);
});
