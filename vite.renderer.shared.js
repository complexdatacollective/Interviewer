import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';

export const rendererRoot = resolve(__dirname, 'src');

export const sharedRendererConfig = {
  root: rendererRoot,
  define: {
    // Provide module shim for libraries that check module.hot (like redux-form)
    'module.hot': 'undefined',
  },
  resolve: {
    alias: {
      '@': rendererRoot,
      '~': resolve(__dirname, 'node_modules'),
      // Shim for react-resize-aware which has a broken build (uses jsx without importing it)
      'react-resize-aware': resolve(
        __dirname,
        'src/shims/react-resize-aware.js',
      ),
    },
  },
  plugins: [react()],
  worker: { format: 'es' },
  optimizeDeps: {
    // csvtojson's CJS browser build is imported only from csvDecoder.worker.js;
    // include it so the dep optimizer pre-bundles it (CJS->ESM) for the worker.
    include: [
      'react-resize-aware',
      '@codaco/ui',
      'csvtojson/browser/browser.js',
    ],
    // protocol-validation dynamically imports ./schemas/<version>.js at runtime;
    // the dep optimizer can't follow that, so serve it unbundled.
    exclude: ['@codaco/protocol-validation'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: [
          'import',
          'global-builtin',
          'legacy-js-api',
          'color-functions',
          'slash-div',
          'if-function',
        ],
        loadPaths: [
          resolve(__dirname, 'src/styles'),
          resolve(__dirname, 'node_modules'),
        ],
      },
    },
  },
};
