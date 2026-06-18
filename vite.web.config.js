import { resolve } from 'node:path';

import { defineConfig } from 'vite';

import { rendererRoot, sharedRendererConfig } from './vite.renderer.shared.js';

export default defineConfig({
  ...sharedRendererConfig,
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist-web'),
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: { input: resolve(rendererRoot, 'index.html') },
  },
  // host: true (0.0.0.0) so on-device targets can reach the dev server — the
  // Android emulator hits the host via 10.0.2.2, which can't see a localhost-only
  // bind (the iOS sim shares the host loopback, so it works either way). 5181 is
  // only a preferred port: the cap:dev runner reads whichever port Vite actually
  // bound and syncs the native app to it, so a busy port just rolls to the next.
  server: { port: 5181, host: true },
});
