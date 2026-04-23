import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    include: ['**/tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': '/Users/meetnishant/Documents/OpenMaps/src',
    },
  },
});
