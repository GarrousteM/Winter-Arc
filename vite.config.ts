/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Couleurs du manifeste : reprises de src/theme/tokens.css (--color-bg), le manifeste ne lit pas le CSS.
const POLAR_NIGHT = '#0b111a';

// Chemin de publication (ex. « /Winter-Arc/ » sur GitHub Pages). Racine par défaut.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // L'aperçu hébergé (routeur en mémoire) ne peut pas installer de service worker.
      disable: process.env.VITE_ROUTER === 'memory',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Winter Arc',
        short_name: 'Winter Arc',
        description: 'Ton défi de 92 jours, transformé en jeu de progression.',
        lang: 'fr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: POLAR_NIGHT,
        background_color: POLAR_NIGHT,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Tout le nécessaire est précaché : l'app fonctionne en mode avion après la première visite.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliothèques dans des fichiers séparés : mises en cache indépendamment du code de l'app.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (id.includes('framer-motion') || id.includes('motion-')) return 'motion';
          if (id.includes('react-router')) return 'router';
          if (id.includes('@radix-ui')) return 'radix';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
