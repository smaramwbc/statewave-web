# Statewave — Marketing Website

The official marketing site for [Statewave](https://statewave.dev), the Memory OS and trusted context runtime for AI agents.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Tailwind CSS v4** (CSS-first config)
- **Framer Motion** (scroll reveals, transitions)
- **Canvas 2D** hero animation (episodes → memories visualisation)
- **React Router** (SPA with 4 routes)

## Development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Run tests (Vitest) |

## Theme System

Supports auto / light / dark modes via `data-theme` attribute on `<html>`. Theme preference is persisted to `localStorage` and a no-FOUC inline script applies it before first paint.

## Deployment

Deployed to **Vercel**. SPA routing is handled via `vercel.json` rewrites. Any push to `main` triggers CI (GitHub Actions) then auto-deploys.

## Related Repos

- [statewave](https://github.com/statewaveHQ/statewave) — Backend API
- [statewave-py](https://github.com/statewaveHQ/statewave-py) — Python SDK
- [statewave-ts](https://github.com/statewaveHQ/statewave-ts) — TypeScript SDK
- [statewave-docs](https://github.com/statewaveHQ/statewave-docs) — Architecture & docs
