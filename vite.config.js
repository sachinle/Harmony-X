import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.svg'],
      manifest: {
        name: 'Harmony X',
        short_name: 'HarmonyX',
        description: 'Offline-first music streaming platform',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        start_url: '.',   // ✅ FIX: Required for Capacitor
        scope: '.',       // ✅ FIX: Prevents routing issues
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html', // ✅ FIX: React routing support
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],

  base: './', 

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, 
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  },

  server: {
    host: true,
    port: 5173
  },

  preview: {
    port: 4173
  }
})