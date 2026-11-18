import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, Copy } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useCopy, useSeen } from '../components/home/hooks'
import { GITHUB } from '../components/home/links'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/press/press.css'

/* /press in the v8 style: the kit for journalists, newsletter editors and list maintainers.
 * Boilerplate, fast facts, logos, colors, screenshots and the press address. No founder bio, per the
 * neutral brand voice; the legal operator is on /impressum. Every file is one already in
 * public/press or public/images/press, and the facts match /product and the v1.0.0 release.
 * An interior page: the hero ends on a straight edge and the home's cross divider, not the arc. */

// Constants so the rendered text and the copied string stay the same.
const BOILERPLATE_LONG =
  'Statewave is the open-source memory runtime that gives AI agents reproducible, provenance-tagged context — without sampling-noise from query-time retrieval. It compiles raw events into deterministic context bundles per subject and assembles a ranked, token-bounded bundle on demand, with full provenance back to source episodes. Statewave is Apache-2.0 across server and SDKs, self-hosted on PostgreSQL + pgvector, and ships with a public LoCoMo-based benchmark anyone can rerun in roughly 20 minutes.'

const BOILERPLATE_SHORT =
  'Open-source memory runtime for AI agents — compiled, provenance-tagged context bundles, Apache-2.0, self-hosted on Postgres.'

const PRESS = 'press@statewave.ai'
const BENCHMARKS_REPO = 'https://github.com/smaramwbc/statewave-memory-benchmarks'

type Fact = { label: string; value: string; to?: string }

const FACTS: Fact[] = [
  { label: 'Category', value: 'Memory runtime for AI agents' },
  { label: 'License', value: 'Apache-2.0 across the server, SDKs and benchmark' },
  { label: 'Language', value: 'Python server, with Python and TypeScript SDKs' },
  { label: 'Storage', value: 'PostgreSQL 15+ with pgvector 0.4.2+' },
  { label: 'Deployment', value: 'Docker Compose, Helm, Fly.io or Railway' },
  { label: 'Model providers', value: '100+ through LiteLLM, including OpenAI, Anthropic, Bedrock and Ollama' },
  { label: 'v1.0 released', value: 'June 9, 2026', to: `${GITHUB}/releases/tag/v1.0.0` },
  { label: 'Repository', value: 'smaramwbc/statewave on GitHub', to: GITHUB },
  { label: 'Open benchmark', value: 'statewave-memory-benchmarks on GitHub', to: BENCHMARKS_REPO },
  { label: 'Live demo', value: 'statewave.ai/demo, no signup required', to: '/demo' },
]

/** The brand guide's primary colors (public/press/statewave-brand-colors.png). */
const COLORS = [
  { name: 'Cyan 500', hex: '#00C6FF' },
  { name: 'Blue 500', hex: '#4A8CFF' },
  { name: 'Indigo 500', hex: '#6366F1' },
  { name: 'Violet 500', hex: '#7A5CFF' },
  { name: 'Purple 600', hex: '#8B5CF6' },
]

type Asset = { label: string; href: string }

/** The full-color logo, one card per background. */
const LOGOS: { id: string; title: string; img: string; dark?: boolean; files: Asset[] }[] = [
  {
    id: 'dark',
    title: 'For dark backgrounds',
    img: '/press/statewave-wordmark-dark.png',
    dark: true,
    files: [
      { label: 'PNG', href: '/press/statewave-wordmark-dark.png' },
      { label: 'SVG', href: '/press/logo-horizontal-db.svg' },
    ],
  },
  {
    id: 'light',
    title: 'For light backgrounds',
    img: '/press/statewave-wordmark-light.png',
    files: [
      { label: 'PNG', href: '/press/statewave-wordmark-light.png' },
      { label: 'SVG', href: '/press/logo-horizontal-lb.svg' },
    ],
  },
]

const MORE_FILES: { title: string; text: string; files: Asset[] }[] = [
  {
    title: 'Logo, white',
    text: 'One color, for photos and busy backgrounds',
    files: [
      { label: 'PNG', href: '/press/logo-horizontal-white.png' },
      { label: 'SVG', href: '/press/logo-horizontal-white.svg' },
    ],
  },
  {
    title: 'Logo, black',
    text: 'One color, for print and monochrome layouts',
    files: [
      { label: 'PNG', href: '/press/logo-horizontal-black.png' },
      { label: 'SVG', href: '/press/logo-horizontal-black.svg' },
    ],
  },
  {
    title: 'Color reference',
    text: 'Gradient, primary and support colors, light and dark text',
    files: [{ label: 'PNG', href: '/press/statewave-brand-colors.png' }],
  },
]

