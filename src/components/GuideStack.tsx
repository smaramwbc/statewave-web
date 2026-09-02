import { motion, useReducedMotion } from 'framer-motion'

/* The Statewave Guide stack — source code down to human help.
 *
 * Days 4 to 7 all refer back to this, so it is a component rather than an
 * exported image: one place to change when the stack changes, and the
 * layer names stay real text — selectable, translatable, readable by a
 * screen reader, and indexable — which a PNG or a flattened SVG is not.
 *
 * The artwork still exists as a PNG for social and for anyone who wants to
 * save or share it; the caption links to it rather than spending a
 * download button on it.
 *
 * `highlight` marks the layer an episode has just added, the way the
 * artwork marks it. Layers animate in on scroll in stack order, so the eye
 * follows authority downward — which is the diagram's whole point.
 */
interface Props {
  /** Layer number to outline, 1–5. Omit for none. */
  highlight?: number
  /** Right-hand note in the status line under the diagram. */
  note?: string
}

const LAYERS = [
  {
    name: 'Source code',
    question: 'the knowledge already exists',
    detail: 'routes · components · forms · services · permissions · schemas · tests',
  },
  {
    name: 'Application graph',
    question: 'what can we prove?',
    detail: 'edges evidence-only · file, symbol and line · unknown is better than wrong',
  },
  {
    name: 'Product model',
    question: 'what do we know?',
    detail: 'verified claims · feature scope · a fact must belong to the feature',
  },
  {
    name: 'Guidance compiler',
    question: 'what is worth telling the user?',
    detail: 'entry → task action → terminal action · every dropped action needs a reason',
  },
  {
    name: 'Human help',
    question: 'how do we say it?',
    detail: 'natural language · complete task · every factual sentence provable',
  },
] as const

export function GuideStack({ highlight, note }: Props) {
  // The global reduced-motion rule in index.css only reaches CSS
  // animations; framer animates through inline styles, so it has to be
  // asked separately.
  const reduced = useReducedMotion() ?? false
  const rise = (i: number) =>
    reduced
      ? {}
      : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.4, delay: i * 0.12 },
      }

  return (
    <figure className="my-10! mx-0!">
      <div className="rounded-3xl border border-brand-500/20 bg-surface-1/40 p-5 sm:p-8">
        <p className="m-0! text-center font-heading text-xl font-bold tracking-tight text-theme-primary sm:text-2xl">
          The stack
        </p>
        <p className="mt-2! mb-0! text-center font-mono text-[11px] leading-5 text-theme-secondary/70 sm:text-xs">
          AI proposes meaning. Evidence decides what survives.
        </p>

        <ol className="mt-6! mb-0! pl-0! list-none! space-y-0">
          {LAYERS.map((layer, i) => {
            const on = highlight === i + 1
            return (
              <li key={layer.name} className="mb-0!">
                {i > 0 && (
                  <motion.div
                    aria-hidden
                    {...(reduced
                      ? {}
                      : {
                        initial: { scaleY: 0 },
                        whileInView: { scaleY: 1 },
                        viewport: { once: true, margin: '-60px' },
                        transition: { duration: 0.25, delay: i * 0.12 },
                      })}
                    className="mx-auto h-5 w-px origin-top bg-brand-500/40"
                  />
                )}

                <motion.div
                  {...rise(i)}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    on
                      ? 'border-brand-500/60 bg-brand-500/[0.08]'
                      : 'border-brand-500/20 bg-surface-2/40'
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-xs text-theme-secondary/60">
                      0{i + 1}
                    </span>
                    <span className="font-heading text-base font-semibold text-theme-primary sm:text-lg">
                      {layer.name}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-accent sm:text-xs">
                      {layer.question}
                    </span>
                  </div>

                  <p className="mt-2! mb-0! font-mono text-[11px] leading-5 text-theme-secondary/70">
                    {layer.detail}
                  </p>
                </motion.div>
              </li>
            )
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-theme-border pt-4 font-mono text-[11px] text-theme-secondary/60">
          <span>
            <span className="text-success">$</span> stack: 5 layers · authority flows down, never up
          </span>
          {note && <span>{note}</span>}
        </div>
      </div>

      <figcaption className="mt-4! text-right text-xs text-theme-muted">
        <a
          href="/images/guide/stack.png"
          target="_blank"
          rel="noopener noreferrer"
          /* A caption, not a call to action: the accent underline the prose
             styles give every link makes it read as the point of the
             figure. */
          className="text-theme-muted! no-underline! transition-colors hover:text-theme-secondary!"
        >
          Open as image ↗
        </a>
      </figcaption>
    </figure>
  )
}
