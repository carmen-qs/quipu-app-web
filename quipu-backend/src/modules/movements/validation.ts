// ============================================================
// modules/movements/validation.ts — Movement Validation Schemas
// Zod schemas for financial transactions (Income/Expense)
// ============================================================

import { z } from 'zod';

// Create movement validation schema (RF-010)
export const createMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Type must be either INCOME or EXPENSE',
  }),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be positive'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description is too long'),
  categoryId: z
    .string()
    .min(1, 'Category ID is required'),
  movementDate: z
    .string()
    .optional()
    .transform((val: any) => val ? new Date(val + 'T12:00:00') : new Date()), // ✨ Corregido val: any
  source: z.enum(['AI_PARSED', 'MANUAL']).default('MANUAL'),
  notes: z.string().optional(),
});

// Update movement validation schema (RF-011)
export const updateMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  amount: z.number().positive('Amount must be positive').max(999999.99).optional(),
  description: z.string().min(1).max(500).optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  movementDate: z
    .string()
    .optional()
    .transform((val: any) => val ? new Date(val + 'T12:00:00') : undefined), // ✨ Corregido val: any
  notes: z.string().optional(),
})
.refine((data: any) => Object.keys(data).length > 0, { // ✨ Corregido data: any
  message: 'At least one field must be provided for update',
});

// Export types for TypeScript inference
export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>;