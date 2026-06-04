/* SEO constants, route metadata, and JSON-LD builders.
 *
 * Pure data + functions — no React. The corresponding hook lives in
 * ./seo.tsx and consumes everything here.
 *
 * The route table (PAGE_META + PUBLIC_ROUTES) is the single source of truth
 * used by the SPA, the sitemap-parity test, the llms.txt content audit, and
 * any future page-generator that needs to know what's public.
 */

export const SITE_NAME = 'Statewave'
export const BASE_URL = 'https://www.statewave.ai'
export const DEFAULT_LOCALE = 'en_US'
export const DEFAULT_LANG = 'en'
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`
export const DEFAULT_OG_IMAGE_ALT =
  'Statewave — open-source memory runtime for AI agents'
export const DEFAULT_DESCRIPTION =
  'Open-source memory runtime for AI agents. Durable, structured context with provenance — so your AI stops forgetting across sessions. Self-hosted on Postgres.'
export const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export function titleTemplate(page: string): string {
  return page === SITE_NAME ? page : `${page} — ${SITE_NAME}`
}

/** GitHub repos referenced from JSON-LD and llms.txt. */
export const REPOS = {
  core: 'https://github.com/smaramwbc/statewave',
  py: 'https://github.com/smaramwbc/statewave-py',
  ts: 'https://github.com/smaramwbc/statewave-ts',
  docs: 'https://github.com/smaramwbc/statewave-docs',
  examples: 'https://github.com/smaramwbc/statewave-examples',
  admin: 'https://github.com/smaramwbc/statewave-admin',
  web: 'https://github.com/smaramwbc/statewave-web',
} as const

/* ─── Route table ────────────────────────────────────────────────────────── */

export type RouteKey =
  | '/'
  | '/product'
  | '/why'
  | '/use-cases'
  | '/connectors'
  | '/developers'
  | '/about'
  | '/blog'

/** Canonical, indexable public routes. Order matters — used to render the
 *  sitemap and the llms.txt index. /blog/<slug> entries are appended to
 *  the sitemap dynamically at build time (see scripts/generate-sitemap.mjs);
 *  the index page itself is enumerated here. */
export const PUBLIC_ROUTES: readonly RouteKey[] = [
  '/',
  '/product',
  '/why',
  '/use-cases',
  '/connectors',
  '/developers',
  '/about',
  '/blog',
] as const

export interface PageMeta {
  title: string
  description: string
  /** Short, user-facing breadcrumb label for non-home routes. */
  breadcrumbLabel: string
  /** Open Graph type. Defaults to 'website'. */
  ogType?: 'website' | 'article'
  /** Robots directive override. Defaults to DEFAULT_ROBOTS. */
  robots?: string
  /** Sitemap priority (0.0–1.0). */
  priority: number
  /** Sitemap changefreq. */
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
}

export const PAGE_META: Record<RouteKey, PageMeta> = {
  '/': {
    title: 'Statewave — Open-source memory runtime for AI agents',
    description: DEFAULT_DESCRIPTION,
    breadcrumbLabel: 'Home',
    ogType: 'website',
    priority: 1.0,
    changefreq: 'weekly',
  },
  '/product': {
    title: 'How It Works — Memory Runtime for LLM Apps',
    description:
      'How Statewave turns raw events into ranked, token-bounded context for AI agents — episodes, compiled semantic and episodic memories, deterministic retrieval, and provenance.',
    breadcrumbLabel: 'How It Works',
    ogType: 'article',
    priority: 0.9,
    changefreq: 'monthly',
  },
  '/why': {
    title: 'Why Statewave — Persistent LLM Memory vs. RAG and Prompt Stuffing',
    description:
      'Why prompt stuffing, naive RAG, and history replay fail for AI agents — and how an open, self-hostable memory layer with episodic and semantic memory solves persistent LLM context.',
    breadcrumbLabel: 'Why Statewave',
    ogType: 'article',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/use-cases': {
    title: 'Use Cases — Memory for Support Agents, Copilots, and AI Apps',
    description:
      'What you can build with Statewave: support agents with durable customer memory, coding copilots with repo memory, account intelligence, voice continuity, multi-agent infrastructure, and connector patterns.',
    breadcrumbLabel: 'Use Cases',
    ogType: 'article',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/connectors': {
    title: 'Connectors — Feed GitHub, Docs, Slack, and More into Statewave Memory',
    description:
      'Statewave Connectors turn GitHub issues and PRs, Slack channels and threads, n8n workflow runs, Zapier zap webhooks, Markdown/ADRs, and more into normalized episodes — modular packages so you install only the connectors you need.',
    breadcrumbLabel: 'Connectors',
    ogType: 'article',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/developers': {
    title: 'Developers — SDKs, API, and Self-Hosted Deployment',
    description:
      'Get started with Statewave in about 5 minutes. Python and TypeScript SDKs, REST API, Docker Compose deployment, OpenTelemetry, LiteLLM-backed compilers, and 100+ LLM providers.',
    breadcrumbLabel: 'Developers',
    ogType: 'article',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/about': {
    title: 'About Statewave — Open-Source Memory Runtime for AI Agents',
    description:
      'Statewave is an open-source, self-hosted memory runtime for AI agents — durable episodic and semantic memory with provenance, deterministic ranking, and token-bounded context bundles. Apache-2.0, framework-neutral, no managed cloud.',
    breadcrumbLabel: 'About',
    ogType: 'website',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/blog': {
    title: 'Blog — Notes from the Statewave project',
    description:
      'How agent memory works under the hood, deployment patterns, and the design choices behind a Postgres-only self-hosted memory runtime for AI agents.',
    breadcrumbLabel: 'Blog',
    ogType: 'website',
    priority: 0.7,
    changefreq: 'weekly',
  },
}

/** Look up metadata for an arbitrary path. Falls back to home metadata if the
 *  path isn't in the public route table (e.g. a 404 — the caller can override
 *  title/robots in that case). */
export function routeMeta(pathname: string): PageMeta {
  return PAGE_META[pathname as RouteKey] ?? PAGE_META['/']
}

export function canonicalUrl(pathname: string): string {
  return `${BASE_URL}${pathname === '/' ? '' : pathname}`
}

/* ─── JSON-LD builders ───────────────────────────────────────────────────── */

export type JsonLd = Record<string, unknown>

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/statewave_icon_dark.png`,
    sameAs: [REPOS.core, REPOS.docs],
    description: DEFAULT_DESCRIPTION,
  }
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: DEFAULT_LANG,
    description: DEFAULT_DESCRIPTION,
  }
}

