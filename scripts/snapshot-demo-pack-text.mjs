#!/usr/bin/env node
/**
 * Snapshot demo-pack memories+episodes text into a fixture file.
 *
 * The chip-fact-alignment test (tests/chip-fact-alignment.test.ts) needs
 * to know which fact tokens are present in each demo pack so it can
 * verify that every chip in ChatWidget's SUGGESTIONS table anchors on a
 * real recallable fact. Doing that lookup against the live `statewave`
 * sister checkout would make CI brittle — only this repo is checked out
 * in GitHub Actions. Instead we keep a committed snapshot of the pack
 * text under tests/fixtures/demo-pack-text.json and refresh it by hand
 * (and on PRs that move the demo packs) by running this script:
 *
 *     node scripts/snapshot-demo-pack-text.mjs
 *
 * The script reads memories.jsonl + episodes.jsonl from each demo pack
 * in ../statewave/server/starter_packs/, extracts every textual field
 * (memory `summary`/`content`, episode `payload.content`/`payload.text`),
 * and writes a flat `{ persona-id: "concatenated text" }` map. The test
 * then asserts that every chip's anchors are substrings of the persona's
 * concatenated text.
 *
 * If the script can't find the sister checkout, it exits non-zero with
 * a clear message rather than silently writing an empty fixture.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Repo layout: statewave-web/, statewave/ as siblings under Statewave/.
const STATEWAVE_REPO = resolve(__dirname, '..', '..', 'statewave')
const PACKS_DIR = join(STATEWAVE_REPO, 'server', 'starter_packs')
const FIXTURE_PATH = resolve(__dirname, '..', 'tests', 'fixtures', 'demo-pack-text.json')

// Persona id (as used in ChatWidget SUGGESTIONS) → starter-pack directory name.
const PERSONA_TO_PACK = {
  'support-agent': 'demo-support-agent',
  'coding-assistant': 'demo-coding-assistant',
  'sales-copilot': 'demo-sales-copilot',
  'devops-agent': 'demo-devops-agent',
  'research-assistant': 'demo-research-assistant',
  'statewave-support': 'statewave-support-agent',
}

if (!existsSync(PACKS_DIR)) {
  console.error(
    `Could not find starter packs at ${PACKS_DIR}. ` +
      `This script expects the statewave repo to be checked out as a ` +
      `sibling of statewave-web (i.e. ../statewave).`,
  )
  process.exit(1)
}

function extractText(line) {
  // memories.jsonl rows carry { summary, content, kind, ... }; episodes.jsonl
  // rows carry { payload: { content | text | ... }, type, source, ... }.
  // We pull every plausible textual field — the test only checks for
  // substring presence, so over-extracting is harmless and under-extracting
  // would make the test give a false negative.
  let row
  try {
    row = JSON.parse(line)
  } catch {
    return ''
  }
  const parts = []
  if (typeof row.summary === 'string') parts.push(row.summary)
  if (typeof row.content === 'string') parts.push(row.content)
  if (row.payload && typeof row.payload === 'object') {
    for (const v of Object.values(row.payload)) {
      if (typeof v === 'string') parts.push(v)
    }
  }
  return parts.join('\n')
}

function readPackText(packDir) {
  const out = []
  for (const file of ['memories.jsonl', 'episodes.jsonl']) {
    const path = join(packDir, file)
    if (!existsSync(path)) continue
    const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean)
    for (const line of lines) {
      const t = extractText(line)
      if (t) out.push(t)
    }
  }
  return out.join('\n')
}

const fixture = {}
for (const [persona, dir] of Object.entries(PERSONA_TO_PACK)) {
  const packDir = join(PACKS_DIR, dir)
  if (!existsSync(packDir)) {
    console.error(`Missing pack directory for ${persona}: ${packDir}`)
    process.exit(1)
  }
  fixture[persona] = readPackText(packDir)
}

writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 0) + '\n', 'utf8')
const sizes = Object.entries(fixture).map(
  ([k, v]) => `  ${k}: ${v.length} chars`,
)
console.log(`Wrote ${FIXTURE_PATH}`)
console.log(sizes.join('\n'))
