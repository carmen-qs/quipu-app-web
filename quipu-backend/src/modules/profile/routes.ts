// ============================================================
// modules/profile/routes.ts — Profile Routes
// RF-005, RF-006, RF-007, RF-022
// ============================================================

import { Router } from 'express';
import { ProfileController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const profileController = new ProfileController();

// All routes require authentication
router.use(authenticate);

// GET /api/profile - Get user profile (RF-005)
router.get('/', profileController.getProfile);

// PATCH /api/profile - Update user name (RF-006)
router.patch('/', profileController.updateProfile);

// POST /api/profile/change-password - Change password (RF-007)
router.post('/change-password', profileController.changePassword);

export { router as profileRouter };
