import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Card } from '../components/Card'
import { usePageSEO } from '../lib/seo'

export function ProductPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-theme-primary tracking-tight">
              How Statewave works
            </h1>
            <p className="mt-6 text-lg text-theme-muted max-w-2xl">
              A clear data lifecycle: record raw events, compile durable memories,
              retrieve ranked context, govern with provenance and deletion.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <h2 className="text-2xl font-bold text-theme-primary mb-12">The core loop</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Record', desc: 'Immutable episodes capture raw interaction truth — conversations, tool calls, decisions. Append-only, never mutated.' },
            { step: '02', title: 'Compile', desc: 'Pluggable compilers derive typed memories with confidence scores, validity windows, and provenance back to source episodes.' },
            { step: '03', title: 'Context', desc: 'Assembly service builds ranked, token-bounded, deterministic context bundles ready for any prompt.' },
            { step: '04', title: 'Govern', desc: 'Provenance inspection, subject timelines, GDPR-style deletion, authentication, rate limiting, webhooks.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-theme-border bg-surface-1"
            >
              <span className="text-xs font-mono text-accent">{item.step}</span>
              <h3 className="text-lg font-semibold text-theme-primary mt-2 mb-3">{item.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <h2 className="text-2xl font-bold text-theme-primary mb-12">Domain model</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card
            title="Episodes"
            description="Immutable raw event records. Conversations, tool calls, decisions, observations. The ground truth that Statewave remembers. Append-only, never mutated."
          />
          <Card
            title="Memories"
            description="Compiled typed facts with confidence scores, validity windows, embeddings, and provenance back to source episodes. Kinds: profile_fact, preference, procedure, episode_summary."
          />
          <Card
            title="Context Bundles"
            description="Runtime output: ranked, token-bounded, deterministic. Sections for task, facts, procedures, history, episodes. Ready to inject into any LLM prompt."
          />
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl font-bold text-theme-primary mb-12">Support-native intelligence</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card
            title="Handoff packs"
            description="Compact escalation briefs with customer summary, active issue, attempted steps, resolution history, health score, and SLA status — ready for human or AI handoff."
          />
          <Card
            title="Health scoring"
            description="Deterministic 0–100 scores with explainable factors: unresolved issues, repeat problems, SLA breaches. States: healthy (≥70), watch (40–69), at_risk (<40)."
          />
          <Card
            title="SLA tracking"
            description="First-response time, resolution time, per-session breach detection. Custom thresholds. Integrated into health scoring and handoff context."
          />
          <Card
            title="Resolution tracking"
            description="Track issue state per session — open, resolved, unresolved. Surface resolution history when patterns recur. Repeat-issue detection built in."
          />
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <h2 className="text-2xl font-bold text-theme-primary mb-12">Scoring model</h2>
        <div className="rounded-2xl border border-theme-border bg-surface-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="text-left p-4 text-theme-muted font-medium">Signal</th>
                <th className="text-left p-4 text-theme-muted font-medium">Range</th>
                <th className="text-left p-4 text-theme-muted font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-theme-secondary">
              <tr className="border-b border-theme-border"><td className="p-4">Kind priority</td><td className="p-4">3–10</td><td className="p-4">profile_fact=10, procedure=8, episode_summary=5, raw_episode=3</td></tr>
              <tr className="border-b border-theme-border"><td className="p-4">Recency</td><td className="p-4">0–5</td><td className="p-4">Linear scale: most recent = max</td></tr>
              <tr className="border-b border-theme-border"><td className="p-4">Task relevance</td><td className="p-4">0–8</td><td className="p-4">Word overlap (0–5) or cosine similarity (0–8)</td></tr>
              <tr><td className="p-4">Temporal validity</td><td className="p-4">-4 to +3</td><td className="p-4">Currently valid = +3, expired = -4</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
