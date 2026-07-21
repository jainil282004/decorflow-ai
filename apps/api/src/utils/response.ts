import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendCreated = <T>(res: Response, data: T) => {
  return sendSuccess(res, data, 201);
};
