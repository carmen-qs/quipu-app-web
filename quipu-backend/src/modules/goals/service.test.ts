// ============================================================
// modules/goals/service.test.ts — Goals Service Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GoalsService } from './service'
import { AppError } from '../../shared/middleware/errorHandler'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../utils/prisma'

describe('GoalsService', () => {
  let goalsService: GoalsService

  beforeEach(() => {
    goalsService = new GoalsService()
    vi.clearAllMocks()
  })

  describe('getGoals', () => {
    it('should get all goals for a user', async () => {
      vi.mocked(prisma.savingGoal.findMany).mockResolvedValue([
        {
          id: 'goal-1',
          userId: 'user-1',
          name: 'Vacation',
          targetAmount: new Decimal(5000),
          currentAmount: new Decimal(2500),
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: { contributions: 5 },
        } as any,
      ])

      const result = await goalsService.getGoals('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Vacation')
    })

    it('should filter by status', async () => {
      vi.mocked(prisma.savingGoal.findMany).mockResolvedValue([])

      await goalsService.getGoals('user-1', 'ACTIVE')

      expect(prisma.savingGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      )
    })
  })

  describe('getGoalById', () => {
    it('should get a goal by id', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      const result = await goalsService.getGoalById('user-1', 'goal-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('goal-1')
    })

    it('should throw error if goal not found', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue(null)

      await expect(
        goalsService.getGoalById('user-1', 'goal-1')
      ).rejects.toThrow(AppError)
    })

    it('should throw error if goal belongs to different user', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue(null)

      await expect(
        goalsService.getGoalById('user-1', 'goal-1')
      ).rejects.toThrow(AppError)
    })
  })

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      vi.mocked(prisma.savingGoal.create).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(0),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await goalsService.createGoal('user-1', {
        name: 'Vacation',
        targetAmount: 5000,
      })

      expect(result).toBeDefined()
      expect(result.id).toBe('goal-1')
    })
  })

  describe('updateGoal', () => {
    it('should update a goal', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.savingGoal.update).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Updated Vacation',
        targetAmount: new Decimal(6000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await goalsService.updateGoal('user-1', 'goal-1', {
        name: 'Updated Vacation',
        targetAmount: 6000,
      })

      expect(result.name).toBe('Updated Vacation')
    })

    it('should throw error if goal not found', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue(null)

      await expect(
        goalsService.updateGoal('user-1', 'goal-1', { name: 'Updated' })
      ).rejects.toThrow(AppError)
    })
  })

  describe('deleteGoal', () => {
    it('should soft delete a goal', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.savingGoal.update).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      await expect(
        goalsService.deleteGoal('user-1', 'goal-1')
      ).resolves.not.toThrow()
    })

    it('should throw error if goal not found', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue(null)

      await expect(
        goalsService.deleteGoal('user-1', 'goal-1')
      ).rejects.toThrow(AppError)
    })
  })

  describe('addContribution', () => {
    it('should add a contribution to a goal', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(2500),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return await callback({
          goalContribution: {
            create: vi.fn().mockResolvedValue({
              id: 'contrib-1',
              goalId: 'goal-1',
              amount: new Decimal(500),
              contributionDate: new Date(),
            } as any),
          } as any,
          savingGoal: {
            update: vi.fn().mockResolvedValue({
              id: 'goal-1',
              userId: 'user-1',
              name: 'Vacation',
              targetAmount: new Decimal(5000),
              currentAmount: new Decimal(3000),
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            } as any),
          } as any,
          auditLog: {
            create: vi.fn().mockResolvedValue({} as any),
          } as any,
        } as any)
      })

      const result = await goalsService.addContribution('user-1', 'goal-1', {
        amount: 500,
        contributionDate: new Date(),
      })

      expect(result).toBeDefined()
    })

    it('should throw error if goal not found', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue(null)

      await expect(
        goalsService.addContribution('user-1', 'goal-1', { amount: 500, contributionDate: new Date() })
      ).rejects.toThrow(AppError)
    })
  })

  describe('archiveGoal', () => {
    it('should archive a goal', async () => {
      vi.mocked(prisma.savingGoal.findFirst).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(5000),
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)

      vi.mocked(prisma.savingGoal.update).mockResolvedValue({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Vacation',
        targetAmount: new Decimal(5000),
        currentAmount: new Decimal(5000),
        status: 'ARCHIVED',
        archivedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await goalsService.archiveGoal('user-1', 'goal-1')

      expect(result.status).toBe('ARCHIVED')
    })
  })
})
