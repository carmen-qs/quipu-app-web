// ============================================================
// modules/categories/service.ts — Categories Service
// Business logic for categories
// ============================================================

import { prisma } from '../../utils/prisma';
import { AppError } from '../../shared/middleware/errorHandler';
import type { CreateCategoryInput } from './validation';

export class CategoryService {
  /**
   * List all categories for a user
   * Returns system categories (isSystem: true) AND user's custom categories
   */
  async list(userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { isSystem: true },
          { userId },
        ],
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' },
      ],
    });

    return categories;
  }

  /**
   * Create a custom category for a user
   * Ensures the name is not duplicated for the same user and doesn't conflict with system categories
   */
  async create(userId: string, data: CreateCategoryInput) {
    // Check if category name already exists for this user
    const existingUserCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: data.name,
        type: data.type,
        isActive: true,
      },
    });

    if (existingUserCategory) {
      throw new AppError(409, 'Category name already exists for this user', 'CATEGORY_NAME_DUPLICATE');
    }

    // Check if category name conflicts with system categories of the same type
    const existingSystemCategory = await prisma.category.findFirst({
      where: {
        isSystem: true,
        name: data.name,
        type: data.type,
        isActive: true,
      },
    });

    if (existingSystemCategory) {
      throw new AppError(409, 'Category name conflicts with a system category', 'CATEGORY_NAME_SYSTEM_CONFLICT');
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        isSystem: false,
      },
    });

    return category;
  }
}
