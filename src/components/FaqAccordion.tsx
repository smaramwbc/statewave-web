import { Link } from 'react-router'
import type { FaqEntry } from '../lib/seo-meta'

/* Shared FAQ accordion — used on the homepage's FAQ section and on the
 * dedicated /faq page, so the two don't drift into two different markup
 * shapes for the same FAQ_ENTRIES data.
 *
 * Semantic structure: each Q&A is a <details> so it's collapsible by
 * keyboard and assistive tech, with the question as a real <h3> inside
 * <summary> (valid per HTML spec — summary accepts one heading) and the
 * answer as a paragraph in the disclosure body. The visible HTML is the
 * same content the FAQPage JSON-LD emits, so search and answer engines
 * see one source of truth.
 */
export function FaqAccordion({ entries }: { entries: readonly FaqEntry[] }) {
  return (
    <div className="mx-auto max-w-4xl space-y-3">
      {entries.map((entry, i) => (
        <details
          key={entry.question}
          // First item open by default so the section reads as content,
          // not a wall of collapsed accordions, on first paint.
          {...(i === 0 ? { open: true } : {})}
          className="group rounded-2xl border border-brand-500/20 bg-surface-1/45 backdrop-blur-sm transition-colors hover:border-brand-500/35"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-4 px-6 list-none [&::-webkit-details-marker]:hidden">
            <h3 className="text-[18px] font-semibold leading-snug text-theme-primary">
              {entry.question}
            </h3>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-theme-primary/40 bg-surface-2/40 transition-all group-open:rotate-180 group-hover:border-brand-500/40">
              <svg
                className="h-5 w-5 text-theme-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </summary>

          <div className="px-7 pb-7">
            <div className="h-px bg-theme-primary/10 mb-6" />

            <p className="text-[16px] leading-8 text-theme-secondary/80">
              {entry.answer}
            </p>

            {entry.links && entry.links.length > 0 && (
              <div className="mt-5">
                <FaqLinks links={entry.links} />
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}

/* Internal targets — anything starting with "/" or "#" — render as same-tab
 * navigation (React Router for routes, plain anchor for in-page hashes) so
 * the visitor stays on the site. Everything else (GitHub docs, mailto, etc.)
 * opens in a new tab with rel="noopener noreferrer". */
type FaqLink = { label: string; href: string }

function FaqLinks({ links }: { links: ReadonlyArray<FaqLink> }) {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {links.map((link) => (
        <li key={link.href}>
          <FaqLinkAnchor link={link} />
        </li>
      ))}
    </ul>
  )
}

function FaqLinkAnchor({ link }: { link: FaqLink }) {
  const { label, href } = link
  const className =
    'inline-flex items-center gap-1 font-medium text-accent hover:text-accent-light hover:underline underline-offset-4 transition-colors'

  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {label}
        <ArrowRightIcon />
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {label}
        <ArrowRightIcon />
      </a>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
      <ExternalIcon />
    </a>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5M19 5l-9 9M5 7v12h12" />
    </svg>
  )
}
