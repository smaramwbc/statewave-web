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
        target: 'https://statewave-web.vercel.app',
        changeOrigin: true,
        timeout: 15000,
      },
    },
  },
})
