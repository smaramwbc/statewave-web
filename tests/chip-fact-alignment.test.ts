/**
 * Chip ↔ demo-pack alignment.
 *
 * Every chip in ChatWidget's SUGGESTIONS table promises the agent will
 * "remember" something. This test makes good on that promise: for each
 * chip we assert that every `anchor` token (an ID, date, name, or
 * number from the chip text) appears verbatim in the corresponding
 * demo pack's memories+episodes text.
 *
 * The pack text is read from a snapshot at tests/fixtures/demo-pack-text.json
 * (the live packs live in the sister `statewave` repo, which CI doesn't
 * check out). When the packs move, refresh the snapshot:
 *
 *     node scripts/snapshot-demo-pack-text.mjs
 *
 * If a chip's anchor is missing from the snapshot, this test fails with
 * a "<anchor> not found in <persona>" message — that's the signal to
 * either rewrite the chip to match the new pack, or update the pack to
 * re-introduce the fact the chip references.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SUGGESTIONS } from '../src/components/ChatWidget'

const FIXTURE_PATH = resolve(
  __dirname,
  'fixtures',
  'demo-pack-text.json',
)
const PACK_TEXT = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as Record<
  string,
  string
>

// Lowercase once for case-insensitive substring checks. Anchors are
// short noun phrases; matching case-insensitively keeps tiny
// capitalisation drift (e.g. "northwind" vs "Northwind") from breaking
// the test for no real reason.
const PACK_TEXT_LOWER: Record<string, string> = Object.fromEntries(
  Object.entries(PACK_TEXT).map(([k, v]) => [k, v.toLowerCase()]),
)

describe('chip-fact alignment — every chip anchors on a real pack fact', () => {
  it('snapshot fixture covers every persona that has SUGGESTIONS', () => {
    // Drift catcher #1: the snapshot script and the SUGGESTIONS map
    // must agree on which personas exist. If a new persona is added in
    // one place and not the other, this test trips before the per-chip
    // checks would silently pass with no anchors to verify.
    for (const persona of Object.keys(SUGGESTIONS)) {
      expect(
        PACK_TEXT[persona],
        `missing fixture entry for persona "${persona}" — add it to ` +
          `PERSONA_TO_PACK in scripts/snapshot-demo-pack-text.mjs and ` +
          `re-run the script`,
      ).toBeTypeOf('string')
      expect(
        PACK_TEXT[persona].length,
        `fixture entry for "${persona}" is empty`,
      ).toBeGreaterThan(0)
    }
  })

  for (const [persona, rounds] of Object.entries(SUGGESTIONS)) {
    describe(persona, () => {
      const text = PACK_TEXT_LOWER[persona] ?? ''
      rounds.forEach((round, ri) => {
        round.forEach((chip, ci) => {
          // Every chip carries at least one anchor; an anchor-less chip
          // would silently pass this whole audit, so we forbid it.
          it(`round ${ri + 1} chip ${ci + 1}: "${chip.text}"`, () => {
            expect(
              chip.anchors.length,
              `chip has no anchors — add at least one fact token`,
            ).toBeGreaterThan(0)
            for (const anchor of chip.anchors) {
              expect(
                text.includes(anchor.toLowerCase()),
                `anchor "${anchor}" not found in ${persona} pack — ` +
                  `the chip "${chip.text}" references a fact the agent ` +
                  `cannot recall. Either update the pack or rewrite ` +
                  `the chip.`,
              ).toBe(true)
            }
          })
        })
      })
    })
  }
})
