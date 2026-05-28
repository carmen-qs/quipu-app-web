// ============================================================
// shared/middleware/auth.ts — Authentication Middleware
// JWT verification and user context injection
// ============================================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from './errorHandler';
import type { AuthRequest, JWTPayload } from '../types';

/**
 * Authentication middleware
 * Verifies JWT access token and injects userId into request
 */
export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header', 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Ensure token type is 'access' (not refresh token)
    if (decoded.type !== 'access') {
      throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN_TYPE');
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token has expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    throw error;
  }
};

/**
 * Optional authentication middleware
 * Does not throw error if token is missing, but still validates if present
 */
export const optionalAuthenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    if (decoded.type !== 'access') {
      throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN_TYPE');
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};
