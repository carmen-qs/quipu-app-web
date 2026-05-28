// ============================================================
// modules/goals/routes.ts — Saving Goals Routes
// RF-015, RF-016, RF-017, RF-018, RF-019, RF-020
// ============================================================

import { Router } from 'express';
import { GoalsController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const goalsController = new GoalsController();

// All routes require authentication
router.use(authenticate);

// GET /api/goals - Get user's saving goals (RF-016)
router.get('/', goalsController.getGoals);

// GET /api/goals/:id - Get goal detail (RF-016)
router.get('/:id', goalsController.getGoalById);

// POST /api/goals - Create saving goal (RF-015)
router.post('/', goalsController.createGoal);

// PATCH /api/goals/:id - Update saving goal (RF-018)
router.patch('/:id', goalsController.updateGoal);

// DELETE /api/goals/:id - Delete saving goal (RF-019)
router.delete('/:id', goalsController.deleteGoal);

// POST /api/goals/:id/contributions - Add contribution to goal (RF-017)
router.post('/:id/contributions', goalsController.addContribution);

// POST /api/goals/:id/archive - Archive completed goal (RF-020)
router.post('/:id/archive', goalsController.archiveGoal);

export { router as goalsRouter };
