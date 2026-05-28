// ============================================================
// modules/goals/service.ts — Goals Service
// Business logic for saving goals
// ============================================================

import { prisma } from '../../utils/prisma';
import { AppError } from '../../shared/middleware/errorHandler';
import { GoalStatus } from '@prisma/client';

interface CreateGoalData {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date;
  icon?: string;
  color?: string;
}

interface UpdateGoalData {
  name?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: Date;
  icon?: string;
  color?: string;
}

interface AddContributionData {
  amount: number;
  notes?: string;
  contributionDate: Date;
}

export class GoalsService {
  async getGoals(userId: string, status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const goals = await prisma.savingGoal.findMany({
      where,
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return goals;
  }

  async getGoalById(userId: string, goalId: string) {
    const goal = await prisma.savingGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
      include: {
        contributions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            contributionDate: 'desc',
          },
        },
      },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found', 'GOAL_NOT_FOUND');
    }

    return goal;
  }

  async createGoal(userId: string, data: CreateGoalData) {
    const goal = await prisma.savingGoal.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate,
        icon: data.icon,
        color: data.color || '#3B82F6',
        currentAmount: 0,
        status: GoalStatus.ACTIVE,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GOAL_CREATED',
        entityType: 'saving_goal',
        entityId: goal.id,
        metadata: {
          targetAmount: goal.targetAmount.toString(),
        },
      },
    });

    return goal;
  }

  async updateGoal(userId: string, goalId: string, data: UpdateGoalData) {
    const goal = await prisma.savingGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found', 'GOAL_NOT_FOUND');
    }

    const updatedGoal = await prisma.savingGoal.update({
      where: { id: goalId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.targetAmount && { targetAmount: data.targetAmount }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color && { color: data.color }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GOAL_UPDATED',
        entityType: 'saving_goal',
        entityId: goalId,
        metadata: JSON.parse(JSON.stringify(data)),
      },
    });

    return updatedGoal;
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await prisma.savingGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found', 'GOAL_NOT_FOUND');
    }

    await prisma.savingGoal.update({
      where: { id: goalId },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GOAL_DELETED',
        entityType: 'saving_goal',
        entityId: goalId,
      },
    });
  }

  async addContribution(userId: string, goalId: string, data: AddContributionData) {
    const goal = await prisma.savingGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
        status: GoalStatus.ACTIVE,
      },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found or not active', 'GOAL_NOT_FOUND');
    }

    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          userId,
          amount: data.amount,
          notes: data.notes,
          contributionDate: data.contributionDate,
        },
      });

      const newCurrentAmount = Number(goal.currentAmount) + data.amount;
      const isCompleted = newCurrentAmount >= Number(goal.targetAmount);

      const updatedGoal = await tx.savingGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount,
          ...(isCompleted && {
            status: GoalStatus.COMPLETED,
            completedAt: new Date(),
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'GOAL_CONTRIBUTION_ADDED',
          entityType: 'goal_contribution',
          entityId: contribution.id,
          metadata: {
            goalId,
            amount: data.amount.toString(),
          },
        },
      });

      if (isCompleted) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'GOAL_COMPLETED',
            entityType: 'saving_goal',
            entityId: goalId,
          },
        });
      }

      return { contribution, goal: updatedGoal };
    });

    return result;
  }

  async archiveGoal(userId: string, goalId: string) {
    const goal = await prisma.savingGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
        status: GoalStatus.COMPLETED,
      },
    });

    if (!goal) {
      throw new AppError(404, 'Goal not found or not completed', 'GOAL_NOT_FOUND');
    }

    const updatedGoal = await prisma.savingGoal.update({
      where: { id: goalId },
      data: {
        status: GoalStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'GOAL_ARCHIVED',
        entityType: 'saving_goal',
        entityId: goalId,
      },
    });

    return updatedGoal;
  }
}