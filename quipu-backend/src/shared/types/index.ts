// ============================================================
// shared/types/index.ts — Shared TypeScript Types
// Common types used across the application
// ============================================================

import { Request } from 'express';

// ============================================================
// Authentication Types
// ============================================================

export interface JWTPayload {
  userId: string;
  type?: 'access' | 'refresh';
}

export interface AuthRequest extends Request {
  userId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ============================================================
// Service Types
// ============================================================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================================
// Error Types
// ============================================================

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}
