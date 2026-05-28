// ============================================================
// modules/profile/service.ts — Profile Service
// Business logic for user profile operations
// ============================================================

import bcrypt from 'bcrypt';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import { AppError } from '../../shared/middleware/errorHandler';

interface UpdateProfileData {
  name: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            movements: true,
            savingGoals: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        totalMovements: user._count.movements,
        totalGoals: user._count.savingGoals,
      },
    };
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (user.name === data.name) {
      throw new AppError(422, 'Name is unchanged', 'NAME_UNCHANGED');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        entityType: 'user',
        entityId: userId,
        metadata: { field: 'name' },
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, data: ChangePasswordData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect', 'INCORRECT_CURRENT_PASSWORD');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, config.bcrypt.rounds);

    // Update password and revoke all refresh tokens in transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: { isRevoked: true },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          entityType: 'user',
          entityId: userId,
        },
      }),
    ]);
  }
}
