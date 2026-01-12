import path from 'node:path'
import { fileURLToPath } from 'node:url'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue2'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    legacy({
      targets: ['ios >= 9'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: 'clock-dashboard',
        name: '天气时钟',
        short_name: '天气时钟',
        description: '基于 Vue 2 的天气时钟看板',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        display_override: ['window-controls-overlay'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/1.png',
            sizes: '2048x1536',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshots/1.png',
            sizes: '2048x1536',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 3100,
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
