// ============================================================
// modules/categories/service.test.ts — Categories Service Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CategoryService } from './service'
import { AppError } from '../../shared/middleware/errorHandler'
import { prisma } from '../../utils/prisma'

describe('CategoryService', () => {
  let categoryService: CategoryService

  beforeEach(() => {
    categoryService = new CategoryService()
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should list all categories for a user including system categories', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Food',
          type: 'EXPENSE',
          icon: '🍔',
          color: '#FF5733',
          isSystem: true,
          isActive: true,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as any,
        {
          id: 'cat-2',
          name: 'My Custom',
          type: 'EXPENSE',
          icon: '📦',
          color: '#3B82F6',
          isSystem: false,
          isActive: true,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as any,
      ])

      const result = await categoryService.list('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].isSystem).toBe(true)
      expect(result[1].userId).toBe('user-1')
    })

    it('should return empty array if no categories found', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([])

      const result = await categoryService.list('user-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('should create a new custom category', async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: 'cat-1',
        userId: 'user-1',
        name: 'My Category',
        type: 'EXPENSE',
        icon: '📦',
        color: '#3B82F6',
        isSystem: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      const result = await categoryService.create('user-1', {
        name: 'My Category',
        type: 'EXPENSE',
        icon: '📦',
        color: '#3B82F6',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('My Category')
      expect(result.isSystem).toBe(false)
    })

    it('should throw error if category name already exists for user', async () => {
      vi.mocked(prisma.category.findFirst)
        .mockResolvedValueOnce({
          id: 'cat-1',
          userId: 'user-1',
          name: 'My Category',
          type: 'EXPENSE',
          isSystem: false,
          isActive: true,
        } as any)
        .mockResolvedValueOnce(null)

      await expect(
        categoryService.create('user-1', {
          name: 'My Category',
          type: 'EXPENSE',
          icon: '📦',
          color: '#3B82F6',
        })
      ).rejects.toThrow(AppError)
    })

    it('should throw error if category name conflicts with system category', async () => {
      // Mock findFirst to return null for user category check, then system category for conflict check
      vi.mocked(prisma.category.findFirst)
        .mockImplementation((args: any) => {
          if (args.where?.userId) {
            // User category check - return null
            return Promise.resolve(null)
          } else if (args.where?.isSystem) {
            // System category check - return conflict
            return Promise.resolve({
              id: 'cat-1',
              name: 'Food',
              type: 'EXPENSE',
              isSystem: true,
              isActive: true,
              userId: null,
            } as any)
          }
          return Promise.resolve(null)
        })

      await expect(
        categoryService.create('user-1', {
          name: 'Food',
          type: 'EXPENSE',
          icon: '🍔',
          color: '#FF5733',
        })
      ).rejects.toThrow('Category name conflicts with a system category')
    })
  })
})
