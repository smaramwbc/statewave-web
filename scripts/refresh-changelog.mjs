/*
 * Refresh src/lib/changelog.json from the GitHub releases of the server, the
 * two SDKs and the connectors. Same pattern as refresh-credibility-stats.mjs:
 * the JSON is committed so the build stays deterministic and network-free,
 * and this script keeps it current.
 *
 *   npm run refresh:changelog
 *
 * GITHUB_TOKEN is optional. Without it the unauthenticated API allows 60
 * requests an hour, and a run makes one request per repo per 100 releases.
 *
 * Each repo is best-effort: if one fails (rate limit, network), its previous
 * entries are kept rather than dropped. The file is only rewritten when the
 * releases actually changed, so a scheduled run produces no diff (and no
 * commit) until something ships.
 *
 * Nothing here is written by hand. Every field comes from a release: the tag,
 * the name, the publish date, the URL, and what parseBody() pulls out of the
 * release notes (a lead paragraph, the notable changes, package bumps and a
 * count of the maintenance items it leaves out). The page links every entry
 * to its release for the full notes.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_PATH = path.resolve('src/lib/changelog.json')

/** Order is the page's filter order. Ids are what src/lib/changelog.ts types. */
const PRODUCTS = [
  { id: 'server', repo: 'smaramwbc/statewave' },
  { id: 'python', repo: 'smaramwbc/statewave-py' },
  { id: 'typescript', repo: 'smaramwbc/statewave-ts' },
  { id: 'connectors', repo: 'smaramwbc/statewave-connectors' },
]

/* ── fetching ───────────────────────────────────────────────────────────── */

