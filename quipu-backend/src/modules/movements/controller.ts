// ============================================================
// modules/movements/controller.ts — Movements Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { MovementsService } from './service';
import { AIService } from './aiService';
import { createMovementSchema, updateMovementSchema } from './validation';
import type { AuthRequest } from '../../shared/types';

const movementsService = new MovementsService();
const aiService = new AIService();

export class MovementsController {
  async getMovements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const movements = await movementsService.getMovements(req.userId);
      res.status(200).json({ data: movements });
    } catch (error) {
      next(error);
    }
  }

  async getMovementById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const movementId = String(req.params.id);
      const movement = await movementsService.getMovementById(req.userId, movementId);
      res.status(200).json(movement);
    } catch (error) {
      next(error);
    }
  }

  async parseText(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required' });
      }

      if (text.length > 500) {
        return res.status(400).json({ error: 'Text must be less than 500 characters' });
      }

      const parsed = await aiService.parseText(text);
      res.status(200).json(parsed);
    } catch (error) {
      next(error);
    }
  }

  async createMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const validatedData = createMovementSchema.parse(req.body);
      const movement = await movementsService.createMovement(req.userId, validatedData as any);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  async updateMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const movementId = String(req.params.id);
      const validatedData = updateMovementSchema.parse(req.body);
      const movement = await movementsService.updateMovement(req.userId, movementId, validatedData as any);
      res.status(200).json(movement);
    } catch (error) {
      next(error);
    }
  }

  async deleteMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const movementId = String(req.params.id);
      await movementsService.deleteMovement(req.userId, movementId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}