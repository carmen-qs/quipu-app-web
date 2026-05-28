import { vi } from 'vitest'

// Mock Prisma Client using importOriginal to preserve Enums and types
vi.mock('@prisma/client', async (importOriginal) => {
  const original = await importOriginal<typeof import('@prisma/client')>()
  return {
    ...original,
    PrismaClient: vi.fn().mockImplementation(() => ({
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      movement: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      savingGoal: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      goalContribution: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(vi.fn().mockImplementation(() => ({}))())),
      $disconnect: vi.fn(),
    })),
  }
})

// Mock config
vi.mock('../../config', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key',
      refreshSecret: 'test-refresh-secret-key',
      accessExpiration: '15m',
      refreshExpiration: '7d',
    },
    gemini: {
      apiKey: 'test-gemini-key',
    },
  },
}))

// Mock fetch for Gemini API
global.fetch = vi.fn()
