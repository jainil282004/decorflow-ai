import { z } from 'zod';

const envSchema = z.object({
  // Empty = same-origin `/api/v1` (production). Local uses apps/web/.env → http://localhost:5000
  VITE_API_URL: z
    .string()
    .optional()
    .transform((v) => (v ?? '').trim())
    .refine((v) => v === '' || z.string().url().safeParse(v).success, {
      message: 'VITE_API_URL must be a valid URL or empty',
    }),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});

if (!parsedEnv.success) {
  console.error('❌ Invalid frontend environment variables:', parsedEnv.error.format());
  throw new Error('Invalid frontend environment variables');
}

export const env = parsedEnv.data;
