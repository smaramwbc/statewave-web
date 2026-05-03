# Statewave — Marketing Website

The official product website for [Statewave](https://statewave.ai), the trusted context runtime for AI agents.

> **Live:** [statewave.ai](https://statewave.ai)
>
> 📋 **Issues & feature requests:** [statewave/issues](https://github.com/smaramwbc/statewave/issues) (centralized tracker)

> **Frontend role:** This is the **public marketing site** — product positioning, features, developer resources, and an embedded chat-widget demo that talks to a live Statewave backend. For the operator console, see [statewave-admin](https://github.com/smaramwbc/statewave-admin).

## What this is

This is the public-facing marketing and product site for Statewave. It communicates what the product is, how it works, why it matters, and how developers can get started. It also hosts the **embedded comparison demo** — a floating chat widget that shows the same question answered side-by-side by a stateless agent and a Statewave-backed agent, against a live API.

It is **not** the documentation (that's [statewave-docs](https://github.com/smaramwbc/statewave-docs)) or the operator console (that's [statewave-admin](https://github.com/smaramwbc/statewave-admin)).

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Framer Motion + Canvas 2D (hero) |
| Routing | React Router (SPA, 5 routes + 404 catch-all) |
| Testing | Vitest + Testing Library + happy-dom |
| CI | GitHub Actions (typecheck → lint → test → build) |
| Deployment | Vercel (auto-deploy on push to main) |

## Local development

```bash
npm install
npm run dev        # http://localhost:5173 — full local stack, no proxy
```

By default `npm run dev` points the website at a **local Statewave server on `http://localhost:8100`** (run [`statewave`](https://github.com/smaramwbc/statewave) via `docker compose up -d` first). The `api/*.ts` Edge handlers run in-process via a Vite middleware (`server/vite-plugin.ts`) — no `vercel dev` and no remote proxy needed.

To point the website at production data instead, set `STATEWAVE_URL` in `.env.local`:

```bash
# .env.local
STATEWAVE_URL=https://statewave-api.fly.dev
STATEWAVE_API_KEY=...   # optional — only if the upstream requires X-API-Key
```

Shell env wins over `.env.local`, so a one-shot override also works: `STATEWAVE_URL=https://statewave-api.fly.dev npm run dev`.

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
  App.tsx               # Route definitions (lazy-loaded after HomePage)
  main.tsx              # Entry point (BrowserRouter + ThemeProvider)
  index.css             # Tailwind + theme tokens, scrollbar, tour pulse, cursor rules
  lib/
    theme.tsx           # Theme context (auto/light/dark, localStorage, no-FOUC)
    seo.tsx             # Per-page SEO: title, OG, Twitter, canonical
    widget-context.tsx  # Chat-widget global state, demo persistence, onboarding tour
    manifesto-i18n.ts   # /why manifesto translations (the only translatable surface)
  components/
    Layout.tsx          # Shell: skip-to-content, Navbar, main, Footer, ScrollToTop, ChatWidget
    Navbar.tsx          # Fixed header with mobile menu, theme switcher
    Footer.tsx          # Site footer with nav links
    HeroBackground.tsx  # Canvas 2D particle visualization (live data)
    ChatWidget.tsx      # Embedded comparison demo + onboarding flow
    Heading.tsx         # Section heading with always-visible # anchor + clipboard copy
    CardAnchor.tsx      # Same affordance for use-case / connector cards
    ReturnLink.tsx      # Cross-page back link that restores exact scroll position
    ScrollToTop.tsx     # Route-change scroll handler (honors hash + saved Y)
    ScrollToTopButton.tsx  # Floating back-to-top FAB
    Section.tsx         # Standardized full-width section wrapper
    Button.tsx          # forwardRef-aware primary / secondary / ghost button
    Card.tsx, Logo.tsx, ThemeSwitcher.tsx
  services/
    statewave-live.ts   # Fetch live hero data from Statewave API via proxy
  pages/
    HomePage.tsx        # Hero, what/why, use cases, support proof, capabilities, proof, CTA
    ProductPage.tsx     # Core loop, domain model, support intelligence, privacy, scoring
    WhyPage.tsx         # Manifesto + technical comparison vs prompt stuffing / RAG
    UseCasesPage.tsx    # Use case map — categories, status pills, connectors, frontier ideas
    DevelopersPage.tsx  # SDKs, quick install, links to docs/examples
    NotFoundPage.tsx    # 404
api/
  _demo.ts              # Shared visitor cookie + Statewave fetch helpers
  demo-state.ts         # GET — issue/restore visitor cookie + return memory pool
  demo-seed.ts          # POST — copy showcase episodes into the visitor's persona pool
  demo-reset.ts         # POST — wipe all of a visitor's persona subjects + reissue cookie
  widget-chat.ts        # POST — stateless / Statewave-mode chat (writes episode + compiles)
  hero-data.ts          # GET — proxy live hero-page data from Fly.io backend
tests/
  widget.test.tsx, widget-onboarding.test.tsx, demo-persistence.test.ts,
  smoke.test.tsx, theme.test.tsx, routes.test.tsx
```

## Hero visualization

The hero background is a Canvas 2D particle system that fetches **live data** from the Statewave Fly.io backend (via a Vercel Edge Function proxy at `/api/hero-data`).

It visualizes the 3-tier Statewave data model:
- **Subjects** — large central nodes (one per `subject_id`)
- **Memories** — medium nodes orbiting their subject
- **Episodes** — small particles orbiting their parent memory

All particles are interactive: hover shows tooltips, click opens a detail modal with memory content and related episodes. Particle interaction is automatically suspended while the chat widget is open so visitors don't accidentally re-trigger the demo.

## Chat widget / embedded demo

The floating chat widget is a real Statewave-backed comparison surface, not a mock. Architecture:

- **Identity:** anonymous first-party HttpOnly cookie `sw_demo_visitor` (UUID v4, `Path=/`, `SameSite=Lax`, `Secure` in prod, 30-day Max-Age). No fingerprinting, no localStorage for the id.
- **Persona kinds:** the dropdown exposes two kinds. **Visitor-memory** personas (Support Agent, Coding Assistant, Sales Copilot, DevOps Agent, Research Assistant) each get a per-visitor subject `demo_web_<uuid>__<persona>` and run the full write/compile/seed cycle. **Docs-shared** personas (currently *Statewave Support*) read from a fixed shared subject `statewave-support-docs` populated upstream from the official docs corpus by `statewave/scripts/bootstrap_docs_pack.py`. Docs-shared personas never write, never compile, and are not visitor-resettable.
- **Per-turn flow (visitor-memory):** `widget-chat` writes an episode under the active persona's subject, runs `compile`, fetches ranked context, and asks the Statewave server to run the chat completion via `POST /v1/llm/complete`. The "without memory" column is a parallel call to the same Statewave-server endpoint with no context. The website never talks to an LLM provider directly — provider/model selection lives entirely in the Statewave server's LiteLLM config.
- **Per-turn flow (docs-shared):** `widget-chat` fetches ranked context from `statewave-support-docs`, injects it into a docs-grounded system prompt that requires citations and forbids fabrication, and asks the Statewave server's `/v1/llm/complete` to generate the reply. No write, no compile.
- **Reset:** wipes every visitor-memory subject for the visitor and reissues a fresh cookie. The shared docs subject is excluded by construction (`allSubjectsFor()` only iterates visitor-memory personas).
- **Two entry points (modes):** the widget renders one of two surfaces depending on how it was opened. The floating "Try the demo" launcher and on-page demo CTAs open `mode='demo'` — full persona picker, dual-column comparison, marketing copy, and the 3-step guided tour. The "Ask Support" navbar button (and the `?ask=support` deep link) open `mode='support'` — pinned to the `statewave-support` persona, single-column chat, no picker, no tour, and support-toned copy. The mode flag lives in [`widget-context.tsx`](src/lib/widget-context.tsx) and is set by `openWidget(persona, label, mode)`. Ask Support is a focused production support channel, not a demo — it must never expose persona/demo choices, comparison framing, or internal subject ids.
- **Onboarding:** versioned localStorage flag (`statewave-demo-onboarding-v1`) gates a one-time welcome panel + 3-step guided tour. Reset does **not** bring the welcome back — onboarding is UI state, not data. The guided tour only runs in `mode='demo'`; support mode uses a one-screen welcome with no tour.
- **Abuse caps:** 200 episodes per visitor, 1000 chars per message. Docs-shared personas don't accrue episodes, so the cap doesn't apply.

The widget logic lives in [`src/lib/widget-context.tsx`](src/lib/widget-context.tsx); the visual layer in [`src/components/ChatWidget.tsx`](src/components/ChatWidget.tsx); the server side in [`api/`](api/) (see structure above).

## Heading anchor convention

Every navigable section title across the site is rendered with [`<Heading>`](src/components/Heading.tsx) — never a raw `<h2>`. The component renders a stable `id`, an always-visible `#` button, and copies a deep link to clipboard on click. Slug ids are part of the URL contract — once shipped, don't rename them. See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for the full convention.

## Use Cases page

`/use-cases` is the inventory of what developers can build with Statewave. It is content-driven — every card on the page comes from one of three inline arrays at the top of [`pages/UseCasesPage.tsx`](src/pages/UseCasesPage.tsx):

| Array | Purpose |
|---|---|
| `USE_CASES` | Use cases tagged with a `category` (7 options) and a `status` (`strongest` / `good-fit` / `future`). `strongest` entries auto-promote to the featured "Strongest today" section; everything else lands in the filterable explorer. |
| `CONNECTORS` | Bootstrap/import patterns, grouped into `CONNECTOR_GROUPS` (support, engineering, docs, CRM, realtime, events). |
| `FRONTIER_IDEAS` | Forward-looking ideas; rendered with subtle dashed cards. |

To add a use case: append one object. Categories, counts, status pills, and the "showing X of Y" line wire themselves. To promote a `good-fit` workflow once it becomes proven, change its `status` to `'strongest'` — it moves into the featured grid and out of the explorer pool automatically.

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

## Environment variables

Both production (Vercel project) and local dev (`.env.local` or shell env) read the same names — `npm run dev` pipes them into `process.env` automatically:

| Variable | Used by | Purpose |
|---|---|---|
| `STATEWAVE_URL` | all `api/*` handlers | Statewave API base URL. Default in dev: `http://localhost:8100`. In Vercel production, set to the deployed Statewave host (e.g. `https://statewave-api.fly.dev`). |
| `STATEWAVE_API_KEY` | all `api/*` handlers | Server-to-server auth against the Statewave API — used for `/v1/episodes`, `/v1/context`, `/v1/llm/complete`, etc. Only required if the upstream sets `STATEWAVE_API_KEY`. |

## Deployment

Auto-deployed to Vercel on push to `main`. SPA routing handled via `vercel.json` rewrites. The `api/*` files are deployed as Vercel Edge Functions.

Custom domain: `statewave.ai` (configure in Vercel dashboard).

## Ecosystem

| Repo | Description |
|------|-------------|
| [statewave](https://github.com/smaramwbc/statewave) | Core server — API, domain model, DB, services |
| [statewave-py](https://github.com/smaramwbc/statewave-py) | Python SDK |
| [statewave-ts](https://github.com/smaramwbc/statewave-ts) | TypeScript SDK |
| [statewave-docs](https://github.com/smaramwbc/statewave-docs) | Architecture, API contracts, ADRs |
| [statewave-examples](https://github.com/smaramwbc/statewave-examples) | Runnable examples |
| [statewave-admin](https://github.com/smaramwbc/statewave-admin) | Operator console (read-only) |

## GitHub repo settings

Recommended:
- **Description:** `Official website for Statewave — trusted context runtime for AI agents`
- **Website:** `https://statewave.ai`
- **Topics:** `statewave`, `ai-agents`, `memory`, `context-runtime`, `marketing-site`, `react`, `vite`

## License

Apache-2.0
