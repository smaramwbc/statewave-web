/*
 * Typed wrapper around src/lib/changelog.json, the snapshot of the GitHub
 * releases of the server, the two SDKs and the connectors written by
 * `scripts/refresh-changelog.mjs` (npm run refresh:changelog).
 *
 * The JSON is committed so the build is network-independent. Nothing in it is
 * written by hand: versions, dates, titles and notes all come from GitHub.
 *
 * Only /changelog imports this module. Keep it out of anything the main
 * bundle loads (page-faqs.ts, seo-meta.ts), since the snapshot is ~90 KB.
 */

import raw from './changelog.json'

export type ProductId = 'server' | 'python' | 'typescript' | 'connectors'

/** New / Fixed / Breaking / Security are read from the release notes (conventional-commit
 *  prefixes or headings); everything else the notes list is 'other'. */
export type ChangeKind = 'feature' | 'fix' | 'breaking' | 'security' | 'other'

export interface ReleaseChange {
  kind: ChangeKind
  /** Inline markdown: `code`, **bold** and [links](https://…) only. */
  text: string
  /** Conventional-commit scope, e.g. "timeline" in feat(timeline): … */
  scope?: string
  /** The pull request, for entries from GitHub's generated notes. */
  pr?: number
  url?: string
  /** The npm package a hand-written connectors note names, and the version it moved to. */
  package?: string
  version?: string
}

export interface Release {
  product: ProductId
  tag: string
  version: string
  /** The release name minus the tag, when it has one ("first stable public developer release"). */
  title: string | null
  /** GitHub's publish date, ISO 8601. */
  date: string
  /** The release page on GitHub. */
  url: string
  prerelease: boolean
  /** The first paragraph of hand-written notes. Inline markdown. */
  summary: string | null
  /** A quoted callout at the top of the notes, e.g. "Superseded by v0.9.1". Inline markdown. */
  notice: string | null
  changes: ReleaseChange[]
  /** Dependency, CI, docs and other maintenance items the notes list but the page only counts. */
  maintenance: number
  packages: { name: string; version: string }[]
  /** GitHub logins under "New Contributors". */
  newContributors: string[]
}

export const CHANGELOG = raw as { fetched_at: string | null; releases: Release[] }

export interface Product {
  id: ProductId
  name: string
  repo: string
}

/** Filter order on the page; the same ids the refresh script maps each repo to. */
export const PRODUCTS: readonly Product[] = [
  { id: 'server', name: 'Server', repo: 'smaramwbc/statewave' },
  { id: 'python', name: 'Python SDK', repo: 'smaramwbc/statewave-py' },
  { id: 'typescript', name: 'TypeScript SDK', repo: 'smaramwbc/statewave-ts' },
  { id: 'connectors', name: 'Connectors', repo: 'smaramwbc/statewave-connectors' },
]

export const isProductId = (v: unknown): v is ProductId => PRODUCTS.some((p) => p.id === v)
