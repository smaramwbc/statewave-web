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
    // All /api/* paths are Vercel Edge functions. In dev they're proxied to a
    // remote (the deployed site by default). To exercise locally edited
    // handlers, run `vercel dev` on port 3000 and start vite with
    // STATEWAVE_DEV_API=http://localhost:3000 npm run dev
    proxy: {
      '/api': {
        target: process.env.STATEWAVE_DEV_API ?? 'https://www.statewave.ai',
        changeOrigin: true,
        timeout: 30000,
      },
    },
  },
})
