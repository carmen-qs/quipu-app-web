// ============================================================
// modules/goals/validation.ts — Goals Validation Schemas
// Zod schemas for saving goals operations
// ============================================================

import { z } from 'zod';

// Create goal validation schema (RF-015)
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive').max(999999.99, 'Amount too large'),
  targetDate: z.string().optional().transform((val: any) => val ? new Date(val) : undefined),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

// Update goal validation schema (RF-018)
export const updateGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive').max(999999.99, 'Amount too large').optional(),
  targetDate: z.string().optional().transform((val: any) => val ? new Date(val) : undefined),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
}).refine((data: any) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Add contribution validation schema (RF-017)
export const addContributionSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(999999.99, 'Amount too large'),
  notes: z.string().optional(),
  contributionDate: z.string().optional().transform((val: any) => val ? new Date(val) : new Date()),
});