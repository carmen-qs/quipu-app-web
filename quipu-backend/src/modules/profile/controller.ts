// ============================================================
// modules/profile/controller.ts — Profile Controller
// Handles user profile operations
// ============================================================

import { Response, NextFunction } from 'express';
import { ProfileService } from './service';
import type { AuthRequest } from '../../shared/types';
import { updateProfileSchema, changePasswordSchema } from './validation';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new Error('User ID not found in request');
      }
      
      const profile = await this.profileService.getProfile(req.userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new Error('User ID not found in request');
      }
      
      const validatedData = updateProfileSchema.parse(req.body);
      const profile = await this.profileService.updateProfile(req.userId, validatedData);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new Error('User ID not found in request');
      }
      
      const validatedData = changePasswordSchema.parse(req.body);
      await this.profileService.changePassword(req.userId, validatedData);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
