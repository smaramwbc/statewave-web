import { useEffect, useState } from 'react'

export interface NavSection {
  /** DOM id of the section element this entry points at. */
  id: string
  label: string
}

/**
 * Sticky in-page anchor rail with scroll-spy, for long single-topic pages
 * (/benchmarks, /openrouter) where the reader needs to know where they are.
 *
 * Scroll-spy uses one IntersectionObserver over the section elements rather
 * than a scroll listener, so it costs nothing per frame.
 *
 * Extracted from BenchmarksPage so /openrouter could use the same wayfinding
 * rather than growing a second dialect of it.
 */
export function SectionNav({
  sections,
  label,
}: {
  sections: readonly NavSection[]
  /** aria-label for the nav landmark, e.g. "Benchmark sections". */
  label: string
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top of the viewport among those visible;
        // "last one that crossed" alone flickers when two sections overlap.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  return (
    <nav
      aria-label={label}
      // Parks directly under the fixed 60px navbar. That bar also carries
      // `pt-safe`, so the offset has to include the same inset or this row
      // tucks underneath it on notched devices in standalone mode.
      style={{ top: 'calc(60px + env(safe-area-inset-top))' }}
      className="sticky z-30 border-y border-theme-border bg-surface-0/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={active === s.id ? 'true' : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              active === s.id
                ? 'bg-accent/12 text-accent'
                : 'text-theme-muted hover:bg-surface-2/60 hover:text-theme-primary'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
