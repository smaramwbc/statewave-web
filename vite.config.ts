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
        // 60s — dev-only band-aid. The docs-grounded Statewave Support
        // persona's /v1/context call can hit a 10–30s embed_query latency
        // spike on the first uncached query (any LiteLLM-routed embedding
        // provider, depending on which one is configured). The actual fix
        // lives server-side in statewave/server/services/embeddings/
        // (`litellm.py` plus the L1 in-process LRU + L2 Postgres-backed
        // `query_embedding_cache` shipped in v0.7), which makes repeat
        // queries instant across all backend instances. This bump is only
        // for the cold-cache first hit during local verification —
        // production turns hit the cached path.
        timeout: 60000,
      },
    },
  },
})
