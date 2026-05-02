import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { ReturnLink } from '../components/ReturnLink'
import { usePageSEO } from '../lib/seo'

export function WhyPage() {
  usePageSEO()
  return (
    <>
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ReturnLink />
            <h1 className="text-4xl md:text-5xl font-bold text-theme-primary tracking-tight">
              Why Statewave
            </h1>
            <p className="mt-6 text-lg text-theme-muted max-w-2xl">
              A technical comparison for teams building AI support agents that need
              durable, structured memory.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <h2 className="text-2xl font-bold text-theme-primary mb-8">The infrastructure gap</h2>
        <p className="text-theme-muted max-w-3xl leading-relaxed">
          AI support agents forget. Every session starts from zero. Returning customers re-explain
          who they are, what plan they're on, what they asked last time. Agents make the same
          mistakes they made before. This isn't a capability gap in the LLM — it's an
          infrastructure gap. Most AI applications have no memory layer.
        </p>
      </Section>

      <Section className="bg-surface-1/50">
        <h2 className="text-2xl font-bold text-theme-primary mb-12">Statewave vs alternatives</h2>
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
        <h2 className="text-2xl font-bold text-theme-primary mb-12">Key technical properties</h2>
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
        <h2 className="text-2xl font-bold text-theme-primary mb-8">Who this is for</h2>
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
