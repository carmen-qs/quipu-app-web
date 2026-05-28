// ============================================================
// shared/middleware/notFoundHandler.ts — 404 Handler
// Handles requests to non-existent routes
// ============================================================

import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
};
