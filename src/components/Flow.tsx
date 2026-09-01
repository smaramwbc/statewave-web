/* A chain of steps — `source code → application graph → running UI`.
 *
 * The series posts are full of these. Written as a fenced code block with
 * one step per line and an arrow between them, a seven-step chain becomes
 * thirteen lines of near-empty page: the reader scrolls past a column of
 * single words to reach the next sentence.
 *
 * Laid out horizontally the same chain is one line on a desktop and two or
 * three on a phone, and it reads as what it is — a path, not a list. The
 * steps stay monospaced because they are identifiers, and the arrows are
 * aria-hidden so a screen reader hears the steps in order without an
 * "arrow" between each pair.
 */
interface Props {
  steps: readonly string[]
  /** Renders as a vertical stack instead — for chains whose steps are
   *  phrases rather than identifiers, where a horizontal row would wrap
   *  mid-phrase and stop reading as a path. */
  stacked?: boolean
}

export function Flow({ steps, stacked = false }: Props) {
  return (
    <div
      className={`my-8 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl border border-brand-500/25 bg-brand-500/[0.05] p-5 sm:gap-x-3 sm:p-6 ${
        stacked ? 'flex-col !items-start' : ''
      }`}
    >
      {steps.map((step, i) => (
        <span key={step} className="flex items-center gap-x-2 sm:gap-x-3">
          {i > 0 && (
            <span aria-hidden className="text-brand-500/70">
              →
            </span>
          )}
          <span className="rounded-lg border border-brand-500/20 bg-surface-2/60 px-2.5 py-1.5 font-mono text-[13px] leading-tight text-theme-primary sm:text-sm">
            {step}
          </span>
        </span>
      ))}
    </div>
  )
}
