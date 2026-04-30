import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api/hero-data': {
        target: 'https://www.statewave.ai',
        changeOrigin: true,
        timeout: 15000,
      },
      '/api/widget-chat': {
        target: 'https://www.statewave.ai',
        changeOrigin: true,
        timeout: 30000,
      },
    },
  },
})
