// ============================================================
// modules/profile/service.test.ts — Profile Service Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProfileService } from './service'
import { AppError } from '../../shared/middleware/errorHandler'
import { prisma } from '../../utils/prisma'
import bcrypt from 'bcrypt'

vi.mock('bcrypt')

describe('ProfileService', () => {
  let profileService: ProfileService

  beforeEach(() => {
    profileService = new ProfileService()
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should get user profile with stats', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        _count: {
          movements: 10,
          savingGoals: 3,
        },
      } as any)

      const result = await profileService.getProfile('user-1')

      expect(result).toBeDefined()
      expect(result.name).toBe('John Doe')
      expect(result.stats.totalMovements).toBe(10)
      expect(result.stats.totalGoals).toBe(3)
    })

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(
        profileService.getProfile('user-1')
      ).rejects.toThrow(AppError)
    })
  })

  describe('updateProfile', () => {
    it('should update user profile name', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      } as any)

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'john@example.com',
        updatedAt: new Date(),
      } as any)

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await profileService.updateProfile('user-1', {
        name: 'Jane Doe',
      })

      expect(result.name).toBe('Jane Doe')
    })

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(
        profileService.updateProfile('user-1', { name: 'Jane Doe' })
      ).rejects.toThrow(AppError)
    })

    it('should throw error if name is unchanged', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      } as any)

      await expect(
        profileService.updateProfile('user-1', { name: 'John Doe' })
      ).rejects.toThrow(AppError)
    })
  })

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        passwordHash: 'old-hash',
      } as any)

      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hash' as any)

      // Mock the Prisma operations that will be called in the transaction
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 0 } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      vi.mocked(prisma.$transaction).mockImplementation(async (callbacks) => {
        if (Array.isArray(callbacks)) {
          // Execute each Prisma operation in the transaction array
          for (const op of callbacks) {
            await op
          }
        }
        return null
      })

      await expect(
        profileService.changePassword('user-1', {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        })
      ).resolves.not.toThrow()
    })

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(
        profileService.changePassword('user-1', {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        })
      ).rejects.toThrow(AppError)
    })

    it('should throw error if current password is incorrect', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        passwordHash: 'old-hash',
      } as any)

      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

      await expect(
        profileService.changePassword('user-1', {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
        })
      ).rejects.toThrow(AppError)
    })
  })
})
