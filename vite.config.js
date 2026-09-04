import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'dev-html-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/index.dev.html'
          }
          next()
        })
      }
    },
    react(),
    viteSingleFile(),
    {
      name: 'sync-html-bundle',
      closeBundle() {
        if (fs.existsSync('dist/index.dev.html')) {
          fs.copyFileSync('dist/index.dev.html', 'dist/index.html')
          fs.unlinkSync('dist/index.dev.html')
        }
        if (fs.existsSync('dist/index.html')) {
          fs.copyFileSync('dist/index.html', 'index.html')
          console.log('[sync-html-bundle] Successfully updated root index.html and dist/index.html')
        }
      }
    }
  ],
  build: {
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: 'index.dev.html'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  base: './', // Use relative paths for assets
})
