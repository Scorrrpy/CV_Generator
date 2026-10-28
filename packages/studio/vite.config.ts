/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { workspaceAliases } from '../../aliases.ts';

/** Library build: ESM + one stylesheet (`@scorrrpy/cv-studio/style.css`), React and the engine stay external. */
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Tests run against the engine's source; the build keeps it as an external package import.
  resolve: command === 'serve' ? { alias: { '@scorrrpy/cv-engine': workspaceAliases['@scorrrpy/cv-engine'] } } : {},
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'cv-studio' },
    rollupOptions: { external: [/^react($|\/)/, /^react-dom($|\/)/, /^@scorrrpy\/cv-engine$/] },
  },
  test: {
    name: 'studio',
    environment: 'jsdom',
  },
}));
