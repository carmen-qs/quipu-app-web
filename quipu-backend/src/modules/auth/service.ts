// ============================================================
// modules/auth/service.ts — Authentication Service
// Business logic for authentication
// ============================================================

import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import { AppError } from '../../shared/middleware/errorHandler';
import crypto from 'crypto';
import type { RegisterData, LoginData, RegisterResponse, LoginResponse, RefreshResponse } from '../../shared/types';

export class AuthService {
  /**
   * Register a new user
   * RF-001: Registro de usuarios
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered', 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password with bcrypt (min 12 rounds as per security requirements)
    const passwordHash = await bcrypt.hash(data.password, config.bcrypt.rounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Store refresh token (hashed with SHA-256)
    await this.storeRefreshToken(user.id, refreshToken);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'user',
        entityId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Login user with email and password
   * RF-002: Login de usuarios
   */
  async login(data: LoginData, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(401, 'Account is deactivated', 'ACCOUNT_DEACTIVATED');
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          entityType: 'user',
          entityId: user.id,
          ipAddress,
          userAgent,
        },
      });

      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken, ipAddress, userAgent);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entityType: 'user',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * RF-003: Renovación de tokens
   */
  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<RefreshResponse> {
    // Hash the refresh token to compare with stored hash (SHA-256)
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Check if token is revoked
    if (storedToken.isRevoked) {
      throw new AppError(401, 'Refresh token has been revoked', 'INVALID_REFRESH_TOKEN');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      throw new AppError(401, 'Account is deactivated', 'ACCOUNT_DEACTIVATED');
    }

    // Revoke old refresh token (rotation for security)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      storedToken.user.id
    );

    // Store new refresh token
    await this.storeRefreshToken(storedToken.user.id, newRefreshToken, ipAddress, userAgent);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: storedToken.user.id,
        action: 'TOKEN_REFRESHED',
        entityType: 'refresh_token',
        entityId: storedToken.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user (revoke current refresh token)
   * RF-004: Cierre de sesión
   */
  async logout(refreshToken: string): Promise<void> {
    // Hash the refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Revoke the refresh token
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Logout from all devices (revoke all refresh tokens)
   * RF-022: Cierre de sesión en todos los dispositivos
   */
  async logoutAll(refreshToken: string): Promise<void> {
    // Hash the refresh token to get user ID
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: storedToken.userId,
        action: 'LOGOUT_ALL',
        entityType: 'user',
        entityId: storedToken.userId,
      },
    });
  }

  /**
   * Generate JWT access and refresh tokens
   * Access token: 15 minutes
   * Refresh token: 7 days
   */
  private async generateTokens(userId: string) {
    const accessTokenOptions: SignOptions = {
      expiresIn: config.jwt.accessExpiration as SignOptions['expiresIn'],
    };
    const refreshTokenOptions: SignOptions = {
      expiresIn: config.jwt.refreshExpiration as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.jwt.secret,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.jwt.secret,
      refreshTokenOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in database (hashed with SHA-256)
   * Includes family UUID for token rotation
   */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const family = crypto.randomUUID();

    // Parse expiration time from config (e.g., "7d" -> 7 days)
    const expirationDays = parseInt(config.jwt.refreshExpiration) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family,
        expiresAt,
        ipAddress,
        deviceInfo: userAgent,
      },
    });
  }

  /**
   * Verify JWT token and return payload
   */
  verifyAccessToken(token: string): { userId: string; type: string } {
    try {
      return jwt.verify(token, config.jwt.secret) as { userId: string; type: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Token has expired', 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
      }
      throw new AppError(401, 'Token verification failed', 'TOKEN_VERIFICATION_FAILED');
    }
  }
}