const SHOTS = [
  { id: 'overview', title: 'Overview', alt: 'The Statewave admin console overview' },
  { id: 'subjects', title: 'Subjects', alt: 'The Statewave admin console subject list' },
  { id: 'diagnostics', title: 'Diagnostics', alt: 'The Statewave admin console diagnostics view' },
] as const

const shot = (id: string, theme: 'light' | 'dark') => `/images/press/screenshots/${id}-${theme}.png`

const DATA = [
  {
    title: 'Benchmark suite',
    text: 'Apache-2.0, LoCoMo-based datasets and row-level JSONL output you can rerun with your own keys.',
    to: BENCHMARKS_REPO,
  },
  {
    title: 'Architecture',
    text: 'How the system is built: the execution flow and the memory pipeline, from episode to bundle.',
    to: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md',
  },
  {
    title: 'Comparisons',
    text: 'How Statewave compares with other memory systems and vector stores, with the method shown.',
    to: 'https://github.com/smaramwbc/statewave-docs/tree/main/comparisons',
  },
]

const i = (n: number) => ({ ['--i' as string]: n }) as CSSProperties

/** A file link. Plain <a download>, not Ln: a router Link would try to render the file as a page. */
function Dl({ href, className, children, name }: { href: string; className?: string; children: ReactNode; name?: string }) {
  return <a href={href} download={name ?? true} className={className}>{children}</a>
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />
}

/* ── hero ── */

function Email({ dark }: { dark?: boolean }) {
  const [done, copy] = useCopy(PRESS)
  return (
    <div className={`pk-mail${dark ? ' pk-mail--dark' : ''}`}>
      <Ln to={`mailto:${PRESS}`} className="pk-mail__addr">{PRESS}</Ln>
      <button type="button" className="pk-mail__copy" onClick={copy} aria-label={`Copy ${PRESS}`}>
        <CopyIcon done={done} />
      </button>
      <span className="pk-sr" aria-live="polite">{done ? 'Copied' : ''}</span>
    </div>
  )
}

function Hero() {
  return (
    <section className="sw-hero pk-hero" aria-label="Press kit">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Press kit</Eyebrow>
        <h1 className="sw-hero__title">
          Everything you need<br /> <span className="sw-hero__grad">to write about Statewave.</span>
        </h1>
        <p className="sw-hero__sub">
          Logos, screenshots, a ready-to-use description and the key facts, free to use in coverage of the project.
        </p>
        <div className="pk-hero__cta">
          <Dl href="/press/BRAND-ASSETS.zip" name="Statewave-Brand-Assets.zip" className="sw-btn sw-btn--solid">
            Brand kit <span className="pk-size">ZIP · 0.7 MB</span> <ArrowDownToLine size={18} aria-hidden="true" />
          </Dl>
          <Dl href="/press/SCREENSHOTS.zip" name="Statewave-Screenshots.zip" className="sw-btn sw-btn--ghost">
            Screenshots <span className="pk-size">ZIP · 7.7 MB</span> <ArrowDownToLine size={18} aria-hidden="true" />
          </Dl>
        </div>
        <div className="pk-hero__contact">
          <span>Press contact</span>
          <Email dark />
        </div>
      </div>
    </section>
  )
}

/* ── boilerplate ── */