async function fetchReleases(repo) {
  const headers = {
    'user-agent': 'statewave-changelog-fetch (https://github.com/smaramwbc/statewave-web)',
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const out = []
  let url = `https://api.github.com/repos/${repo}/releases?per_page=100`
  while (url) {
    const r = await fetch(url, { headers })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    out.push(...(await r.json()))
    url = r.headers.get('link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null
  }
  return out
}

/* ── parsing the release notes ──────────────────────────────────────────── */

// Bullets under these headings are the notable changes. GitHub's generated notes
// put everything under "What's Changed"; hand-written notes use the others.
const KEEP_HEADING = /what'?s changed|what'?s new|^changes$|features?|fix(es)?|added|improvements?|highlights|breaking|delivers|what landed|what changes/i
const KIND_BY_HEADING = [
  [/breaking/i, 'breaking'],
  [/fix/i, 'fix'],
  [/feature|added|what'?s new|improvement/i, 'feature'],
]
// Hand-written notes also list what did NOT ship ("Out of scope for v0.4 (queued for
// follow-ups):"), tests and limitations. A heading or lead-in line like these rules a list out.
const NOT_SHIPPED = /\bnot\b|n't|out of scope|deferred|queued|\bnext\b|\blater\b|follow-?ups?|\btests?\b|known|limitation|todo|roadmap|upgrade|install|requirement|migration|backward|^why\b/i
// Outside those headings, a bullet list counts only when the line leading into it says it shipped.
const SHIPPED_INTRO = /bundled|\bships?\b|\badds?\b|added|\bnew\b|includes?|highlights|what'?s in|changes|changed|updates?|published|features?|fixe[sd]/i
// Conventional-commit types that count as maintenance: left out of the list,
// only counted.
const MAINTENANCE_TYPES = new Set(['chore', 'ci', 'build', 'test', 'tests', 'refactor', 'style', 'deps', 'docs', 'doc', 'revert', 'release'])
const KIND_BY_TYPE = { feat: 'feature', feature: 'feature', perf: 'feature', fix: 'fix', security: 'security' }
const PKG = '@statewavedev\\/[\\w.-]+'
const VER = '\\d+\\.\\d+\\.\\d+[\\w.-]*'

/** Markdown links that point inside the repo become links to the file at the release tag;
 *  in-page anchors lose the link and keep the text. */
function absolutizeLinks(md, repo, tag) {
  return md.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, text, href) => {
    if (/^https?:\/\//.test(href)) return all
    if (href.startsWith('#')) return text
    return `[${text}](https://github.com/${repo}/blob/${tag}/${href.replace(/^\.?\//, '')})`
  })
}

const capitalize = (s) => (/^[a-z]/.test(s) ? s[0].toUpperCase() + s.slice(1) : s)

/** One bullet from GitHub's generated notes: "<PR title> by @user in <PR url>". */
function parseGenerated(line) {
  const m = line.match(/^(.*) by @([\w-]+(?:\[bot\])?) in (https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/(\d+))\s*$/)
  if (!m) return null
  const [, title, author, url, num] = m
  const pr = { pr: Number(num), url }
  const cc = title.match(/^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/)
  if (cc) {
    const [, rawType, scope, bang, subject] = cc
    const type = rawType.toLowerCase()
    if (bang) return { kind: 'breaking', text: capitalize(subject), ...(scope ? { scope } : {}), ...pr }
    if (MAINTENANCE_TYPES.has(type)) return { kind: 'maintenance' }
    return { kind: KIND_BY_TYPE[type] ?? 'other', text: capitalize(subject), ...(scope ? { scope } : {}), ...pr }
  }
  if (/\[bot\]$/.test(author) || /^(bump|update) .*(requirement|from .* to )/i.test(title) || /^update readme/i.test(title)) {
    return { kind: 'maintenance' }
  }
  return { kind: /^fix\b/i.test(title) ? 'fix' : 'other', text: title, ...pr }
}

/** One hand-written bullet. "**`@statewavedev/x`** → `1.2.3` — text" names a package bump;
 *  "**deps** — …" and the like are maintenance. */
function parseHandWritten(line, headingKind, listed) {
  const pkg = line.match(new RegExp(`^(?:\\*\\*)?\`?(${PKG})\`?(?:\\*\\*)?\\s*(?:→\\s*)?\\(?\`(${VER})\`\\)?\\s*(?:_\\([^)]*\\)_\\s*)?[—–-]\\s*(.+)$`))
  if (pkg) return { kind: headingKind ?? 'other', text: pkg[3], package: pkg[1], version: pkg[2] }
  const label = line.match(/^\*\*([\w -]+)\*\*\s*[—–:-]\s*(.+)$/)
  if (label) {
    const l = label[1].trim().toLowerCase()
    if (/^(deps|dependencies|chore|ci|build|tests?|docs)$/.test(l)) return { kind: 'maintenance' }
    if (l === 'security') return { kind: 'security', text: label[2] }
  }
  // A bare package line ("`@statewavedev/x@1.2.3`") only names a bump; packagesIn() records it.
  if (new RegExp(`^\`?${PKG}@${VER}\`?$`).test(line.trim())) return null
  return listed ? { kind: headingKind ?? 'other', text: line } : null
}

/** Every "@statewavedev/name" + version pair the notes mention, in order of first mention. */
function packagesIn(md) {
  const found = new Map()
  const patterns = [
    new RegExp(`\`(${PKG})@(${VER})\``, 'g'),
    new RegExp(`\`(${PKG})\`\\*{0,2}\\s*(?:→|\\()\\s*\`(${VER})\``, 'g'),
  ]
  const hits = []
  for (const re of patterns) for (const m of md.matchAll(re)) hits.push([m.index, m[1], m[2]])
  hits.sort((a, b) => a[0] - b[0])
  for (const [, name, version] of hits) if (!found.has(name)) found.set(name, version)
  return [...found].map(([name, version]) => ({ name, version }))
}

function parseBody(raw, repo, tag) {
  const body = absolutizeLinks((raw ?? '').replace(/\r\n?/g, '\n'), repo, tag)
  const lines = body.split('\n')
  const changes = []
  const newContributors = []
  let maintenance = 0
  let summary = null
  let notice = null
  let heading = null // null = the lead, before any heading; '' = after a rule in the lead
  let intro = null // the last line of text before the current bullet list
  let inFence = false
  let para = []

  const endPara = () => {
    // A lead paragraph that ends in a colon introduces a list; as a summary it reads as a sentence.
    if (para.length && !summary && heading === null) summary = para.join(' ').replace(/:$/, '.')
    para = []
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; endPara(); continue }
    if (inFence) continue
    const h = line.match(/^#{1,6}\s+(.*)$/)
    if (h) { endPara(); heading = h[1].trim(); intro = null; continue }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { endPara(); if (heading === null) heading = ''; intro = null; continue }
    if (!line.trim()) { endPara(); continue }

    const quote = line.match(/^>\s?(.*)$/)
    if (quote) {
      endPara()
      intro = quote[1].trim()
      if (heading === null && intro) notice = notice ? `${notice} ${intro}` : intro
      continue
    }

    const bullet = line.match(/^( {0,1})[*-]\s+(.*)$/)
    if (bullet) {
      endPara()
      const text = bullet[2].trim()
      if (heading && /new contributors/i.test(heading)) {
        const who = text.match(/^@([\w-]+) made their first contribution/)
        if (who) newContributors.push(who[1])
        continue
      }
      if (NOT_SHIPPED.test(heading ?? '') || NOT_SHIPPED.test(intro ?? '')) continue
      const keep = Boolean(heading) && KEEP_HEADING.test(heading)
      const listed = keep || (!heading && intro !== null && SHIPPED_INTRO.test(intro))
      const headingKind = keep ? (KIND_BY_HEADING.find(([re]) => re.test(heading))?.[1] ?? null) : null
      const item = (keep ? parseGenerated(text) : null) ?? parseHandWritten(text, headingKind, listed)
      if (!item) continue
      if (item.kind === 'maintenance') maintenance += 1
      else changes.push(item)
      continue
    }

    if (/^\s*\|/.test(line) || /^\s{2,}[*-]\s/.test(line)) { endPara(); continue } // tables, nested bullets
    intro = line.trim()
    if (/^\*\*Full Changelog\*\*/.test(line)) { endPara(); continue }
    // A bold line ending in a colon introduces a list ("**Published to npm:**"), it isn't prose.
    if (/^\*\*[^*]+:\*\*\s*$/.test(intro)) { endPara(); continue }
    para.push(intro)
  }
  endPara()

  return { summary, notice, changes, maintenance, packages: packagesIn(body), newContributors }
}

function toEntry(product, repo, r) {
  const tag = r.tag_name
  const name = (r.name ?? '').trim()
  // "v0.7.0: Admin Dashboard API", "Statewave v0.9.2 — …", "v1.0.0 — …" → just the words after the tag.
  const title = name && name !== tag
    ? name.replace(new RegExp(`^(statewave(-py|-ts)?\\s+)?${tag.replace(/\./g, '\\.')}\\s*[—–:-]?\\s*`, 'i'), '').trim() || null
    : null
  return {
    product,
    tag,
    version: tag.replace(/^v/, ''),
    title,
    date: r.published_at ?? r.created_at,
    url: r.html_url,
    prerelease: Boolean(r.prerelease),
    ...parseBody(r.body, repo, tag),
  }
}

/* ── main ───────────────────────────────────────────────────────────────── */

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUT_PATH, 'utf-8'))
  } catch {
    return { fetched_at: null, releases: [] }
  }
}

