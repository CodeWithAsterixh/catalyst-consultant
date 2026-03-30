import { defineConfig } from 'vite';
import { motionLyte } from 'motion-lyte-js/vite'

export default defineConfig({
  // Root directory of the project
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  plugins: [motionLyte()]
});