export function softwareApplicationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows (via Docker)',
    description:
      'Open-source memory runtime for AI agents — durable episodic and semantic memory, ranked retrieval, and token-bounded context bundles for LLM applications.',
    url: BASE_URL,
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    codeRepository: REPOS.core,
    softwareHelp: REPOS.docs,
    featureList: [
      'Episodic and semantic memory',
      'Ranked, deterministic retrieval',
      'Token-bounded context bundles',
      'Full provenance tracking',
      'Self-hosted on Postgres + pgvector',
    ],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  }
}

export interface FaqEntry {
  question: string
  answer: string
  /** Optional follow-up links rendered under the visible answer. The
   *  FAQPage JSON-LD only emits `question` and `answer`, so these are
   *  presentation-only — they don't change the structured data. */
  links?: ReadonlyArray<{ label: string; href: string }>
}

export function faqPageJsonLd(entries: readonly FaqEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.answer,
      },
    })),
  }
}

/** Default per-route breadcrumb (Home → Page). Returns null for the home page
 *  (which doesn't need one) or any path outside the public route table. */
export function defaultBreadcrumb(pathname: string): JsonLd | null {
  if (pathname === '/' || !PAGE_META[pathname as RouteKey]) return null
  const meta = PAGE_META[pathname as RouteKey]
  return breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: meta.breadcrumbLabel, path: pathname },
  ])
}
