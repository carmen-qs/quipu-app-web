// ============================================================
// modules/auth/controller.ts — Authentication Controller
// Handles authentication HTTP requests and responses
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { AppError } from '../../shared/middleware/errorHandler';
import { registerSchema, loginSchema } from './validation';
import type { AuthRequest } from '../../shared/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * RF-001: Registro de usuarios
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.authService.register(validatedData);

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return access token and user data (without refresh token in body)
      res.status(201).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user with email and password
   * RF-002: Login de usuarios
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData, req.ip, req.get('user-agent'));

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return access token and user data (without refresh token in body)
      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token using refresh token from cookie
   * RF-003: Renovación de tokens
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError(401, 'Missing refresh token', 'MISSING_REFRESH_TOKEN');
      }

      const result = await this.authService.refresh(refreshToken, req.ip, req.get('user-agent'));

      // Set new refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user (revoke current refresh token)
   * RF-004: Cierre de sesión
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout from all devices (revoke all refresh tokens)
   * RF-022: Cierre de sesión en todos los dispositivos
   */
  logoutAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError(401, 'Missing refresh token', 'MISSING_REFRESH_TOKEN');
      }

      await this.authService.logoutAll(refreshToken);

      // Create audit log
      await this.authService.logout(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  };
}
