/* A chain of steps — `source code → application graph → running UI`.
 *
 * The series posts are full of these. Written as a fenced code block with
 * one step per line and an arrow between them, a seven-step chain becomes
 * thirteen lines of near-empty page: the reader scrolls past a column of
 * single words to reach the next sentence.
 *
 * No container around the chips. The chips already read as a group, and a
 * second border around them turns a chain into a panel — heavier than the
 * thing it holds, and competing with the real callout cards nearby.
 *
 * Steps stay monospaced because they are identifiers, and the arrows are
 * aria-hidden so a screen reader hears the steps in order without an
 * "arrow" between each pair.
 */
interface Props {
  steps: readonly string[]
  /** Stack the chain vertically instead of flowing it across the line.
   *  For short chains whose steps are phrases rather than identifiers: a
   *  row of those wraps mid-chain and reads as two broken lines, where a
   *  stack of three or four reads cleanly as a path. */
  stacked?: boolean
}

const CHIP =
  'inline-block rounded-lg border border-brand-500/25 bg-brand-500/[0.06] px-3 py-1.5 font-mono text-[13px] leading-tight text-theme-primary sm:text-sm'

export function Flow({ steps, stacked = false }: Props) {
  if (stacked) {
    return (
      <div className="my-8 flex flex-col items-start gap-y-1.5">
        {steps.map((step, i) => (
          <span key={step} className="flex flex-col items-start gap-y-1.5">
            {i > 0 && (
              <span aria-hidden className="pl-4 text-brand-500/70">
                ↓
              </span>
            )}
            <span className={CHIP}>{step}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="my-8 flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
      {steps.map((step, i) => (
        <span key={step} className="flex items-center gap-x-2 sm:gap-x-3">
          {i > 0 && (
            <span aria-hidden className="text-brand-500/70">
              →
            </span>
          )}
          <span className={CHIP}>{step}</span>
        </span>
      ))}
    </div>
  )
}