async function main() {
  const previous = await loadExisting()
  const results = await Promise.all(
    PRODUCTS.map(async ({ id, repo }) => {
      try {
        const releases = (await fetchReleases(repo)).filter((r) => !r.draft)
        console.log(`[${id}] ${repo}: ${releases.length} releases`)
        return releases.map((r) => toEntry(id, repo, r))
      } catch (err) {
        const kept = previous.releases.filter((e) => e.product === id)
        console.warn(`[${id}] ${repo}: fetch failed (${err.message}), keeping ${kept.length} previous entries`)
        return kept
      }
    }),
  )

  // Newest day first. Within a day, product order, then the higher version first: some
  // releases were published on one day for older tags, out of version order.
  const order = PRODUCTS.map((p) => p.id)
  const semver = (v) => v.split(/[.-]/).slice(0, 3).map((n) => Number.parseInt(n, 10) || 0)
  const byVersion = (a, b) => {
    const [x, y] = [semver(a.version), semver(b.version)]
    return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]
  }
  const releases = results.flat().sort((a, b) =>
    b.date.slice(0, 10).localeCompare(a.date.slice(0, 10))
    || order.indexOf(a.product) - order.indexOf(b.product)
    || byVersion(a, b))
  if (JSON.stringify(releases) === JSON.stringify(previous.releases)) {
    console.log('No release changes, left', OUT_PATH, 'as is')
    return
  }
  const next = { fetched_at: new Date().toISOString(), releases }
  await writeFile(OUT_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log('Wrote', OUT_PATH, `(${releases.length} releases)`)
}

main().catch((err) => {
  console.error('refresh-changelog failed:', err)
  process.exit(1)
})
