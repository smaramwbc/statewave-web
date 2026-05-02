import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { statewaveApiPlugin } from './server/vite-plugin'

export default defineConfig(({ mode }) => {
  // The api/*.ts edge handlers read server-only env vars via process.env
  // (STATEWAVE_URL, STATEWAVE_API_KEY). Vite's built-in .env loading only
  // exposes VITE_* to the client bundle, so explicitly copy non-VITE_ keys
  // from .env / .env.local / .env.<mode> into process.env. Shell env wins
  // over .env.* (so `STATEWAVE_URL=http://localhost:8100 npm run dev`
  // continues to work).
  const fileEnv = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(fileEnv)) {
    if (k.startsWith('VITE_')) continue
    if (process.env[k] === undefined) process.env[k] = v
  }

  // Default the upstream Statewave URL to the local docker-compose server
  // so `npm run dev` is a true single-process local stack out of the box.
  // Override with .env.local (STATEWAVE_URL=https://statewave-api.fly.dev)
  // when iterating the website against production data.
  if (!process.env.STATEWAVE_URL) {
    process.env.STATEWAVE_URL = 'http://localhost:8100'
  }

  return {
    plugins: [react(), tailwindcss(), statewaveApiPlugin()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
