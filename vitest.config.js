import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'config/vitest/setup.js')],
    include: [
      'src/**/*.test.{js,jsx}',
      'src/**/__tests__/**/*.{js,jsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'integration-tests',
      'platforms',
      'src/utils/network-exporters',
      'src/utils/networkQuery',
      'src/utils/protocol',
    ],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
