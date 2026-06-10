// ============================================================
// modules/goals/controller.ts — Goals Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { GoalsService } from './service';
import { createGoalSchema, updateGoalSchema, addContributionSchema } from './validation';
import type { AuthRequest } from '../../shared/types';

const goalsService = new GoalsService();

export class GoalsController {
  async getGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goals = await goalsService.getGoals(req.userId);
      res.status(200).json({ data: goals });
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goalId = String(req.params.id);
      const goal = await goalsService.getGoalById(req.userId, goalId);
      res.status(200).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async createGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const validatedData = createGoalSchema.parse(req.body);
      const goal = await goalsService.createGoal(req.userId, validatedData as any);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goalId = String(req.params.id);
      const validatedData = updateGoalSchema.parse(req.body);
      const goal = await goalsService.updateGoal(req.userId, goalId, validatedData as any);
      res.status(200).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goalId = String(req.params.id);
      await goalsService.deleteGoal(req.userId, goalId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addContribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goalId = String(req.params.id);
      const validatedData = addContributionSchema.parse(req.body);
      const result = await goalsService.addContribution(req.userId, goalId, validatedData as any);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async archiveGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const goalId = String(req.params.id);
      const goal = await goalsService.archiveGoal(req.userId, goalId);
      res.status(200).json(goal);
    } catch (error) {
      next(error);
    }
  }
}