// ============================================================
// modules/auth/validation.ts — Authentication Validation Schemas
// Zod schemas for authentication input validation
// ============================================================

import { z } from 'zod';

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Register validation schema (RF-001)
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be at most 100 characters')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
    email: z
      .string()
      .trim()          //  1° Limpia espacios en blanco externos
      .toLowerCase()   //  2° Pasa todo a minúsculas
      .email('Invalid email format') //  3° Ahora sí, valida que sea un email real
      .min(1, 'Email is required')
      .max(254, 'Email must be at most 254 characters'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data:any) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Login validation schema (RF-002)
export const loginSchema = z.object({
  email: z
    .string()
    .trim()          //  1° Limpia espacios
    .toLowerCase()   //  2° Pasa a minúsculas
    .email('Invalid email format') //  3° Valida formato
    .min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Change password validation schema (RF-007)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data: any) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data: any) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Export types for TypeScript inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;