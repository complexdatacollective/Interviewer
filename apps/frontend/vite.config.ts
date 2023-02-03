import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@behaviours': path.resolve(__dirname, './src/behaviours/'),
      '@components': path.resolve(__dirname, './src/components'),
      '@containers': path.resolve(__dirname, './src/containers'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@ducks': path.resolve(__dirname, './src/ducks'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@images': path.resolve(__dirname, './src/images'),
      '@interfaces': path.resolve(__dirname, './src/components/interfaces'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@selectors': path.resolve(__dirname, './src/selectors'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: '127.0.0.1', // For some reason, localhost doesn't work
  }
});