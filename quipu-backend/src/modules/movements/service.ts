// ============================================================
// modules/movements/service.ts — Movements Service
// Business logic for financial movements
// ============================================================

import { prisma } from '../../utils/prisma';
import { AppError } from '../../shared/middleware/errorHandler';
import { MovementType, MovementSource } from '@prisma/client';

interface CreateMovementData {
  type: MovementType;
  amount: number;
  description: string;
  categoryId: string;
  originalText?: string;
  movementDate: Date;
  source: MovementSource;
  notes?: string;
}

interface UpdateMovementData {
  type?: MovementType;
  amount?: number;
  description?: string;
  categoryId?: string;
  movementDate?: Date;
  notes?: string;
}

interface MovementFilters {
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
}

export class MovementsService {
  async getMovements(userId: string, filters: MovementFilters = {}) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.movementDate = {};
      if (filters.startDate) {
        where.movementDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.movementDate.lte = new Date(filters.endDate);
      }
    }

    const movements = await prisma.movement.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: [
        { movementDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Format dates for frontend and ensure amount is number
    console.log('movementDate raw:', movements[0]?.movementDate); return movements.map(m => ({
      ...m,
      amount: Number(m.amount) || 0,
      movementDate: m.movementDate ? `${m.movementDate.getUTCFullYear()}-${String(m.movementDate.getUTCMonth()+1).padStart(2,'0')}-${String(m.movementDate.getUTCDate()).padStart(2,'0')}` : null,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
      updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : null,
    }));
  }

  async getMovementById(userId: string, movementId: string) {
    const movement = await prisma.movement.findFirst({
      where: {
        id: movementId,
        userId,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
        aiParsingLog: true,
      },
    });

    if (!movement) {
      throw new AppError(404, 'Movement not found', 'MOVEMENT_NOT_FOUND');
    }

    return movement;
  }

  async createMovement(userId: string, data: CreateMovementData) {
    // Check if categoryId is a slug (text) or UUID
    const isSlug = !data.categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    // Verify category exists and belongs to user or is system category
    const category = await prisma.category.findFirst({
      where: isSlug 
        ? {
            slug: data.categoryId,
            OR: [
              { userId },
              { isSystem: true },
            ],
          }
        : {
            id: data.categoryId,
            OR: [
              { userId },
              { isSystem: true },
            ],
          },
    });

    if (!category) {
      throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }

    // Verify category type matches movement type
    if (category.type !== data.type) {
      throw new AppError(400, 'Category type does not match movement type', 'CATEGORY_TYPE_MISMATCH');
    }

    const movement = await prisma.movement.create({
      data: {
        userId,
        categoryId: category.id, // Use the actual UUID from the category
        type: data.type,
        amount: data.amount,
        description: data.description,
        originalText: data.originalText,
        movementDate: data.movementDate,
        source: data.source,
        notes: data.notes,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MOVEMENT_CREATED',
        entityType: 'movement',
        entityId: movement.id,
        metadata: {
          type: movement.type,
          amount: movement.amount.toString(),
        },
      },
    });

    return movement;
  }

  async updateMovement(userId: string, movementId: string, data: UpdateMovementData) {
    const movement = await prisma.movement.findFirst({
      where: {
        id: movementId,
        userId,
        deletedAt: null,
      },
    });

    if (!movement) {
      throw new AppError(404, 'Movement not found', 'MOVEMENT_NOT_FOUND');
    }

    // If category is being updated, verify it exists and type matches
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [
            { userId },
            { isSystem: true },
          ],
        },
      });

      if (!category) {
        throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }

      const movementType = data.type || movement.type;
      if (category.type !== movementType) {
        throw new AppError(400, 'Category type does not match movement type', 'CATEGORY_TYPE_MISMATCH');
      }
    }

    const updatedMovement = await prisma.movement.update({
      where: { id: movementId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.description && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.movementDate && { movementDate: data.movementDate }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MOVEMENT_UPDATED',
        entityType: 'movement',
        entityId: movementId,
        // Convertimos el objeto de forma segura a un JSON plano para Prisma
        metadata: JSON.parse(JSON.stringify(data)), 
      },
    });

    return updatedMovement;
  }

  async deleteMovement(userId: string, movementId: string) {
    const movement = await prisma.movement.findFirst({
      where: {
        id: movementId,
        userId,
        deletedAt: null,
      },
    });

    if (!movement) {
      throw new AppError(404, 'Movement not found', 'MOVEMENT_NOT_FOUND');
    }

    // Soft delete
    await prisma.movement.update({
      where: { id: movementId },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MOVEMENT_DELETED',
        entityType: 'movement',
        entityId: movementId,
        metadata: {
          type: movement.type,
          amount: movement.amount.toString(),
        },
      },
    });
  }
}
