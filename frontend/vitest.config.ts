import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.ts',
    coverage: {
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      exclude: ['**/node_modules/**', '**/tests/**', '**/*.d.ts'],
      all: false, // muestra solo la cobertura de tests realizados
    },
  },
});
