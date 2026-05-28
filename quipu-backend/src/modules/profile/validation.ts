// ============================================================
// modules/profile/validation.ts — Profile Validation Schemas
// Zod schemas for profile operations
// ============================================================

import { z } from 'zod';

// Update profile validation schema (RF-006)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
});

// Re-export change password schema from auth
export { changePasswordSchema } from '../auth/validation';
