// ============================================================
// modules/auth/service.test.ts — Auth Service Tests
// Vitest tests for authentication service
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './service';
import { AppError } from '../../shared/middleware/errorHandler';

// Mock dependencies
vi.mock('../../utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../config', () => ({
  config: {
    bcrypt: { rounds: '12' },
    jwt: {
      secret: 'test-secret-key-min-32-chars',
      accessExpiration: '15m',
      refreshExpiration: '7d',
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock('crypto', () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => 'hashed-token'),
      })),
    })),
    randomUUID: vi.fn(() => 'family-uuid'),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { prisma } = await import('../../utils/prisma');
      const bcrypt = await import('bcrypt');
      const jwt = await import('jsonwebtoken');

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(bcrypt.default.hash).mockResolvedValue('hashed-password');
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        createdAt: new Date(),
      });
      vi.mocked(jwt.default.sign).mockReturnValue('access-token', 'refresh-token');
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const result = await authService.register({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('id');
      expect(result.user.email).toBe('juan@example.com');
    });

    it('should throw error if email already exists', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-user',
        email: 'juan@example.com',
      } as any);

      await expect(
        authService.register({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const { prisma } = await import('../../utils/prisma');
      const bcrypt = await import('bcrypt');
      const jwt = await import('jsonwebtoken');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hashed-password',
        isActive: true,
      });
      vi.mocked(bcrypt.default.compare).mockResolvedValue(true);
      vi.mocked(jwt.default.sign).mockReturnValue('access-token', 'refresh-token');
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const result = await authService.login({
        email: 'juan@example.com',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('juan@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      const { prisma } = await import('../../utils/prisma');
      const bcrypt = await import('bcrypt');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'juan@example.com',
        passwordHash: 'hashed-password',
        isActive: true,
      });
      vi.mocked(bcrypt.default.compare).mockResolvedValue(false);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      await expect(
        authService.login({
          email: 'juan@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error for deactivated account', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'juan@example.com',
        passwordHash: 'hashed-password',
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'juan@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('refresh', () => {
    it('should refresh access token successfully', async () => {
      const { prisma } = await import('../../utils/prisma');
      const jwt = await import('jsonwebtoken');

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hashed-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-1',
          isActive: true,
        },
      } as any);
      vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as any);
      vi.mocked(jwt.default.sign).mockReturnValue('new-access-token', 'new-refresh-token');
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const result = await authService.refresh('refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

      await expect(authService.refresh('invalid-token')).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 });

      await expect(authService.logout('refresh-token')).resolves.not.toThrow();
    });
  });

  describe('logoutAll', () => {
    it('should logout from all devices', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        userId: 'user-1',
      } as any);
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 5 });
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      await expect(authService.logoutAll('refresh-token')).resolves.not.toThrow();
    });

    it('should throw error for invalid refresh token', async () => {
      const { prisma } = await import('../../utils/prisma');

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

      await expect(authService.logoutAll('invalid-token')).rejects.toThrow(AppError);
    });
  });
});
