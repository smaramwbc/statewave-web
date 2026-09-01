/* A chain of steps — `source code → application graph → running UI`.
 *
 * The series posts are full of these. Written as a fenced code block with
 * one step per line and an arrow between them, a seven-step chain becomes
 * thirteen lines of near-empty page: the reader scrolls past a column of
 * single words to reach the next sentence.
 *
 * A chain that fits on one line reads best as a row. One that doesn't
 * reads worse as a row than as a column: it breaks at whatever chip
 * happens to hit the edge, and the two ragged lines stop looking like a
 * path at all. So the chain lays itself out: row when it fits, column when
 * it doesn't.
 *
 * Whether it fits is worked out from the text rather than measured in the
 * browser. Measuring would mean rendering a row, discovering it wrapped,
 * and re-rendering as a column — a visible jump on every load, and on the
 * prerendered HTML a layout that changes the moment it hydrates. The steps
 * are monospaced, so their width is a function of their length and this
 * estimate is exact enough to make the same call the browser would.
 *
 * Below `sm` nothing fits, so everything stacks — handled in CSS rather
 * than in the estimate, which only knows about the desktop column.
 */
interface Props {
  steps: readonly string[]
}

/** Monospace advance at the chip's 14px, plus its horizontal padding and
 *  border; and the gap an arrow occupies between two chips. */
const CHAR = 8.4
const CHIP_CHROME = 26
const ARROW = 28
/** The article column, less a little slack so a chain that would only just
 *  fit stacks rather than sitting flush against the measure. */
const COLUMN = 860

function fitsOnOneLine(steps: readonly string[]): boolean {
  const chips = steps.reduce((w, s) => w + s.length * CHAR + CHIP_CHROME, 0)
  return chips + (steps.length - 1) * ARROW <= COLUMN
}

const CHIP =
  'inline-block rounded-lg border border-brand-500/25 bg-brand-500/[0.06] px-3 py-1.5 font-mono text-[13px] leading-tight text-theme-primary sm:text-sm'

export function Flow({ steps }: Props) {
  const row = fitsOnOneLine(steps)

  return (
    <div
      className={
        row
          ? 'my-8 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2'
          : 'my-8 flex flex-col items-start gap-1.5'
      }
    >
      {steps.map((step, i) => (
        <span
          key={step}
          className={
            row
              ? 'flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-x-3'
              : 'flex flex-col items-start gap-1.5'
          }
        >
          {i > 0 && (
            <span aria-hidden className="pl-4 text-brand-500/70 sm:pl-0">
              {row ? (
                <>
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </>
              ) : (
                '↓'
              )}
            </span>
          )}
          <span className={CHIP}>{step}</span>
        </span>
      ))}
    </div>
  )
}
