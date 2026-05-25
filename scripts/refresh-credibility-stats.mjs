/*
 * Refresh src/lib/credibility-stats.json from GitHub / PyPI / npm / Docker
 * Hub public APIs. Committed values let the build stay deterministic and
 * network-independent; this script just keeps them current.
 *
 * Run manually after a release or once a week:
 *
 *   npm run refresh:credibility
 *
 * Each API is best-effort — if one fails (rate limit, network, schema
 * change), we keep the previous value rather than blanking it. So a
 * stale field reads as "previously known good" instead of "missing".
 *
 * Surfaces that read this file (HomePage hero, About page) must handle
 * any field being null — the UI displays only what's present.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_PATH = path.resolve('src/lib/credibility-stats.json')

const REPO = 'smaramwbc/statewave'
const PYPI_PACKAGE = 'statewave'
const NPM_PACKAGE = '@statewavedev/sdk'
const DOCKER_NAMESPACE = 'statewavedev'
const DOCKER_IMAGE = 'statewave'

async function tryFetch(label, url, transform) {
  try {
    const r = await fetch(url, {
      headers: {
        // pypistats specifically asks for a descriptive UA in their etiquette docs.
        // GitHub & Docker Hub don't require one but it doesn't hurt.
        'user-agent': 'statewave-credibility-fetch (https://github.com/smaramwbc/statewave-web)',
        accept: 'application/json',
      },
    })
    if (!r.ok) {
      console.warn(`[${label}] HTTP ${r.status} — keeping previous value`)
      return null
    }
    const body = await r.json()
    return transform(body)
  } catch (err) {
    console.warn(`[${label}] fetch failed: ${err.message} — keeping previous value`)
    return null
  }
}

async function loadExisting() {
  try {
    const raw = await readFile(OUT_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    // First run — no previous file. Seed with explicit nulls so the UI
    // can still render (it gates on each field separately).
    return {
      github_stars: null,
      github_forks: null,
      docker_pulls: null,
      pypi_version: null,
      pypi_downloads_month: null,
      npm_version: null,
      npm_downloads_month: null,
      fetched_at: null,
    }
  }
}

async function main() {
  const previous = await loadExisting()

  const [github, docker, pypi, pypiDownloads, npm, npmDownloads] = await Promise.all([
    tryFetch('github', `https://api.github.com/repos/${REPO}`, (b) => ({
      stars: b.stargazers_count,
      forks: b.forks_count,
    })),
    tryFetch(
      'docker',
      `https://hub.docker.com/v2/repositories/${DOCKER_NAMESPACE}/${DOCKER_IMAGE}/`,
      (b) => ({ pulls: b.pull_count }),
    ),
    tryFetch('pypi', `https://pypi.org/pypi/${PYPI_PACKAGE}/json`, (b) => ({
      version: b.info?.version,
    })),
    tryFetch(
      'pypi-downloads',
      `https://pypistats.org/api/packages/${PYPI_PACKAGE}/recent`,
      (b) => ({ last_month: b.data?.last_month }),
    ),
    tryFetch(
      'npm',
      `https://registry.npmjs.org/${encodeURIComponent(NPM_PACKAGE)}`,
      (b) => ({ version: b['dist-tags']?.latest }),
    ),
    tryFetch(
      'npm-downloads',
      `https://api.npmjs.org/downloads/point/last-month/${NPM_PACKAGE}`,
      (b) => ({ last_month: b.downloads }),
    ),
  ])

  const next = {
    github_stars: github?.stars ?? previous.github_stars,
    github_forks: github?.forks ?? previous.github_forks,
    docker_pulls: docker?.pulls ?? previous.docker_pulls,
    pypi_version: pypi?.version ?? previous.pypi_version,
    pypi_downloads_month:
      pypiDownloads?.last_month ?? previous.pypi_downloads_month,
    npm_version: npm?.version ?? previous.npm_version,
    npm_downloads_month: npmDownloads?.last_month ?? previous.npm_downloads_month,
    fetched_at: new Date().toISOString(),
  }

  await writeFile(OUT_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')

  console.log('Wrote', OUT_PATH)
  for (const [k, v] of Object.entries(next)) {
    const changed = previous[k] !== v && k !== 'fetched_at' ? ' (changed)' : ''
    console.log(`  ${k}: ${v ?? '<null>'}${changed}`)
  }
}

main().catch((err) => {
  console.error('refresh-credibility-stats failed:', err)
  process.exit(1)
})
