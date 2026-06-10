import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'prisma/',
        'src/types/',
        'src/tests/',
        '**/routes.ts',
        '**/controller.ts',
        '**/validation.ts',
        'src/config/**',
        'src/utils/logger.ts',
        'src/index.ts',
        'src/utils/prisma.ts',
        'src/shared/middleware/errorHandler.ts',
        'src/shared/middleware/notFoundHandler.ts',
        'src/shared/types/**',
      ],
      all: true,
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
})
