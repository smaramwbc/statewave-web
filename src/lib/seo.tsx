import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  path?: string
}

const SITE_NAME = 'Statewave'
const BASE_URL = 'https://statewave.ai'
const DEFAULT_DESCRIPTION =
  'Trusted context runtime for AI agents — durable memory infrastructure with structured episodes, compiled knowledge, ranked retrieval, and token-efficient context assembly.'
const OG_IMAGE = `${BASE_URL}/og-image.png`

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Statewave — Memory Infrastructure for AI Agents',
    description: DEFAULT_DESCRIPTION,
  },
  '/product': {
    title: 'How It Works — Statewave',
    description:
      'Record raw events, compile durable memories, retrieve ranked context, govern with provenance. The core data lifecycle of Statewave.',
  },
  '/why': {
    title: 'Why Statewave — Technical Comparison',
    description:
      'Why prompt stuffing, naive RAG, and history replay fail — and how structured memory infrastructure solves AI context at scale.',
  },
  '/developers': {
    title: 'Developers — Statewave',
    description:
      'Get started with Statewave in under 10 minutes. Python and TypeScript SDKs, REST API, Docker Compose deployment, open source.',
  },
}

export function usePageSEO({ title, description, path }: SEOProps = {}) {
  const location = useLocation()
  const currentPath = path ?? location.pathname

  useEffect(() => {
    const meta = PAGE_META[currentPath] ?? PAGE_META['/']!
    const pageTitle = title ?? meta.title
    const pageDescription = description ?? meta.description
    const canonicalUrl = `${BASE_URL}${currentPath === '/' ? '' : currentPath}`

    // Title
    document.title = pageTitle

    // Meta description
    setMeta('description', pageDescription)

    // Canonical
    setLink('canonical', canonicalUrl)

    // Open Graph
    setMeta('og:title', pageTitle, 'property')
    setMeta('og:description', pageDescription, 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('og:image', OG_IMAGE, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:site_name', SITE_NAME, 'property')

    // Twitter/X Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', pageTitle)
    setMeta('twitter:description', pageDescription)
    setMeta('twitter:image', OG_IMAGE)
  }, [currentPath, title, description])
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}
