// ============================================================
// modules/auth/routes.ts — Authentication Routes
// RF-001, RF-002, RF-003, RF-004, RF-022
// ============================================================

import { Router } from 'express';
import { AuthController } from './controller';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth endpoints (prevent brute force attacks)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register - Register new user (RF-001)
router.post('/register', authRateLimit, authController.register);

// POST /api/auth/login - Login user (RF-002)
router.post('/login', authRateLimit, authController.login);

// POST /api/auth/refresh - Refresh access token (RF-003)
router.post('/refresh', authController.refresh);

// POST /api/auth/logout - Logout user (RF-004)
router.post('/logout', authController.logout);

// POST /api/auth/logout-all - Logout from all devices (RF-022)
router.post('/logout-all', authController.logoutAll);

export { router as authRouter };
