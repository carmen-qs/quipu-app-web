// ============================================================
// modules/movements/routes.ts — Movements Routes
// RF-008, RF-009, RF-010, RF-011, RF-012, RF-013
// ============================================================

import { Router } from 'express';
import { MovementsController } from './controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();
const movementsController = new MovementsController();

// All routes require authentication
router.use(authenticate);

// POST /api/movements/parse - Parse text with AI (RF-008)
router.post('/parse', movementsController.parseText);

// GET /api/movements - Get movements history (RF-013)
router.get('/', movementsController.getMovements);

// GET /api/movements/:id - Get movement detail (RF-010)
router.get('/:id', movementsController.getMovementById);

// POST /api/movements - Create movement (RF-008)
router.post('/', movementsController.createMovement);

// PATCH /api/movements/:id - Update movement (RF-011)
router.patch('/:id', movementsController.updateMovement);

// DELETE /api/movements/:id - Delete movement (RF-012)
router.delete('/:id', movementsController.deleteMovement);

export { router as movementsRouter };
