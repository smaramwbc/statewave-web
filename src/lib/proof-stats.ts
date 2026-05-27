/**
 * Single source of truth for the Statewave credibility figures surfaced
 * across the marketing site. Mirrored on the homepage (hero credibility
 * row, prerendered into dist/index.html, and the below-the-fold
 * ProofSection) and on the /about page. Recompute together when the
 * eval suite or the support workflow benchmark changes — drift between
 * surfaces makes us look sloppy, and the benchmark is 8/8 (not 9/9).
 */
export const PROOF_STATS = [
  { value: '723', label: 'Unit tests' },
  { value: '56', label: 'Eval assertions' },
  { value: '8/8', label: 'Support workflow score' },
  { value: '2/8', label: 'Naive approach score' },
] as const
