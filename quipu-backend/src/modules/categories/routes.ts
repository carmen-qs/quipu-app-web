// ============================================================
// modules/categories/routes.ts — Categories Routes
// RF-009
// ============================================================

import { Router } from 'express';
import { CategoryController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// All routes require authentication
router.use(authenticate);

// GET /api/categories - Get categories (RF-009)
router.get('/', categoryController.list);

// POST /api/categories - Create custom category (requires auth)
router.post('/', categoryController.create);

export { router as categoriesRouter };
