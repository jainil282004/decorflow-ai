/**
 * Prisma Client Singleton Configuration
 *
 * SERVERLESS DEPLOYMENT NOTE:
 * When deploying this app to a serverless environment (e.g. AWS Lambda, Vercel)
 * backed by PostgreSQL, you MUST configure connection pooling to prevent
 * "Too many connections" errors, since each function invocation can create a new connection.
 *
 * To do this, use PgBouncer or Prisma Accelerate, and update your connection string in `.env`:
 * `DATABASE_URL="postgres://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"`
 *
 * Setting `connection_limit=1` is critical for Serverless so that each instance only
 * uses exactly one connection from the pool.
 */
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
