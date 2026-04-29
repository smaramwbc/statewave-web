# Statewave — Marketing Website

The official product website for [Statewave](https://statewave.dev), the trusted context runtime for AI agents.

> **Live:** [statewave.dev](https://statewave.dev)

## What this is

This is the public-facing marketing and product site for Statewave. It communicates what the product is, how it works, why it matters, and how developers can get started.

It is **not** the interactive demo (that's [statewave-demo](https://github.com/smaramwbc/statewave-demo)) or the documentation (that's [statewave-docs](https://github.com/smaramwbc/statewave-docs)).

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Framer Motion + Canvas 2D (hero) |
| Routing | React Router (SPA, 5 routes) |
| Testing | Vitest + Testing Library + happy-dom |
| CI | GitHub Actions (typecheck → lint → test → build) |
| Deployment | Vercel (auto-deploy on push to main) |

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Watch mode |

## Architecture

```
src/
  App.tsx            # Route definitions (lazy-loaded)
  main.tsx           # Entry point (BrowserRouter + ThemeProvider)
  index.css          # Tailwind + theme tokens (light/dark)
  lib/
    theme.tsx        # Theme context (auto/light/dark, localStorage, no-FOUC)
    seo.tsx          # Per-page SEO: title, OG, Twitter, canonical
  components/
    Layout.tsx       # Shell: skip-to-content, Navbar, main, Footer
    Navbar.tsx       # Fixed header with mobile menu, theme switcher
    HeroBackground.tsx  # Canvas 2D "episodes → memories" animation
    Footer.tsx       # Site footer with nav links
    ...              # Button, Card, Section, Logo, ThemeSwitcher, ScrollToTop
  pages/
    HomePage.tsx     # Hero + features + proof + CTA
    ProductPage.tsx  # How it works, domain model, scoring
    WhyPage.tsx      # Comparison: prompt stuffing vs RAG vs Statewave
    DevelopersPage.tsx  # SDKs, setup, API overview
    NotFoundPage.tsx # 404
```

## Theme system

Three modes: `auto` (system), `light`, `dark`. Implemented via:
1. `data-theme` attribute on `<html>`
2. CSS custom properties per theme in `index.css`
3. Inline script in `index.html` prevents FOUC
4. React context (`ThemeProvider`) for runtime switching
5. Persisted to `localStorage`

## SEO & metadata

- Per-page `<title>`, description, canonical URL
- Open Graph + Twitter Card tags (updated on navigation)
- JSON-LD structured data (SoftwareApplication)
- `robots.txt` + `sitemap.xml`
- `site.webmanifest` for PWA/installability hints
- OG image: `/og-image.png` (1200×630, dark gradient, brand copy)
- Source SVG: `/og-image.svg` (editable, re-export with ImageMagick: `magick og-image.svg og-image.png`)

## Accessibility

- Skip-to-content link
- Semantic landmarks (`<nav>`, `<main>`, `<footer>`)
- ARIA labels on navigation, theme switcher, mobile toggle
- `prefers-reduced-motion` disables all animations
- Focus-visible ring on keyboard navigation
- Escape closes mobile menu

## Deployment

Auto-deployed to Vercel on push to `main`. SPA routing handled via `vercel.json` rewrites.

Custom domain: `statewave.dev` (configure in Vercel dashboard).

## Ecosystem

| Repo | Description |
|------|-------------|
| [statewave](https://github.com/smaramwbc/statewave) | Core server — API, domain model, DB, services |
| [statewave-py](https://github.com/smaramwbc/statewave-py) | Python SDK |
| [statewave-ts](https://github.com/smaramwbc/statewave-ts) | TypeScript SDK |
| [statewave-demo](https://github.com/smaramwbc/statewave-demo) | Interactive comparison demo |
| [statewave-docs](https://github.com/smaramwbc/statewave-docs) | Architecture, API contracts, ADRs |
| [statewave-examples](https://github.com/smaramwbc/statewave-examples) | Runnable examples |

## GitHub repo settings

Recommended:
- **Description:** `Official website for Statewave — trusted context runtime for AI agents`
- **Website:** `https://statewave.dev`
- **Topics:** `statewave`, `ai-agents`, `memory`, `context-runtime`, `marketing-site`, `react`, `vite`

## License

Apache-2.0
