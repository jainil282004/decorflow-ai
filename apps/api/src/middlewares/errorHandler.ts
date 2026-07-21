import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '@decorflow/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Catch Zod Validation Errors
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new ApiError(400, 'VALIDATION_ERROR', message, true);
  }
  // Catch Prisma Known Request Errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      error = new ApiError(404, 'NOT_FOUND', 'Resource not found', true);
    } else if (error.code === 'P2002') {
      error = new ApiError(409, 'CONFLICT', 'Resource already exists', true);
    } else {
      // Prevent DB leak on unknown prisma errors
      error = new ApiError(500, 'INTERNAL_ERROR', 'Internal Server Error', false, err.stack);
    }
  }
  // Generic Fallback
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, 'INTERNAL_ERROR', message, false, err.stack);
  }

  // Hide internal server error messages from client in production
  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage =
    error.statusCode === 500 && isProduction ? 'Internal Server Error' : error.message;

  const response = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: clientMessage,
    },
  };

  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} - ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${error.statusCode} - ${error.message}`);
  }

  res.status(error.statusCode).json(response);
};
