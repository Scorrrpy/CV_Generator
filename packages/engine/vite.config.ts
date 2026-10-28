/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Library build: ESM only, dependencies stay external and are installed by the consumer. */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: { external: [/^react($|\/)/, /^@react-pdf\//, /^valibot$/] },
  },
  test: {
    name: 'engine',
    environment: 'node',
  },
});
