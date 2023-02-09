import { rmSync } from 'node:fs'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist', { recursive: true, force: true })

  const isBuild = command === 'build'

  return {
    plugins: [
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'src/main.ts',
          vite: {
            build: {
              sourcemap: 'inline',
              minify: isBuild,
              outDir: 'dist',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        {
          entry: 'src/preload.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              minify: isBuild,
              outDir: 'dist',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        }
      ]),
    ],
  }
})