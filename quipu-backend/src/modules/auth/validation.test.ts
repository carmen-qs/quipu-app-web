// ============================================================
// modules/auth/validation.test.ts — Auth Validation Tests
// Vitest tests for authentication validation schemas
// ============================================================

import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, changePasswordSchema } from './validation';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct register data', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      const result = registerSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject password mismatch', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject name with special characters', () => {
      const invalidData = {
        name: 'Juan123',
        email: 'juan@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should trim and lowercase email', () => {
      const data = {
        name: 'Juan Pérez',
        email: '  JUAN@EXAMPLE.COM  ',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      const result = registerSchema.parse(data);
      expect(result.email).toBe('juan@example.com');
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'juan@example.com',
        password: 'SecurePass123!',
      };

      const result = loginSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject missing email', () => {
      const invalidData = {
        email: '',
        password: 'SecurePass123!',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'juan@example.com',
        password: '',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should trim and lowercase email', () => {
      const data = {
        email: '  JUAN@EXAMPLE.COM  ',
        password: 'SecurePass123!',
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe('juan@example.com');
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct password change data', () => {
      const validData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass456!',
        confirmNewPassword: 'NewSecurePass456!',
      };

      const result = changePasswordSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject password mismatch', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass456!',
        confirmNewPassword: 'DifferentPass456!',
      };

      expect(() => changePasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject same password as current', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'OldPass123!',
        confirmNewPassword: 'OldPass123!',
      };

      expect(() => changePasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      expect(() => changePasswordSchema.parse(invalidData)).toThrow();
    });
  });
});
