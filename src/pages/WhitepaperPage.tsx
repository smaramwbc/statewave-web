import { useEffect, useState } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { usePageSEO } from '../lib/seo'

/**
 * /whitepaper — landing page for the Statewave technical white paper.
 *
 * The PDF (public/whitepaper/compiled-memory.pdf) is generated and kept in
 * sync by the private statewave-launch repo's CI; this page presents it.
 * Wrapper copy stays in the neutral brand voice per the launch rule — the
 * author byline lives in the PDF itself, not in marketing copy here.
 */

const PDF_PATH = '/whitepaper/compiled-memory.pdf'

const SECTIONS = [
  'The long-horizon context-assembly problem, formalised',
  'The Statewave model — RECORD → COMPILE → CONTEXT → GOVERN',
  'A structured comparison of memory architectures (RAG, Mem0, memU, Zep, Letta)',
  'A preliminary, equal-budget LoCoMo evaluation',
  'Determinism, provenance, and governance as first-class properties',
  'Limitations and threats to validity',
]

export function WhitepaperPage() {
  usePageSEO({
    title: 'Statewave White Paper — Compiled Memory',
    description:
      'Compiled Memory: a technical white paper on Statewave\'s approach to long-horizon AI agent memory — deterministic, provenance-traced, token-bounded context bundles. Free PDF.',
  })

  // "Full screen" here means filling the browser window (an in-page overlay),
  // not the native Fullscreen API that takes over the whole monitor.
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!isMaximized) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMaximized(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isMaximized])

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            White paper · Statewave v1.0
          </p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Compiled Memory
          </h1>
          <p className="mt-3 text-lg text-theme-secondary leading-snug">
            A deterministic, provenance-traced runtime for long-horizon AI agent context.
          </p>
          <p className="mt-5 text-base text-theme-secondary leading-relaxed">
            A technical white paper on why agent memory should be treated as a compiled, governed
            runtime rather than a retrieval index — and how Statewave compiles raw events into
            ranked, token-bounded context bundles with full provenance back to their source.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <Button href={PDF_PATH} size="lg">
              Read the white paper (PDF)
            </Button>
            <a
              href={PDF_PATH}
              download
              className="inline-flex items-center justify-center min-h-12 px-7 py-3.5 text-base font-medium rounded-xl bg-surface-2 text-theme-primary border border-theme-border hover:bg-surface-3 transition-[background-color,color,border-color] duration-200"
            >
              Download PDF &darr;
            </a>
          </div>
          <p className="mt-4 text-xs text-theme-muted leading-relaxed">
            Apache-2.0 project. Benchmark figures in the paper are preliminary, single-pass,
            equal-budget results; the variance-checked multi-run aggregate supersedes them when
            complete. Reproduce them yourself with{' '}
            <a
              href="https://github.com/smaramwbc/statewave-bench"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              statewave-bench
            </a>
            .
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="whats-inside" className="text-2xl font-bold text-theme-primary mb-6">
            What&rsquo;s inside
          </Heading>
          <ul className="space-y-3">
            {SECTIONS.map((s) => (
              <li key={s} className="flex gap-3 text-sm text-theme-secondary leading-relaxed">
                <span aria-hidden="true" className="mt-1 text-accent">&bull;</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div
          className={
            isMaximized
              ? 'fixed inset-0 z-[100] flex flex-col bg-surface-0 p-4 sm:p-6'
              : 'mx-auto max-w-4xl'
          }
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <Heading id="read" className="text-2xl font-bold text-theme-primary">
              Read it here
            </Heading>
            <button
              type="button"
              onClick={() => setIsMaximized((v) => !v)}
              aria-label={isMaximized ? 'Exit full screen' : 'View full screen'}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-accent/30 hover:bg-accent-light transition-colors"
            >
              {isMaximized ? 'Exit full screen' : 'Full screen'}
              <span aria-hidden="true">⤢</span>
            </button>
          </div>
          <div
            className={
              isMaximized
                ? 'min-h-0 flex-1 overflow-hidden rounded-xl border border-theme-border bg-surface-1'
                : 'overflow-hidden rounded-2xl border border-theme-border bg-surface-1 h-[80vh] min-h-[480px]'
            }
          >
            <object
              data={PDF_PATH}
              type="application/pdf"
              className="w-full h-full"
              aria-label="Compiled Memory white paper (PDF)"
            >
              <div className="p-6 text-sm text-theme-secondary">
                Your browser can&rsquo;t display the embedded PDF.{' '}
                <a href={PDF_PATH} className="text-accent hover:underline" download>
                  Download the white paper
                </a>{' '}
                instead.
              </div>
            </object>
          </div>
        </div>
      </Section>
    </>
  )
}
