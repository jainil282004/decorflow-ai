import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '@decorflow/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // ApiError(statusCode, message, code?, isOperational?, stack?)
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new ApiError(400, message, 'VALIDATION_ERROR', true);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      error = new ApiError(404, 'Resource not found', 'NOT_FOUND', true);
    } else if (error.code === 'P2002') {
      error = new ApiError(409, 'Resource already exists', 'CONFLICT', true);
    } else {
      error = new ApiError(500, 'Internal Server Error', 'INTERNAL_ERROR', false, err.stack);
    }
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    const code = statusCode === 413 ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_ERROR';
    error = new ApiError(
      statusCode,
      statusCode === 413
        ? 'Upload is too large. Use a smaller logo (under ~200KB) or a URL instead.'
        : message,
      code,
      statusCode < 500,
      err.stack
    );
  }

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
