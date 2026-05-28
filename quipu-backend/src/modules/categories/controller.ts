// ============================================================
// modules/categories/controller.ts — Categories Controller
// Handles categories HTTP requests and responses
// ============================================================

import { Response, NextFunction } from 'express';
import { CategoryService } from './service';
import type { AuthRequest } from '../../shared/types';
import { createCategorySchema } from './validation';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * List all categories for the authenticated user
   * Returns system categories and user's custom categories
   */
  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new Error('User ID not found in request');
      }

      const categories = await this.categoryService.list(req.userId);
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a custom category for the authenticated user
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new Error('User ID not found in request');
      }

      const validatedData = createCategorySchema.parse(req.body);
      const category = await this.categoryService.create(req.userId, validatedData);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };
}
