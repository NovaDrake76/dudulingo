import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: 'segredo',
      DATABASE_URL: 'mongodb://mocked'
    },
    coverage: {
      provider: 'v8',
      include: ['api/**/*.ts'],
      exclude: ['api/db/fixtures.ts', 'api/db/seed.ts', 'api/auth/jwtStrategy.ts', 'api/auth/googleStrategy.ts', 'api/index.ts'],
      reporter: ['text', 'html'],
      reportsDirectory: './html/coverage',
      thresholds: {
        lines: 70,
        branches: 60,
        perFile: true
      } 
    }
  },
});
