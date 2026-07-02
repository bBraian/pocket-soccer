import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Pocket Soccer',
        short_name: 'Pocket Soccer',
        description: 'Futebol de botão — 1vCPU, PvP local e torneios mata-mata.',
        theme_color: '#0e1512',
        background_color: '#0e1512',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
