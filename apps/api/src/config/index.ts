import { env } from './env';

export const appConfig = {
  port: parseInt(env.PORT, 10),
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  logLevel: env.LOG_LEVEL,
  corsOrigin: env.CORS_ORIGIN || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173',
};

export const dbConfig = {
  url: env.DATABASE_URL,
};

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: '1d', // default
};