function CopyCard({ text, label, short }: { text: string; label: string; short?: boolean }) {
  const [done, copy] = useCopy(text)
  return (
    <div className={`pk-copy${short ? ' pk-copy--short' : ''}`}>
      <p>{short ? `“${text}”` : text}</p>
      <button type="button" className="pk-copy__btn" onClick={copy} aria-label={label}>
        <CopyIcon done={done} /> <span>{done ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

function Boilerplate() {
  return (
    <section id="boilerplate" className="pk-section" aria-labelledby="pk-about">
      <div className="pk-wrap pk-wrap--narrow">
        <Eyebrow>Boilerplate</Eyebrow>
        <H2 id="pk-about" a="What is Statewave?" />
        <CopyCard text={BOILERPLATE_LONG} label="Copy the boilerplate paragraph" />
        <p className="pk-note">Short version, 120 characters or fewer:</p>
        <CopyCard text={BOILERPLATE_SHORT} label="Copy the short boilerplate" short />
        <p className="pk-note">Both are free to copy as written, in articles, newsletters, podcasts and product roundups.</p>
      </div>
    </section>
  )
}

/* ── fast facts ── */

function Facts() {
  const [ref, seen] = useSeen<HTMLDListElement>()
  return (
    <section id="facts" className="pk-section pk-section--tint" aria-labelledby="pk-facts">
      <div className="pk-wrap">
        <div className="pk-head">
          <Eyebrow>Fast facts</Eyebrow>
          <H2 id="pk-facts" a="The project" b="at a glance." />
        </div>
        <dl ref={ref} className="pk-facts" data-seen={seen || undefined}>
          {FACTS.map((f, n) => (
            <div key={f.label} className="pk-fact" style={i(n)}>
              <dt>{f.label}</dt>
              <dd>{f.to ? <Ln to={f.to}>{f.value}</Ln> : f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ── logos, icon and colors ── */

function Files({ files, title }: { files: Asset[]; title: string }) {
  return (
    <span className="pk-files">
      {files.map(f => (
        <Dl key={f.href} href={f.href} className="pk-file">
          <span className="pk-sr">{title}, </span>{f.label} <ArrowDownToLine size={14} aria-hidden="true" />
        </Dl>
      ))}
    </span>
  )
}

function Swatch({ name, hex, n }: { name: string; hex: string; n: number }) {
  const [done, copy] = useCopy(hex)
  return (
    <li style={i(n)}>
      <button type="button" className="pk-swatch" onClick={copy} aria-label={`Copy ${name} ${hex}`}>
        <span className="pk-swatch__chip" style={{ background: hex }}>
          <span className="pk-swatch__done" aria-hidden="true">{done && <Check size={18} />}</span>
        </span>
        <span className="pk-swatch__name">{name}</span>
        <span className="pk-swatch__hex sw-mono">{done ? 'Copied' : hex}</span>
      </button>
    </li>
  )
}

function Brand() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section id="logos" className="pk-section" aria-labelledby="pk-logos">
      <div className="pk-wrap">
        <div className="pk-head">
          <Eyebrow>Brand assets</Eyebrow>
          <H2 id="pk-logos" a="Logos, icon" b="and colors." />
          <p className="sw-lede">
            Use them as they are: no recoloring, stretching or redrawing. The <Ln to={`${GITHUB}/blob/main/TRADEMARKS.md`} className="sw-lede__link">trademark policy</Ln> covers the details.
          </p>
        </div>
        <div ref={ref} className="pk-brand" data-seen={seen || undefined}>
          {LOGOS.map((l, n) => (
            <figure key={l.id} className={`pk-logo${l.dark ? ' pk-logo--dark' : ''}`} style={i(n)}>
              <div className="pk-logo__art"><img src={l.img} alt={`Statewave logo ${l.title.toLowerCase()}`} width={1600} height={600} loading="lazy" /></div>
              <figcaption>
                <span><b>{l.title}</b><small>Full color · transparent</small></span>
                <Files files={l.files} title={`Logo ${l.title.toLowerCase()}`} />
              </figcaption>
            </figure>
          ))}
          <figure className="pk-logo pk-logo--icon" style={i(2)}>
            <div className="pk-logo__art"><img src="/press/statewave-icon.png" alt="Statewave icon" width={1000} height={1000} loading="lazy" /></div>
            <figcaption>
              <span><b>Icon</b><small>1000×1000 · transparent</small></span>
              <Files files={[{ label: 'PNG', href: '/press/statewave-icon.png' }]} title="Icon" />
            </figcaption>
          </figure>
          <div className="pk-colors" style={i(3)}>
            <p><b>Primary colors</b><small>Click a color to copy its HEX.</small></p>
            <ul>{COLORS.map((c, n) => <Swatch key={c.hex} {...c} n={n} />)}</ul>
          </div>
        </div>
        <ul className="pk-more" aria-label="More brand files">
          {MORE_FILES.map(f => (
            <li key={f.title}>
              <span><b>{f.title}</b><small>{f.text}</small></span>
              <Files files={f.files} title={f.title} />
            </li>
          ))}
          <li>
            <span><b>Complete brand kit</b><small>Horizontal and stacked logos, icons, SVG sources, color and type guides</small></span>
            <span className="pk-files">
              <Dl href="/press/BRAND-ASSETS.zip" name="Statewave-Brand-Assets.zip" className="pk-file">ZIP · 0.7 MB <ArrowDownToLine size={14} aria-hidden="true" /></Dl>
            </span>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ── screenshots ── */

function Screenshots() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section id="screenshots" className="pk-section pk-section--tint" aria-labelledby="pk-shots">
      <div className="pk-wrap">
        <div className="pk-head pk-head--row">
          <div>
            <Eyebrow>Screenshots</Eyebrow>
            <H2 id="pk-shots" a="The admin console," b="in light and dark." />
          </div>
          <div className="pk-seg" role="group" aria-label="Screenshot theme">
            {(['light', 'dark'] as const).map(t => (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
        <div ref={ref} className="pk-shots" data-seen={seen || undefined}>
          {SHOTS.map((s, n) => (
            <figure key={s.id} className="pk-shot" style={i(n)}>
              <div className="pk-shot__img">
                <img src={shot(s.id, theme)} alt={`${s.alt}, ${theme} theme`} width={3840} height={2160} loading="lazy" />
              </div>
              <figcaption>
                <b>{s.title}</b>
                <span className="pk-files">
                  <Dl href={shot(s.id, 'light')} className="pk-file"><span className="pk-sr">{s.title}, </span>Light <ArrowDownToLine size={14} aria-hidden="true" /></Dl>
                  <Dl href={shot(s.id, 'dark')} className="pk-file"><span className="pk-sr">{s.title}, </span>Dark <ArrowDownToLine size={14} aria-hidden="true" /></Dl>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="pk-pack">
          <p>
            <b>The full set: 9 screens, each in light and dark.</b> Overview, subjects, diagnostics, jobs, policy,
            receipts, suggested labels, webhooks and settings. PNG, 3840×2160.
          </p>
          <Dl href="/press/SCREENSHOTS.zip" name="Statewave-Screenshots.zip" className="sw-btn sw-btn--outline">
            Download all <span className="pk-size">ZIP · 7.7 MB</span> <ArrowDownToLine size={18} aria-hidden="true" />
          </Dl>
        </div>
      </div>
    </section>
  )
}

/* ── open data ── */

function OpenData() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section id="data" className="pk-section" aria-labelledby="pk-data">
      <div className="pk-wrap">
        <div className="pk-head">
          <Eyebrow>Open data</Eyebrow>
          <H2 id="pk-data" a="Every number we publish" b="can be rerun." />
          <p className="sw-lede">
            No embargoes, no hidden datasets and no private evaluation. The results themselves are on the <Ln to="/benchmarks" className="sw-lede__link">benchmarks page</Ln>.
          </p>
        </div>
        <div ref={ref} className="pk-data" data-seen={seen || undefined}>
          {DATA.map((d, n) => (
            <Ln key={d.title} to={d.to} className="pk-res" style={i(n)}>
              <b>{d.title} <ArrowUpRight size={18} aria-hidden="true" /></b>
              <span>{d.text}</span>
            </Ln>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── contact ── */

function Contact() {
  return (
    <section id="contact" className="pk-section pk-section--tint" aria-labelledby="pk-contact">
      <div className="pk-wrap">
        <div className="pk-contact">
          <div>
            <Eyebrow>Press contact</Eyebrow>
            <H2 id="pk-contact" a="Interviews, quotes" b="and background." />
            <p className="sw-lede">
              Statewave is developed by WebConnect World SL in Madrid, Spain. Write to the press address and we’ll put
              you in touch with the right person. Replies within 72 hours.
            </p>
          </div>
          <div className="pk-contact__box">
            <Email />
            <p>
              Not a press request? <Ln to="/contact">Contact</Ln> lists where everything else goes. The company’s legal
              details are on the <Ln to="/impressum">Impressum</Ln>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── faq ── */

/** The same entries usePageSEO emits as FAQPage JSON-LD, so the visible questions and the
 *  structured data can't drift. */
const FAQ = PAGE_FAQS['/press'] ?? []

function Faq() {
  return (
    <section className="pk-section" aria-label="Frequently asked questions">
      <div className="pk-wrap">
        <div className="pk-head pk-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions from the press" />
        </div>
        <div className="sw-faq">
          {FAQ.map((e, n) => (
            <details key={e.question} {...(n === 0 ? { open: true } : {})}>
              <summary><span aria-hidden="true" className="sw-plus">+</span><h3>{e.question}</h3></summary>
              <div>
                <p>{e.answer}</p>
                {e.links && e.links.length > 0 && (
                  <ul>{e.links.map(l => <li key={l.href}><Ln to={l.href}>{l.label}</Ln></li>)}</ul>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PressPage() {
  // Title, description and canonical come from the /press entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home pk">
      <Hero />
      <Divider />
      <Boilerplate />
      <Facts />
      <Brand />
      <Screenshots />
      <OpenData />
      <Contact />
      <Faq />
    </div>
  )
}
