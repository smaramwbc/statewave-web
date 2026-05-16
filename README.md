# Statewave Website

[![CI](https://github.com/smaramwbc/statewave-web/workflows/CI/badge.svg)](https://github.com/smaramwbc/statewave-web/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

The official product website for [Statewave](https://statewave.ai), the open-source memory runtime for AI agents.

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

## Required environment variables

Both must be set explicitly. Missing or empty values throw a named
`StatewaveConfigError` on the first request — the website does not silently
default to any project's hosted Statewave instance and does not run un-authenticated.

| Variable | Purpose |
|---|---|
| `STATEWAVE_URL` | Base URL of your Statewave backend (e.g. `http://localhost:8100`) |
| `STATEWAVE_API_KEY` | API key for that backend (`X-API-Key` header) |

Optional, with defaults: `PORT` (8080), `HOST` (0.0.0.0), `WEB_STATIC_DIR` (`./dist`).

## Local development

```bash
npm install
cp .env.local.example .env.local   # then edit with your STATEWAVE_URL + STATEWAVE_API_KEY
npm run dev                        # http://localhost:5173
```

The dev server runs the API handlers in-process via `server/vite-plugin.ts`
(same dispatch as the standalone server — see `server/dispatch.ts`). No
`vercel dev`, no remote proxy.

For a fully local stack, run [`statewave`](https://github.com/smaramwbc/statewave)
via `docker compose up -d` first, then point `.env.local` at it:

```bash
# .env.local
STATEWAVE_URL=http://localhost:8100
STATEWAVE_API_KEY=your-local-api-key
```

## Run locally without Vercel — standalone Node server

The vendor-neutral run path. Builds the SPA + the Node-side server, then
boots a plain `node:http` server that serves both:

```bash
npm install
npm run build
STATEWAVE_URL=http://localhost:8100 STATEWAVE_API_KEY=your-key npm start
# → listening on http://0.0.0.0:8080
```

This is the path Docker uses, and the canonical run path for self-hosting.
No Vercel, no Fly, no platform-specific runtime.

## Run via Docker

```bash
docker build -t statewave-web .
docker run --rm -p 8080:8080 \
  -e STATEWAVE_URL=http://host.docker.internal:8100 \
  -e STATEWAVE_API_KEY=your-key \
  statewave-web
```

## Optional: deploy on Vercel

A single thin adapter file (`api/[[...slug]].ts`) forwards every `/api/*`
request into the same vendor-neutral dispatch the standalone server uses.
No per-route shims. If you're not deploying to Vercel, you can ignore /
delete that file — it has no effect on the standalone or Docker run paths.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (with in-process API dispatch) |
| `npm run build` | Build the SPA (`dist/`) and the Node server (`dist-server/`) |
| `npm run build:client` | SPA build only |
| `npm run build:server` | Node-server TypeScript build only |
| `npm start` | Run the standalone Node server from `dist-server/` |
| `npm run preview` | Preview the SPA build via Vite (no API) |
| `npm run typecheck` | TypeScript check (both client + server configs) |
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
server/
  index.ts              # Standalone Node HTTP server (vendor-neutral run path)
  dispatch.ts           # Route table + Web↔Node bridge — single source of truth for /api/*
  statewave-client.ts   # Shared visitor cookie + Statewave fetch helpers + StatewaveConfigError
  vite-plugin.ts        # Dev-time middleware (in-process API for `npm run dev`)
  handlers/
    demo-state.ts       # GET — issue/restore visitor cookie + return memory pool
    demo-seed.ts        # POST — import a showcase pack into the visitor's persona pool
    demo-reset.ts       # POST — wipe all of a visitor's persona subjects + reissue cookie
    demo-personas.ts    # GET — persona registry
    widget-chat.ts      # POST — stateless / Statewave-mode chat (writes episode + compiles)
    hero-data.ts        # GET — proxy live hero-page data from a Statewave backend
api/
  [[...slug]].ts        # Optional Vercel adapter — forwards every /api/* into dispatch.ts
tests/
  widget.test.tsx, widget-onboarding.test.tsx, demo-persistence.test.ts,
  smoke.test.tsx, theme.test.tsx, routes.test.tsx
```

## Hero visualization

The hero background is a Canvas 2D particle system that fetches **live data** from a Statewave backend (via the proxy at `/api/hero-data`, which routes through the same vendor-neutral dispatch as every other `/api/*` endpoint — no Vercel-specific runtime needed).

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
- **Assistant Markdown rendering:** assistant turns are rendered through [`MarkdownMessage`](src/components/chat/MarkdownMessage.tsx) (react-markdown + remark-gfm). Supported: paragraphs, links, bold/italic/strikethrough, ordered/unordered lists, inline code, fenced code blocks, blockquotes, and GFM tables. Raw HTML and Markdown images are intentionally **not** rendered (no `rehype-raw`, no `dangerouslySetInnerHTML`, and the `img` component is overridden to drop the tag — alt text falls through as plain text — so the model can't trigger outbound image fetches or smuggle a `data:` payload). Anchor `href`s pass through a scheme allowlist (`http`, `https`, `mailto`, `tel`, plus same-site relative paths and `#`/`?` fragments), so a `javascript:` or `data:` URL becomes inert text instead of a clickable target. External http(s) links open in a new tab with `rel="noopener noreferrer"`. **User turns are deliberately left as plain text** — a visitor's typed input is never reinterpreted as Markdown.

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

The site is fully positioned and instrumented for search and AI answer
engines. See [`docs/seo.md`](docs/seo.md) for the full architecture and the
checklist for adding new pages.

- **Type-safe per-page metadata** — [`src/lib/seo-meta.ts`](src/lib/seo-meta.ts)
  declares `PUBLIC_ROUTES` and `PAGE_META`. Pages call `usePageSEO()` from
  [`src/lib/seo.tsx`](src/lib/seo.tsx); the hook updates `<title>`, description,
  canonical, robots, all Open Graph tags, all Twitter Card tags, and locale
  on every route change.
- **Structured data (JSON-LD)** — `Organization`, `WebSite`, and
  `SoftwareApplication` are baked into [`index.html`](index.html) for
  no-JS crawlers. The SPA layers a per-route `BreadcrumbList` and a
  `FAQPage` (on the homepage) on top, marked `data-seo="managed"` so they
  swap cleanly on navigation. Builders live in `seo-meta.ts`.
- **Crawlability** —
  - [`public/robots.txt`](public/robots.txt) — allows the public site,
    disallows `/api/`, declares the sitemap.
  - [`public/sitemap.xml`](public/sitemap.xml) — one URL per public route;
    parity with `PUBLIC_ROUTES` enforced by tests.
  - [`public/llms.txt`](public/llms.txt) — concise, [llms.txt-format](https://llmstxt.org/)
    summary for AI answer engines (ChatGPT, Perplexity, Claude, Google AI
    Overviews). Lists positioning, core concepts, public pages, docs links,
    install commands, integrations, honest scope.
- **FAQ** — homepage FAQ entries live in [`src/lib/faq.ts`](src/lib/faq.ts)
  and are rendered as a real `<details>`/`<summary>` accordion *and*
  emitted as `FAQPage` JSON-LD from the same source — no drift between the
  visible content and the structured data.
- **Social cards** — `/og-image.png` (1200×630, dark gradient, brand copy);
  source SVG at `/og-image.svg` (editable, re-export with
  `magick og-image.svg og-image.png`). All OG/Twitter tags include
  width, height, and alt text.
- **No-index for the 404** — [`pages/NotFoundPage.tsx`](src/pages/NotFoundPage.tsx)
  sets `robots: 'noindex, follow'` so missing routes don't pollute search
  results.
- **Tests** —
  - [`tests/seo.test.tsx`](tests/seo.test.tsx) — every public route renders
    the right title, description, canonical, OG, Twitter; uniqueness +
    length bounds enforced.
  - [`tests/seo-jsonld.test.tsx`](tests/seo-jsonld.test.tsx) — the JSON-LD
    builders return valid schema.org shapes; the homepage emits the right
    set; navigations don't leave stale `[data-seo="managed"]` scripts.
  - [`tests/seo-static.test.ts`](tests/seo-static.test.ts) — `robots.txt`,
    `sitemap.xml`, `llms.txt`, and the `index.html` JSON-LD blocks are
    structurally valid and reference every public route.

### Adding a new public page

`docs/seo.md` walks through it end-to-end. The short version:

1. Add the route to `RouteKey` + `PUBLIC_ROUTES` and a `PAGE_META` entry
   in `seo-meta.ts`.
2. Add a URL block to `public/sitemap.xml`.
3. Add the route to `App.tsx` and call `usePageSEO()` from the new page
   component.
4. Update `public/llms.txt` if the page is meaningful for AI crawlers.
5. `npm run test` — the SEO tests fail loudly if any of the above is
   missing.

## Accessibility

- Skip-to-content link
- Semantic landmarks (`<nav>`, `<main>`, `<footer>`)
- ARIA labels on navigation, theme switcher, mobile toggle
- `prefers-reduced-motion` disables all animations
- Focus-visible ring on keyboard navigation
- Escape closes mobile menu

## Mobile

The site is designed mobile-first and verified at common smartphone widths (320, 360, 375, 390, 414, 430).

**Breakpoints (Tailwind defaults).** `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. All layout decisions are written mobile-first — base styles target the smallest phones and `sm:` / `md:` / `lg:` modifiers progressively layer in extra room.

**Container padding.** Use `px-5 sm:px-6` on every full-width container so 320px devices have the right gutter without crowding desktop layouts. The `Section` primitive already does this.

**Vertical rhythm.** `py-16 sm:py-20 md:py-28 lg:py-32` is the canonical section padding (smaller on mobile, not larger). Use the `Section` primitive instead of hand-rolling.

**Type scale.** Hero headlines use `text-[clamp(2.25rem,8vw,4.5rem)]` so they shrink fluidly between 320px and the desktop maximum. Avoid arbitrary `text-[Xrem]` for body copy — prefer `text-base sm:text-lg` so light/dark and reduced-motion themes inherit correctly.

**Tap targets.** The `Button` primitive enforces a 44×44 floor (`min-h-11` for `md`/`lg`, `min-h-10` for `sm`). The `.tap-target` utility in `src/index.css` is available for ad-hoc surfaces. Mobile nav links sit at `min-h-12`.

**Safe areas.** Notch / home-indicator / Dynamic Island spacing is handled via the `.pt-safe`, `.pb-safe`, `.pl-safe`, `.pr-safe` utilities (declared in `src/index.css`). The fixed Navbar opts into `pt-safe`; the back-to-top button uses `max(env(safe-area-inset-bottom), 1rem)` so it clears the home indicator. Layout uses `min-h-[100dvh]` rather than `min-h-screen` to behave correctly under iOS keyboard / address-bar shifts.

**Mobile drawer.** The Navbar drawer is a real `role="dialog"` with body scroll lock (driven by `[data-scroll-lock="true"]` on `<html>`), focus management (focus moves into the drawer on open, returns to the toggle on close), Escape-to-close, click-outside-to-close, and route-change-to-close. Tested in `tests/mobile-nav.test.tsx`.

**Code blocks & grids.** `<pre>` blocks are wrapped in `min-w-0` parents inside any 2-col grid so they shrink instead of pushing the grid out. Use `min-w-0` on grid children that contain code, tables, or long-token text.

**When adding a new section:**
1. Use `Section` (or replicate its `py-16 sm:py-20 md:py-28 lg:py-32` + `px-5 sm:px-6` + `max-w-7xl`).
2. Default to `grid-cols-1`, then opt into `sm:grid-cols-2` / `md:grid-cols-3` etc. — never start at 3+ columns.
3. Add `min-w-0` to grid children that hold code, tables, or long URLs.
4. Use `Button` with `size="md"` for primary CTAs (44px enforced).
5. For images/screenshots: set explicit `width` / `height` and use `loading="lazy"` for anything below the fold.

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

| Project | Description |
|---|---|
| [Server](https://github.com/smaramwbc/statewave) | Core server — API, domain model, DB, services |
| [Python SDK](https://github.com/smaramwbc/statewave-py) | `pip install statewave` |
| [TypeScript SDK](https://github.com/smaramwbc/statewave-ts) | `npm install @statewavedev/sdk` |
| [Connectors](https://github.com/smaramwbc/statewave-connectors) | `@statewavedev/connectors-*` |
| [Docs](https://github.com/smaramwbc/statewave-docs) | Architecture, API contracts, ADRs |
| [Examples](https://github.com/smaramwbc/statewave-examples) | Runnable examples |
| [Admin](https://github.com/smaramwbc/statewave-admin) | Operator console (read-only) |

## License

Apache-2.0
