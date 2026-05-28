// ============================================================
// modules/movements/service.test.ts — Movements Service Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MovementsService } from './service'
import { AppError } from '../../shared/middleware/errorHandler'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../utils/prisma'

describe('MovementsService', () => {
  let movementsService: MovementsService

  beforeEach(() => {
    movementsService = new MovementsService()
    vi.clearAllMocks()
  })

  describe('getMovements', () => {
    it('should get all movements for a user', async () => {
      vi.mocked(prisma.movement.findMany).mockResolvedValue([
        {
          id: 'mov-1',
          userId: 'user-1',
          categoryId: 'cat-1',
          type: 'EXPENSE',
          amount: new Decimal(100),
          description: 'Test expense',
          originalText: null,
          movementDate: new Date(),
          source: 'MANUAL',
          notes: null,
          isConfirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as any,
      ])

      const result = await movementsService.getMovements('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('Test expense')
    })

    it('should filter by category', async () => {
      vi.mocked(prisma.movement.findMany).mockResolvedValue([])

      await movementsService.getMovements('user-1', { categoryId: 'cat-1' })

      expect(prisma.movement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      )
    })

    it('should filter by type', async () => {
      vi.mocked(prisma.movement.findMany).mockResolvedValue([])

      await movementsService.getMovements('user-1', { type: 'EXPENSE' })

      expect(prisma.movement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'EXPENSE',
          }),
        })
      )
    })
  })

  describe('getMovementById', () => {
    it('should get a movement by id', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        description: 'Test expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      const result = await movementsService.getMovementById('user-1', 'mov-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('mov-1')
    })

    it('should throw error if movement not found', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue(null)

      await expect(
        movementsService.getMovementById('user-1', 'mov-1')
      ).rejects.toThrow(AppError)
    })

    it('should throw error if movement belongs to different user', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue(null)

      await expect(
        movementsService.getMovementById('user-1', 'mov-1')
      ).rejects.toThrow(AppError)
    })
  })

  describe('createMovement', () => {
    it('should create a new movement', async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue({
        id: 'cat-1',
        name: 'Food',
        type: 'EXPENSE',
        isSystem: true,
      } as any)
      vi.mocked(prisma.movement.create).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        description: 'Test expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await movementsService.createMovement('user-1', {
        type: 'EXPENSE',
        amount: 100,
        description: 'Test expense',
        categoryId: 'cat-1',
        movementDate: new Date(),
        source: 'MANUAL',
      })

      expect(result).toBeDefined()
      expect(result.id).toBe('mov-1')
    })
  })

  describe('updateMovement', () => {
    it('should update a movement', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        description: 'Test expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.movement.update).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(200),
        description: 'Updated expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await movementsService.updateMovement('user-1', 'mov-1', {
        amount: 200,
        description: 'Updated expense',
      })

      expect(Number(result.amount)).toBe(200)
      expect(result.description).toBe('Updated expense')
    })

    it('should throw error if movement not found', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue(null)

      await expect(
        movementsService.updateMovement('user-1', 'mov-1', { amount: 200 })
      ).rejects.toThrow(AppError)
    })
  })

  describe('deleteMovement', () => {
    it('should soft delete a movement', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        description: 'Test expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.movement.update).mockResolvedValue({
        id: 'mov-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        description: 'Test expense',
        originalText: null,
        movementDate: new Date(),
        source: 'MANUAL',
        notes: null,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      await expect(
        movementsService.deleteMovement('user-1', 'mov-1')
      ).resolves.not.toThrow()
    })

    it('should throw error if movement not found', async () => {
      vi.mocked(prisma.movement.findFirst).mockResolvedValue(null)

      await expect(
        movementsService.deleteMovement('user-1', 'mov-1')
      ).rejects.toThrow(AppError)
    })
  })
})
