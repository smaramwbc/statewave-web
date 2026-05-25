/*
 * Typed wrapper around src/lib/credibility-stats.json — the snapshot of
 * GitHub / PyPI / npm / Docker Hub public counts refreshed by
 * `scripts/refresh-credibility-stats.mjs`.
 *
 * Every field is nullable. The refresh script keeps the previous value
 * when an upstream API fails (rate limit, network), so a field reads
 * as null only on the very first run before that source has ever
 * succeeded. Consumers MUST handle null per field — display only what's
 * present rather than gating the whole row on one missing value.
 *
 * The JSON is committed so production builds are network-independent —
 * fetch happens out-of-band when an operator runs the refresh script.
 */

import raw from './credibility-stats.json'

export interface CredibilityStats {
  github_stars: number | null
  github_forks: number | null
  docker_pulls: number | null
  pypi_version: string | null
  pypi_downloads_month: number | null
  npm_version: string | null
  npm_downloads_month: number | null
  fetched_at: string | null
}

export const CREDIBILITY_STATS = raw as CredibilityStats

/** Compact, locale-neutral number formatting: 2744 → "2.7k", 12345 → "12.3k",
 *  1234567 → "1.2M". Keeps the hero credibility row terse on mobile. Returns
 *  null for null input so callers can guard the surrounding markup. */
export function formatCompactCount(n: number | null): string | null {
  if (n === null || n === undefined) return null
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    const k = n / 1000
    return (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'k'
  }
  const m = n / 1_000_000
  return (m >= 100 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')) + 'M'
}
