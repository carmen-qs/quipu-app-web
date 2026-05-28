// ============================================================
// index.ts — Entry Point
// Quipu Backend API
// ============================================================

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './shared/middleware/errorHandler';
import { notFoundHandler } from './shared/middleware/notFoundHandler';
import { authRouter } from './modules/auth/routes';
import { profileRouter } from './modules/profile/routes';
import { movementsRouter } from './modules/movements/routes';
import { goalsRouter } from './modules/goals/routes';
import { categoriesRouter } from './modules/categories/routes';
import { logger } from './utils/logger';

// Initialize Express app
const app: Express = express();

// ============================================================
// Middleware
// ============================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================
// Health Check
// ============================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============================================================
// API Routes
// ============================================================

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/categories', categoriesRouter);

// ============================================================
// Error Handling
// ============================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Quipu Backend API running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Database: ${config.database.url.substring(0, 20)}...`);
});

export default app;
