import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { disableAnimationsSetup } from '@codaco/vitest-config/legacy/setup-path';

const configDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      fileURLToPath(import.meta.resolve(disableAnimationsSetup)),
      path.resolve(configDirectory, 'config/vitest/setup.js'),
    ],
    include: ['src/**/*.test.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
    exclude: [
      'node_modules',
      'dist',
      'integration-tests',
      'platforms',
      'src/utils/network-exporters',
      'src/utils/networkQuery',
    ],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(configDirectory, 'src'),
    },
  },
});
