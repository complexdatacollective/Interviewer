import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Plugin to copy main process CommonJS files to dist.
 * The main process uses CommonJS and native modules that don't bundle well,
 * so we copy them directly instead of bundling.
 */
function copyMainProcess() {
  return {
    name: 'copy-main-process',
    closeBundle() {
      const srcDir = resolve(__dirname, 'public');
      const destDir = resolve(__dirname, 'dist/main');

      // Copy electron-starter.js as index.js (entry point)
      mkdirSync(destDir, { recursive: true });
      copyFileSync(
        resolve(srcDir, 'electron-starter.js'),
        resolve(destDir, 'index.js')
      );

      // Copy components directory
      if (existsSync(resolve(srcDir, 'components'))) {
        copyDir(resolve(srcDir, 'components'), resolve(destDir, 'components'));
      }

      // Copy icons directory
      if (existsSync(resolve(srcDir, 'icons'))) {
        copyDir(resolve(srcDir, 'icons'), resolve(destDir, 'icons'));
      }

      // Copy protocols directory (factory protocols)
      if (existsSync(resolve(srcDir, 'protocols'))) {
        copyDir(resolve(srcDir, 'protocols'), resolve(destDir, 'protocols'));
      }

      // Copy network-exporters module (runs in main process)
      const networkExportersDir = resolve(__dirname, 'src/utils/network-exporters');
      if (existsSync(networkExportersDir)) {
        copyDir(networkExportersDir, resolve(destDir, 'network-exporters'));
      }
    },
  };
}

export default defineConfig({
  main: {
    plugins: [copyMainProcess()],
    build: {
      outDir: 'dist/main',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'public/electron-starter.js'),
        output: {
          entryFileNames: '_dummy.js',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'public/preload/previewPreload.js'),
        },
      },
    },
  },
  renderer: {
    root: '.',
    define: {
      // Provide module shim for libraries that check module.hot (like redux-form)
      'module.hot': 'undefined',
    },
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
    plugins: [
      react({
        include: ['src/**/*.js', 'src/**/*.jsx'],
        babel: {
          babelrc: false,
          configFile: false,
          presets: [
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname, 'node_modules'),
      },
    },
    worker: {
      format: 'es',
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    optimizeDeps: {
      include: ['react-resize-aware'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
        jsx: 'automatic',
        jsxImportSource: 'react',
      },
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
            'mixed-decls',
            'slash-div',
          ],
          loadPaths: [
            resolve(__dirname, 'src/styles'),
            resolve(__dirname, 'node_modules'),
          ],
        },
      },
    },
    server: {
      port: 3000,
    },
  },
});
