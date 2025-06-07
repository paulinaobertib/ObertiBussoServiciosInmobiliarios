import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/app/property/tests/setup.ts',
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['**/node_modules/**', '**/tests/**', '**/*.d.ts'],
      all: false, // muestra solo la cobertura de tests realizados
    },
  },
});
