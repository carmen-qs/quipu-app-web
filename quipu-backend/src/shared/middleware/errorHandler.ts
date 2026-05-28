// ============================================================
// shared/middleware/errorHandler.ts — Global Error Handler
// Centralized error handling middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`, { path: req.path, method: req.method });

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: err.errors,
    });
    return;
  }

  // Custom application errors
  if (err instanceof AppError) {
    const response: {
      error: string;
      message: string;
      details?: unknown;
    } = {
      error: err.code || 'APPLICATION_ERROR',
      message: err.message,
    };

    if (err.details !== undefined) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'DATABASE_ERROR',
      message: 'A database error occurred',
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
};
