import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { ReturnLink } from '../components/ReturnLink'
import { LanguagePicker } from '../components/LanguagePicker'
import {
  ENGLISH_COPY,
  detectInitialLang,
  languageFor,
  loadManifesto,
  persistLang,
  type LangCode,
  type ManifestoCopy,
} from '../lib/manifesto-i18n'
import { usePageSEO } from '../lib/seo'

export function WhyPage() {
  usePageSEO()
  return (
    <>
      <ManifestoHero />

      <Section>
        <Heading id="infrastructure-gap" className="text-2xl font-bold text-theme-primary mb-8">The infrastructure gap</Heading>
        <p className="text-theme-muted max-w-3xl leading-relaxed">
          AI support agents forget. Every session starts from zero. Returning customers re-explain
          who they are, what plan they're on, what they asked last time. Agents make the same
          mistakes they made before. This isn't a capability gap in the LLM — it's an
          infrastructure gap. Most AI applications have no memory layer.
        </p>
      </Section>

      <Section className="bg-surface-1/50">
        <Heading id="vs-alternatives" className="text-2xl font-bold text-theme-primary mb-12">Statewave vs alternatives</Heading>
        <div className="rounded-2xl border border-theme-border bg-surface-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="text-left p-4 text-theme-muted font-medium">Property</th>
                <th className="text-left p-4 text-theme-muted font-medium">Prompt stuffing</th>
                <th className="text-left p-4 text-theme-muted font-medium">Naive RAG</th>
                <th className="text-left p-4 text-accent font-medium">Statewave</th>
              </tr>
            </thead>
            <tbody className="text-theme-secondary">
              {[
                ['Deterministic', '✗', '✗', '✓'],
                ['Token-bounded', '✗', 'Truncation', '✓ Ranked packing'],
                ['Provenance', '✗', '✗', '✓ Episode-level'],
                ['Structured extraction', '✗', '✗', '✓ Typed memories'],
                ['Temporal reasoning', '✗', '✗', '✓ Validity windows'],
                ['Confidence scoring', '✗', '✗', '✓'],
                ['Idempotent', 'N/A', 'N/A', '✓'],
                ['Subject lifecycle', '✗', '✗', '✓ Full CRUD + delete'],
                ['Cost at scale', 'Linear growth', 'Index bloat', 'Bounded by budget'],
              ].map(([prop, ps, rag, sw], i) => (
                <tr key={i} className="border-b border-theme-border last:border-0">
                  <td className="p-4 font-medium">{prop}</td>
                  <td className="p-4 text-theme-muted">{ps}</td>
                  <td className="p-4 text-theme-muted">{rag}</td>
                  <td className="p-4 text-accent">{sw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <Heading id="technical-properties" className="text-2xl font-bold text-theme-primary mb-12">Key technical properties</Heading>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Deterministic', desc: 'Same subject + task + budget → same context bundle. No non-determinism from vector-only retrieval.' },
            { title: 'Token-bounded', desc: 'Context assembly respects a configurable token budget. Items are packed by ranked score, not truncated arbitrarily.' },
            { title: 'Provenance-traced', desc: 'Every memory traces to its source episode IDs. Every context bundle reports which facts and episodes were included.' },
            { title: 'Idempotent', desc: 'Recompiling the same subject produces no duplicate memories. Safe to run on schedule or on-demand.' },
            { title: 'Subject-centric', desc: 'Everything organized around subjects. Full lifecycle: ingest → compile → retrieve → inspect → delete.' },
            { title: 'Self-hosted storage', desc: 'Postgres-only. Episodes and compiled memories stay in your infrastructure. Whether prompt content leaves depends on your compiler and embedding choice — heuristic mode is fully local.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-theme-border bg-surface-1"
            >
              <h3 className="text-base font-semibold text-theme-primary mb-2">{item.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <Heading id="who-this-is-for" className="text-2xl font-bold text-theme-primary mb-8">Who this is for</Heading>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Good fit</h3>
            <ul className="space-y-3 text-sm text-theme-secondary">
              {[
                'Teams building AI support agents with returning customers',
                'Engineering leads who want measurable context quality',
                'Teams that need provenance — "why did the agent say X?"',
                'Self-hosted storage requirements — episodes and memories stay on your infrastructure (heuristic compiler keeps everything local; LLM compiler or hosted embeddings will send content to the chosen provider)',
                'Small capable teams using AI coding tools',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-muted mb-4">Not yet a fit</h3>
            <ul className="space-y-3 text-sm text-theme-muted">
              {[
                'Need a hosted SaaS (Statewave is self-hosted infrastructure)',
                'Just need a vector database (use pgvector/Pinecone directly)',
                'Building chatbots with no multi-session requirement',
                'Need horizontal scaling today (not yet supported)',
                'Looking for a complete agent framework',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── Manifesto hero ────────────────────────────────────────────────────────
 * The /why page used to open with a dry "A technical comparison for teams…"
 * subhead. The page is literally called Why — so it should answer with the
 * actual why first. Heart, then proof. The technical comparison sections
 * below now read as evidence rather than the main act.
 *
 * Layout: standard page top spacing (pt-32) for nav clearance, narrow
 * centered column for manifesto-style readability, subtle accent halo
 * behind the words, sign-off rule at the bottom that pairs with the
 * technical sections that follow.
 */
function ManifestoHero() {
  // Two-phase init for SSR/hydration safety: render English on first paint,
  // then sync to the detected/stored preference after mount.
  const [lang, setLang] = useState<LangCode>('en')
  // Copy is loaded async per locale (each is a separate JS chunk via
  // import.meta.glob). English is bundled with this page, so the very first
  // render never paints empty. Subsequent locale switches show the previous
  // copy until the new chunk arrives — typically a single frame on a hot
  // network and the cache makes repeat picks instant.
  const [copy, setCopy] = useState<ManifestoCopy>(ENGLISH_COPY)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(detectInitialLang())
  }, [])

  useEffect(() => {
    let cancelled = false
    loadManifesto(lang).then((next) => {
      if (!cancelled) setCopy(next)
    })
    return () => {
      cancelled = true
    }
  }, [lang])

  const handleLang = (code: LangCode) => {
    setLang(code)
    persistLang(code)
  }

  const langInfo = languageFor(lang)
  const dir = langInfo.dir ?? 'ltr'

  return (
    <section className="relative pt-32 pb-24 md:pb-32 overflow-hidden">
      {/* Soft accent halo — barely there, just a warmth behind the words. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(55% 55% at 50% 30%, rgba(99,102,241,0.08), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* The header row stays LTR regardless of the manifesto language —
            it carries product chrome (back-link, picker), not localized
            content. */}
        <div className="flex items-start justify-between gap-4">
          <ReturnLink />
          <div className="ml-auto">
            <LanguagePicker value={lang} onChange={handleLang} />
          </div>
        </div>

        {/* Eyebrow / headline / body / closer cross-fade together on language
            switch. We avoid `variants` on the inner children because mixing
            inline `initial`/`animate` on the keyed parent with variant-based
            children breaks variant inheritance — children can get stuck at
            their `hidden` variant after the first switch and render invisibly.
            The keyed parent's single fade is enough; staggering each child on
            every locale change would feel busy anyway. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={lang}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            dir={dir}
            lang={lang}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
              {copy.eyebrow}
            </p>

            <h1 className="mt-6 text-[2.25rem] md:text-[3rem] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.12]">
              {copy.headline}
            </h1>

            <div className="mt-10 space-y-6 text-[1.075rem] md:text-lg text-theme-secondary leading-[1.75]">
              {copy.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <p className="mt-10 text-2xl md:text-[1.875rem] font-semibold tracking-[-0.015em] leading-snug">
              {copy.closerLead}{' '}
              <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
                {copy.closerHighlight}
              </span>
            </p>

            <div className="mt-12 flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
              <span className="text-xs text-theme-muted tracking-wide">
                {copy.signoff}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* The "scroll for the technical case" hint stays mounted across
            locale changes — only its label translates. */}
        <div className="mt-16 flex justify-center">
          <a
            href="#infrastructure-gap"
            className="group inline-flex items-center gap-2 text-xs text-theme-muted hover:text-accent transition-colors"
            dir={dir}
            lang={lang}
          >
            <span className="tracking-wide uppercase">{copy.technicalCta}</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
