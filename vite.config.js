import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Precache the entire app shell so it loads offline with zero network
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          // ── Audio files — any source (SoundHelix, R2, Supabase Storage) ──
          {
            urlPattern: /\.(mp3|ogg|wav|flac|aac|m4a)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-files',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 24 * 60 * 60 }, // 60 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Cover-art / images ────────────────────────────────────────────
          {
            urlPattern: /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Supabase REST API (songs list, playlists, etc.) ───────────────
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Supabase Storage (audio bucket) ───────────────────────────────
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Cloudflare R2 audio ───────────────────────────────────────────
          {
            urlPattern: /^https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'r2-audio',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── SoundHelix demo MP3s ──────────────────────────────────────────
          {
            urlPattern: /^https:\/\/www\.soundhelix\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'soundhelix-audio',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── DiceBear avatars ──────────────────────────────────────────────
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatars',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Google Fonts / user photos ────────────────────────────────────
          {
            urlPattern: /^https:\/\/lh\d+\.googleusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-photos',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.svg', 'icons/*.png'],

      manifest: {
        name: 'Harmony X',
        short_name: 'HarmonyX',
        description: 'Offline-first music streaming platform',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],

  base: './',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: { host: true, port: 5173 },
  preview: { port: 4173 },
})
