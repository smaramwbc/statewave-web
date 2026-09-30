/**
 * Single source of truth for the Statewave credibility figures surfaced
 * across the marketing site. Mirrored on the homepage (hero credibility
 * row, prerendered into dist/index.html, and the below-the-fold
 * ProofSection) and on the /about page. Recompute together when the
 * eval suite changes — drift between surfaces makes us look sloppy.
 *
 * Deliberately carries no benchmark scores. The self-scored support
 * workflow figure is a strawman against a naive baseline, and the
 * head-to-head retrieval scores are only publishable with the harness,
 * the opponent, and the per-system retrieval-budget asymmetry disclosed
 * alongside them — which these tiles have no room for. /benchmarks
 * carries all three, so the numbers live there and nowhere else.
 */
/** The individual figures, named — the homepage answer paragraphs quote
 *  them in prose, so they read from here rather than repeating literals
 *  that would drift the next time a run changes. */
export const PROOF_FIGURES = {
  unitTests: '708',
  evalAssertions: '55',
  supportCriteria: '8',
  tokenReduction: '73%',
} as const

export const PROOF_STATS = [
  { value: PROOF_FIGURES.unitTests, label: 'Unit tests' },
  { value: PROOF_FIGURES.evalAssertions, label: 'Eval assertions' },
  { value: PROOF_FIGURES.supportCriteria, label: 'Support eval criteria' },
  { value: PROOF_FIGURES.tokenReduction, label: 'Fewer tokens vs raw history (reference demo)' },
] as const
