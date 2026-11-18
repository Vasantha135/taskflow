import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Route not found'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ status: 'error', message: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}