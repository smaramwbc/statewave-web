import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Card } from '../components/Card'
import { Heading } from '../components/Heading'
import { HowStatewaveWorks } from '../components/HowStatewaveWorks'
import { usePageSEO } from '../lib/seo'

export function ProductPage() {
  usePageSEO()
  return (
    <>
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[clamp(1.875rem,6vw,3rem)] font-bold text-theme-primary tracking-tight break-anywhere">
              How Statewave works
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-theme-muted max-w-2xl leading-[1.65] sm:leading-[1.7]">
              A clear data lifecycle: record raw events, compile durable memories,
              retrieve ranked context, govern with provenance and deletion.
            </p>
          </motion.div>
        </div>
      </section>

      <Section className="bg-surface-1/40">
        <HowStatewaveWorks variant="full" id="how-it-works" showHeader={false} />
      </Section>

      <Section>
        <Heading id="core-loop" className="text-2xl font-bold text-theme-primary mb-12">The core loop</Heading>
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
        <Heading id="domain-model" className="text-2xl font-bold text-theme-primary mb-12">Domain model</Heading>
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
        <Heading id="support-native" className="text-2xl font-bold text-theme-primary mb-12">Support-native intelligence</Heading>
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

      <Section>
        <Heading id="privacy" className="text-2xl font-bold text-theme-primary mb-4">Privacy &amp; data flow</Heading>
        <p className="text-theme-muted leading-relaxed mb-8 max-w-3xl">
          Statewave is honest about what stays local and what leaves your network. Privacy depends on
          the four layers below, not just where Postgres runs.
        </p>
        {/* On phones a 3-col table with multi-line cell text gets right-edge
            clipped; we render the same data as a stack of cards under md.
            md+ keeps the original table for scannable side-by-side reading. */}
        {(() => {
          const rows: Array<{ layer: string; runs: string; leaves: string }> = [
            { layer: 'Storage (Postgres + pgvector)', runs: 'Your infrastructure', leaves: 'Nothing.' },
            { layer: 'Retrieval / ranking', runs: 'Your infrastructure (Statewave server)', leaves: 'Nothing — ranking is local and deterministic.' },
            { layer: 'Compilation — heuristic', runs: 'Your infrastructure', leaves: 'Nothing. Default mode.' },
            { layer: 'Compilation — LLM', runs: 'Configured provider via LiteLLM', leaves: 'Episode batches sent to the provider you choose. Self-hosted models keep this local.' },
            { layer: 'Embeddings (optional)', runs: 'Configured provider', leaves: 'Episode/memory text sent for vectorization. Use a self-hosted embedding model to avoid this.' },
            { layer: "Your agent's LLM", runs: 'Wherever you host it', leaves: "Statewave returns context to your agent; what your agent sends to its model is governed by your agent, not Statewave." },
          ]
          return (
            <>
              {/* Mobile: stacked cards. Each property sits on its own row
                  (label left, value right) so the visitor can compare runs/
                  leaves side-by-side per layer without scanning vertically
                  through duplicate labels. The "What leaves" column tends to
                  be longer so it wraps within its column. */}
              <div className="md:hidden space-y-3">
                {rows.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-theme-border bg-surface-2 p-4">
                    <p className="text-sm font-semibold text-theme-primary mb-3 break-anywhere">{r.layer}</p>
                    <dl className="space-y-1.5">
                      <div className="flex items-baseline gap-3 py-0.5">
                        <dt className="text-[10px] font-medium uppercase tracking-wider text-theme-muted w-24 flex-shrink-0">Runs</dt>
                        <dd className="text-xs text-theme-secondary break-anywhere">{r.runs}</dd>
                      </div>
                      <div className="flex items-baseline gap-3 py-0.5">
                        <dt className="text-[10px] font-medium uppercase tracking-wider text-theme-muted w-24 flex-shrink-0">Leaves net</dt>
                        <dd className="text-xs text-theme-secondary break-anywhere">{r.leaves}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              {/* md+: original table */}
              <div className="hidden md:block rounded-2xl border border-theme-border bg-surface-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme-border">
                        <th className="text-left p-4 text-theme-muted font-medium">Layer</th>
                        <th className="text-left p-4 text-theme-muted font-medium">Where it runs</th>
                        <th className="text-left p-4 text-theme-muted font-medium">What leaves your network</th>
                      </tr>
                    </thead>
                    <tbody className="text-theme-secondary">
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-theme-border last:border-0">
                          <td className="p-4">{r.layer}</td>
                          <td className="p-4">{r.runs}</td>
                          <td className="p-4">{r.leaves}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        })()}
        <p className="mt-6 text-xs text-theme-muted/80 leading-relaxed max-w-3xl">
          <strong className="text-theme-secondary">Fully local mode:</strong> heuristic compiler + a self-hosted
          embedding model (or text-only retrieval) means no Statewave-driven traffic leaves your network. Any
          additional privacy depends on the LLM <em>your</em> agent calls.
        </p>
      </Section>

      <Section>
        <Heading id="audit-governance" className="text-2xl font-bold text-theme-primary mb-4">Audit &amp; governance</Heading>
        <p className="text-theme-muted leading-relaxed mb-8 max-w-3xl">
          v0.8 ships the governance layer: every context assembly can emit an immutable audit
          artifact, and per-memory sensitivity labels feed a declarative policy engine that filters
          memory access by caller identity. Both surfaces are designed for compliance review &mdash; not
          a "trust us" log, but addressable records with byte-level integrity hashes that a reviewer
          can verify without trusting the application that wrote them.
        </p>
        {(() => {
          const rows: Array<{ feature: string; what: string; lever: string }> = [
            {
              feature: 'State-assembly receipts',
              what: 'Immutable, ULID-addressable record of which memories and episodes influenced an assembled context bundle, with a SHA-256 hash of the bytes delivered to the agent. Queryable by id or by subject/time-range with a stable cursor.',
              lever: 'emit_receipt: true per request, or tenant config receipts: always for compliance-grade tenants',
            },
            {
              feature: 'Per-entry supersession status',
              what: 'Each selected memory carries its active | superseded | tombstoned state, source episodes, and provenance hash. Stale facts, resurrected tombstones, and unresolved conflicts are detectable from the receipt alone.',
              lever: 'No config — recorded automatically',
            },
            {
              feature: 'Sensitivity labels',
              what: 'Per-memory capability tags (pii, financial, secret, …) operators set via PATCH /v1/memories/{id}/labels. Stored as a typed TEXT[] column with a GIN index so policy filters run in milliseconds on the hot path.',
              lever: 'Operator-supplied in v0.8; compiler/connector heuristic auto-labeling shipped in v0.9 — advisory `suggested_labels` separate from authoritative `sensitivity_labels`, promotion is an explicit operator action',
            },
            {
              feature: 'Declarative policy engine',
              what: 'YAML or JSON policy bundles with six predicates (label match, caller_type, caller_id) and two actions (deny, redact). Bundles are content-hashed and immutable. Receipts reference the bundle hash, so "what did policy abc123 say on date Y?" is answerable forever.',
              lever: 'POST /admin/policy/bundles to upload; receipts continue to record decisions even when policy_mode is log_only',
            },
            {
              feature: 'Log-only vs enforce',
              what: 'log_only (default) records every decision into the receipt without filtering — operators can audit a policy for days before flipping enforce. enforce drops denied memories before ranking and redacts marked ones in place.',
              lever: 'PATCH /admin/tenants/{id}/config { policy_mode: enforce }',
            },
            {
              feature: 'Mandatory caller identity',
              what: 'caller_id and caller_type on every assembly call feed the policy evaluator. Compliance tenants can flip require_caller_identity: true so anonymous calls return 401 — making policy enforcement non-bypassable.',
              lever: 'PATCH /admin/tenants/{id}/config { require_caller_identity: true }',
            },
          ]
          return (
            <>
              <div className="md:hidden space-y-3">
                {rows.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-theme-border bg-surface-2 p-4">
                    <p className="text-sm font-semibold text-theme-primary mb-3 break-anywhere">{r.feature}</p>
                    <p className="text-xs text-theme-secondary mb-2 break-anywhere">{r.what}</p>
                    <p className="text-[11px] text-theme-muted break-anywhere"><strong className="text-theme-secondary">Operator lever:</strong> {r.lever}</p>
                  </div>
                ))}
              </div>
              <div className="hidden md:block rounded-2xl border border-theme-border bg-surface-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme-border">
                        <th className="text-left p-4 text-theme-muted font-medium w-1/4">Feature</th>
                        <th className="text-left p-4 text-theme-muted font-medium">What it does</th>
                        <th className="text-left p-4 text-theme-muted font-medium w-1/4">Operator lever</th>
                      </tr>
                    </thead>
                    <tbody className="text-theme-secondary">
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-theme-border last:border-0 align-top">
                          <td className="p-4 font-medium text-theme-primary">{r.feature}</td>
                          <td className="p-4 text-xs leading-relaxed">{r.what}</td>
                          <td className="p-4 text-xs leading-relaxed text-theme-muted">{r.lever}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        })()}
        <p className="mt-6 text-xs text-theme-muted/80 leading-relaxed max-w-3xl">
          Receipts and labels live alongside the existing provenance + supersession primitives — the
          governance layer was designed to extend the data model that was already there, not bolt on
          a parallel one. Full reference:{' '}
          <a className="text-theme-primary underline underline-offset-2" href="https://github.com/smaramwbc/statewave-docs/blob/main/receipts.md">receipts.md</a>
          {' '}and{' '}
          <a className="text-theme-primary underline underline-offset-2" href="https://github.com/smaramwbc/statewave-docs/blob/main/sensitivity-labels.md">sensitivity-labels.md</a>.
        </p>
      </Section>

      <Section className="bg-surface-1/50">
        <Heading id="scoring-model" className="text-2xl font-bold text-theme-primary mb-4">Scoring model</Heading>
        <p className="text-theme-muted leading-relaxed mb-8 max-w-3xl">
          Ranking is deterministic and inspectable. Items are sorted by composite score and packed
          into your token budget. Support-agent workloads apply additional session, urgency, and
          repeat-issue signals on top of the core formula below.
        </p>
        {(() => {
          const rows: Array<{ signal: string; range: string; description: string }> = [
            { signal: 'Kind priority', range: '3–10', description: 'profile_fact=10, procedure=8, episode_summary=5, raw_episode=3' },
            { signal: 'Recency', range: '0–5', description: 'Linear scale: most recent = max' },
            { signal: 'Task relevance', range: '0–8', description: 'Word overlap (0–5) or cosine similarity (0–8)' },
            { signal: 'Temporal validity', range: '-4 to +3', description: 'Currently valid = +3, expired = -4' },
          ]
          return (
            <>
              {/* Mobile: stacked cards. The Range pill is shown inline with
                  the signal name to save vertical space — it's short enough
                  to fit on one line at 320px. */}
              <div className="md:hidden space-y-3">
                {rows.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-theme-border bg-surface-2 p-4">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-theme-primary break-anywhere">{r.signal}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-3 text-theme-muted whitespace-nowrap">{r.range}</span>
                    </div>
                    <p className="text-xs text-theme-secondary leading-relaxed break-anywhere">{r.description}</p>
                  </div>
                ))}
              </div>

              {/* md+: original table */}
              <div className="hidden md:block rounded-2xl border border-theme-border bg-surface-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme-border">
                        <th className="text-left p-4 text-theme-muted font-medium">Signal</th>
                        <th className="text-left p-4 text-theme-muted font-medium">Range</th>
                        <th className="text-left p-4 text-theme-muted font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-theme-secondary">
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-theme-border last:border-0">
                          <td className="p-4">{r.signal}</td>
                          <td className="p-4">{r.range}</td>
                          <td className="p-4">{r.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        })()}
        <p className="mt-6 text-xs text-theme-muted/80 leading-relaxed max-w-3xl">
          <strong className="text-theme-secondary">Customization today:</strong> the weights are fixed.
          Filter the candidate set (by kind or subject) before retrieval, or subclass the assembler in
          your deployment if you need different defaults. Per-call weight overrides are not exposed —
          we'd rather ship that in response to a concrete misranking than speculatively. Full signal
          list: <a href="https://github.com/smaramwbc/statewave-docs/blob/main/architecture/ranking.md" className="text-accent hover:underline">Ranking &amp; Retrieval →</a>
        </p>
      </Section>
    </>
  )
}
