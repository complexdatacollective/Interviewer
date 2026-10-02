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
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    dynamicImportVarsOptions: {
      // Vite leaves dynamic imports in node_modules untransformed by default.
      // protocol-validation loads its validators with
      // import(`./schemas/${version}.js`), which then resolves against the
      // bundle instead of the package and fails for every protocol
      // ("Couldn't find validator for schema version N"). Transform that one
      // package so its schema files are bundled as chunks.
      exclude: [/^(?!.*\/@codaco\/protocol-validation\/).*\/node_modules\//],
    },
    // @codaco/ui reads animation settings by JSON.parse-ing CSS custom
    // properties (--animation-easing-json: [0.4, 0, 0.2, 1]). The CSS minifier
    // shortens those numbers to `.4`, which is not JSON, so every transition
    // threw and the mobile (web) build never rendered an interview. Ship CSS
    // unminified, as the Electron renderer already does.
    cssMinify: false,
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
