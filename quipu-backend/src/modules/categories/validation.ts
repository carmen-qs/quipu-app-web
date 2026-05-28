// ============================================================
// modules/categories/validation.ts — Categories Validation Schemas
// Zod schemas for categories operations
// ============================================================

import { z } from 'zod';

// Create category validation schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  icon: z.string().trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hexadecimal color (e.g., #FFFFFF)')
    .trim(),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be either INCOME or EXPENSE' }),
  }),
});

// Export types for TypeScript inference
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
