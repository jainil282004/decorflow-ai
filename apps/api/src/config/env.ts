import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(10),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  CORS_ORIGIN: z.string().optional().default(''),
  /** Public frontend base URL used in password-reset email links */
  APP_URL: z.string().optional().default(''),
  /** Optional Resend API key — when unset, emails are logged instead of sent */
  RESEND_API_KEY: z.string().optional().default(''),
  MAIL_FROM: z.string().optional().default('DecorFlow <onboarding@resend.dev>'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const corsOrigin =
  parsedEnv.data.CORS_ORIGIN || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173';

export const env = {
  ...parsedEnv.data,
  CORS_ORIGIN: corsOrigin,
  APP_URL: parsedEnv.data.APP_URL || corsOrigin,
};
