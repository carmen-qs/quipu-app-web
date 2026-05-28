// ============================================================
// config/index.ts — Application Configuration
// Centralized configuration management
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ============================================================
// Environment Variables Schema
// ============================================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().default('12'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Gemini API (optional for graceful degradation)
  GEMINI_API_KEY: z.string().optional(),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

// ============================================================
// Configuration Export
// ============================================================

export const config = {
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  
  database: {
    url: env.DATABASE_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  },
  
  bcrypt: {
    rounds: parseInt(env.BCRYPT_ROUNDS, 10),
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
  },
  
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },
} as const;

export type Config = typeof config;
