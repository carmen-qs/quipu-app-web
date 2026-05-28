// ============================================================
// shared/middleware/auth.test.ts — Auth Middleware Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authenticate, optionalAuthenticate } from './auth'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import type { AuthRequest } from '../types'

vi.mock('../../config', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-min-32-chars',
    },
  },
}))

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>
  let mockRes: any
  let mockNext: any

  beforeEach(() => {
    mockReq = {
      headers: {},
    }
    mockRes = {}
    mockNext = vi.fn()
    vi.clearAllMocks()
  })

  describe('authenticate', () => {
    it('should pass with valid token', () => {
      const validToken = jwt.sign(
        { userId: 'user-1', type: 'access' },
        'test-secret-key-min-32-chars',
        { expiresIn: '15m' }
      )

      mockReq.headers = { authorization: `Bearer ${validToken}` }

      authenticate(mockReq as AuthRequest, mockRes, mockNext)

      expect(mockReq.userId).toBe('user-1')
      expect(mockNext).toHaveBeenCalled()
    })

    it('should throw error if authorization header missing', () => {
      mockReq.headers = {}

      expect(() => {
        authenticate(mockReq as AuthRequest, mockRes, mockNext)
      }).toThrow(AppError)
    })

    it('should throw error if authorization header malformed', () => {
      mockReq.headers = { authorization: 'InvalidToken' }

      expect(() => {
        authenticate(mockReq as AuthRequest, mockRes, mockNext)
      }).toThrow(AppError)
    })

    it('should throw error if token type is not access', () => {
      const refreshToken = jwt.sign(
        { userId: 'user-1', type: 'refresh' },
        'test-secret-key-min-32-chars',
        { expiresIn: '7d' }
      )

      mockReq.headers = { authorization: `Bearer ${refreshToken}` }

      expect(() => {
        authenticate(mockReq as AuthRequest, mockRes, mockNext)
      }).toThrow(AppError)
    })

    it('should throw error if token is expired', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-1', type: 'access' },
        'test-secret-key-min-32-chars',
        { expiresIn: '-1h' }
      )

      mockReq.headers = { authorization: `Bearer ${expiredToken}` }

      expect(() => {
        authenticate(mockReq as AuthRequest, mockRes, mockNext)
      }).toThrow(AppError)
    })

    it('should throw error if token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' }

      expect(() => {
        authenticate(mockReq as AuthRequest, mockRes, mockNext)
      }).toThrow(AppError)
    })
  })

  describe('optionalAuthenticate', () => {
    it('should pass without token', () => {
      mockReq.headers = {}

      optionalAuthenticate(mockReq as AuthRequest, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.userId).toBeUndefined()
    })

    it('should pass with valid token', () => {
      const validToken = jwt.sign(
        { userId: 'user-1', type: 'access' },
        'test-secret-key-min-32-chars',
        { expiresIn: '15m' }
      )

      mockReq.headers = { authorization: `Bearer ${validToken}` }

      optionalAuthenticate(mockReq as AuthRequest, mockRes, mockNext)

      expect(mockReq.userId).toBe('user-1')
      expect(mockNext).toHaveBeenCalled()
    })

    it('should pass without throwing error for invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' }

      optionalAuthenticate(mockReq as AuthRequest, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.userId).toBeUndefined()
    })

    it('should pass without throwing error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-1', type: 'access' },
        'test-secret-key-min-32-chars',
        { expiresIn: '-1h' }
      )

      mockReq.headers = { authorization: `Bearer ${expiredToken}` }

      optionalAuthenticate(mockReq as AuthRequest, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.userId).toBeUndefined()
    })
  })
})
