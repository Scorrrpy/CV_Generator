/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { workspaceAliases } from '../../aliases.ts';

export default defineConfig({
  plugins: [
    react(),
    // Installable and offline-capable: everything the app needs is precached on the first visit.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'CV Generator',
        short_name: 'CV',
        description: 'Lebenslauf erstellen und als PDF exportieren – deine Daten bleiben auf deinem Gerät.',
        lang: 'de',
        start_url: '/',
        display: 'standalone',
        background_color: '#f6f7f9',
        theme_color: '#1f2a44',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        // The PDF engine is large; it has to be precached for offline use all the same.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  resolve: { alias: workspaceAliases },
  // The editor shows a PDF preview right away, so the PDF engine (~500 kB gzip) belongs in the main chunk.
  build: { chunkSizeWarningLimit: 1600 },
  test: {
    name: 'web',
    environment: 'jsdom',
  },
});
