import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Card } from '../components/Card'
import { Heading } from '../components/Heading'
import { HowStatewaveWorks } from '../components/HowStatewaveWorks'
import { usePageSEO } from '../lib/seo'
import { useCallback, useState } from "react";


export function ProductPage() {
  usePageSEO()

  const [replayKey, setReplayKey] = useState(0);

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  return (
    <>
      <div className="relative">
        <div aria-hidden="true" className="page-hero-glow" />

        <section className="relative z-10 pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
                HOW IT WORKS
              </div>

              <h1 className="font-heading text-[clamp(2.5rem,5.5vw,4rem)] font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary">
                How Statewave works
              </h1>

              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-theme-secondary">
                A clear data lifecycle: record raw events, compile durable memories,
                retrieve ranked context, govern with provenance and deletion.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="relative z-10 mx-auto mt-2 sm:mt-4 md:mt-6 max-w-7xl px-5 sm:px-6 pb-28 sm:pb-32 md:pb-40">
          <HowStatewaveWorks
            variant="full"
            id="how-it-works"
            showHeader={false}
          />
        </div>
      </div>

      <Section className="bg-surface-1">
        {/* Section header */}
        <div className="max-w-3xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            MEMORY LIFECYCLE
          </div>

          <Heading
            id="core-loop"
            className="font-heading text-4xl font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary md:text-[52px]"
          >
            The core loop
          </Heading>

          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-theme-secondary">
            Every interaction follows the same deterministic lifecycle: record,
            compile, retrieve and govern. Statewave transforms raw events into
            durable, structured memory ready for production AI agents.
          </p>
        </div>

        {/* Diagram + cards */}
        <div className="mt-14 grid gap-14 items-start lg:grid-cols-[0.42fr_0.58fr]">
          {/* Memory lifecycle diagram */}
          <motion.div
            className="flex justify-center lg:justify-start lg:pt-10"
            onViewportEnter={replay}
            viewport={{ amount: 0.35 }}
          >
            <div className="relative w-full max-w-[680px] lg:max-w-none">
              <div
                aria-hidden="true"
                className="theme-dark pointer-events-none absolute left-1/2 top-1/2 z-0 h-[560px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(74,140,255,0.22)_0%,rgba(90,112,255,0.12)_34%,rgba(122,92,255,0.07)_56%,transparent_80%)] blur-[40px]"
              />

              <img
                key={`lifecycle-dark-${replayKey}`}
                src={`/images/product/memory-lifecycle-dark.svg?r=${replayKey}`}
                alt="Memory lifecycle: Record, Compile, Context, Govern"
                className="theme-dark relative z-10 h-auto w-full select-none"
                draggable={false}
              />

              <img
                key={`lifecycle-light-${replayKey}`}
                src={`/images/product/memory-lifecycle-light.svg?r=${replayKey}`}
                alt=""
                aria-hidden="true"
                className="theme-light relative z-10 h-auto w-full select-none"
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Lifecycle cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                step: '01',
                title: 'Record',
                desc: 'Immutable episodes capture raw interaction truth — conversations, tool calls, decisions. Append-only, never mutated.',
              },
              {
                step: '02',
                title: 'Compile',
                desc: 'Pluggable compilers derive typed memories with confidence scores, validity windows, and provenance back to source episodes.',
              },
              {
                step: '03',
                title: 'Context',
                desc: 'Assembly service builds ranked, token-bounded, deterministic context bundles ready for any prompt.',
              },
              {
                step: '04',
                title: 'Govern',
                desc: 'Provenance inspection, subject timelines, GDPR-style deletion, authentication, rate limiting, webhooks.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-2xl border border-brand-500/20 bg-surface-1 p-8"
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-sm font-semibold text-brand-400">
                  {item.step}
                </div>

                <h3 className="text-xl font-semibold text-theme-primary">
                  {item.title}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-theme-secondary">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Heading
          id="domain-model"
          className="mb-10 font-heading text-3xl md:text-4xl font-bold tracking-[-0.02em] text-theme-primary"
        >
          Domain model
        </Heading>

        <div className="grid gap-6 md:grid-cols-3">
          <Card
            title="Episodes"
            description="Immutable raw event records. Conversations, tool calls, decisions, observations. The ground truth that Statewave remembers. Append-only, never mutated."
          />

          <Card
            title="Memories"
            description="Compiled typed facts with confidence scores, validity windows, embeddings, and provenance back to source episodes. Kinds: profile_fact, episode_summary, procedure, artifact_ref."
          />

          <Card
            title="Context Bundles"
            description="Runtime output: ranked, token-bounded, deterministic. Sections for task, facts, procedures, history, episodes. Ready to inject into any LLM prompt."
          />
        </div>
      </Section>

      <Section className="bg-surface-1">
        <Heading
          id="support-native"
          className="mb-10 font-heading text-3xl md:text-4xl font-bold tracking-[-0.02em] text-theme-primary"
        >
          Support-native intelligence
        </Heading>

        <div className="grid gap-6 md:grid-cols-2">
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
        <div className="max-w-3xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            PRIVACY
          </div>
          <Heading
            id="privacy"
            className="font-heading text-3xl md:text-4xl font-bold tracking-[-0.02em] text-theme-primary"
          >
            Privacy &amp; data flow
          </Heading>
          <p className="mt-6 text-[18px] leading-relaxed text-theme-secondary">
            Statewave is honest about what stays local and what leaves your network. Privacy depends on
            the four layers below, not just where Postgres runs.
          </p>
        </div>
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
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                {rows.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-brand-500/15 bg-surface-1 p-5"
                  >
                    <p className="mb-4 text-base font-semibold text-theme-primary break-anywhere">
                      {r.layer}
                    </p>

                    <dl className="space-y-3">
                      <div className="flex items-start gap-4">
                        <dt className="w-24 flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-muted">
                          Runs
                        </dt>

                        <dd className="text-sm leading-relaxed text-theme-secondary break-anywhere">
                          {r.runs}
                        </dd>
                      </div>

                      <div className="flex items-start gap-4">
                        <dt className="w-24 flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-muted">
                          Leaves
                        </dt>

                        <dd className="text-sm leading-relaxed text-theme-secondary break-anywhere">
                          {r.leaves}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="mt-12 hidden overflow-hidden rounded-2xl border border-brand-500/15 bg-surface-1 md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-2/40">
                      <tr className="border-b border-theme-border">
                        <th className="p-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-theme-muted">
                          Layer
                        </th>

                        <th className="p-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-theme-muted">
                          Where it runs
                        </th>

                        <th className="p-5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-theme-muted">
                          What leaves your network
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-theme-secondary">
                      {rows.map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-theme-border/70 last:border-0 transition-colors hover:bg-surface-2/20"
                        >
                          <td className="p-5 font-medium text-theme-primary">
                            {r.layer}
                          </td>

                          <td className="p-5 leading-relaxed">
                            {r.runs}
                          </td>

                          <td className="p-5 leading-relaxed">
                            {r.leaves}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        })()}
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-theme-muted">
          <strong className="text-theme-secondary">Fully local mode:</strong> heuristic compiler + a self-hosted
          embedding model (or text-only retrieval) means no Statewave-driven traffic leaves your network. Any
          additional privacy depends on the LLM <em>your</em> agent calls.
        </p>
      </Section>

      <Section className="bg-surface-1">
        <div className="max-w-4xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            GOVERNANCE
          </div>

          <Heading
            id="audit-governance"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Audit &amp; governance
          </Heading>

          <p className="mt-6 max-w-4xl text-[17px] leading-relaxed text-theme-secondary">
            The v0.8 governance layer &mdash; extended in v0.9 with HMAC-signed
            receipts, receipt replay, detector-suggested labels (opt-in via{' '}
            <code>STATEWAVE_AUTO_LABELING_ENABLED</code>), and per-region residency
            pinning &mdash; lets every context assembly emit an immutable audit
            artifact, and per-memory sensitivity labels feed a declarative policy
            engine that filters memory access by caller identity. Both surfaces are
            designed for compliance review &mdash; not a "trust us" log, but
            addressable records with byte-level integrity hashes that a reviewer can
            verify without trusting the application that wrote them.
          </p>
        </div>

        <div className="mt-12">
          {(() => {
            const rows: Array<{
              feature: string
              what: string
              lever: string
            }> = [
                {
                  feature: 'State-assembly receipts',
                  what:
                    'Immutable, ULID-addressable record of which memories and episodes influenced an assembled context bundle, with a SHA-256 hash of the bytes delivered to the agent. Queryable by id or by subject/time-range with a stable cursor.',
                  lever:
                    'emit_receipt: true per request, or tenant config receipts: always for compliance-grade tenants',
                },
                {
                  feature: 'Per-entry supersession status',
                  what:
                    'Each selected memory carries its active | superseded | tombstoned state, source episodes, and provenance hash. Stale facts, resurrected tombstones, and unresolved conflicts are detectable from the receipt alone.',
                  lever: 'No config — recorded automatically',
                },
                {
                  feature: 'Sensitivity labels',
                  what:
                    'Per-memory capability tags (pii, financial, secret, …) operators set via PATCH /v1/memories/{id}/labels. Stored as a typed TEXT[] column with a GIN index so policy filters run in milliseconds on the hot path.',
                  lever:
                    'Operator-supplied in v0.8; compiler/connector heuristic auto-labeling shipped in v0.9 — advisory `suggested_labels` separate from authoritative `sensitivity_labels`, promotion is an explicit operator action',
                },
                {
                  feature: 'Declarative policy engine',
                  what:
                    'YAML or JSON policy bundles with six predicates (label match, caller_type, caller_id) and two actions (deny, redact). Bundles are content-hashed and immutable. Receipts reference the bundle hash, so "what did policy abc123 say on date Y?" is answerable forever.',
                  lever:
                    'POST /admin/policy/bundles to upload; receipts continue to record decisions even when policy_mode is log_only',
                },
                {
                  feature: 'Log-only vs enforce',
                  what:
                    'log_only (default) records every decision into the receipt without filtering — operators can audit a policy for days before flipping enforce. enforce drops denied memories before ranking and redacts marked ones in place.',
                  lever:
                    'PATCH /admin/tenants/{id}/config { policy_mode: enforce }',
                },
                {
                  feature: 'Mandatory caller identity',
                  what:
                    'caller_id and caller_type on every assembly call feed the policy evaluator. Compliance tenants can flip require_caller_identity: true so anonymous calls return 401 — making policy enforcement non-bypassable.',
                  lever:
                    'PATCH /admin/tenants/{id}/config { require_caller_identity: true }',
                },
              ]

            return (
              <>
                {/* Mobile */}
                <div className="space-y-4 md:hidden">
                  {rows.map((r) => (
                    <article
                      key={r.feature}
                      className="rounded-2xl border border-brand-500/15 bg-surface-1 p-5"
                    >
                      <h3 className="text-base font-semibold text-theme-primary break-anywhere">
                        {r.feature}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-theme-secondary break-anywhere">
                        {r.what}
                      </p>

                      <div className="mt-4 border-t border-theme-border/70 pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-theme-muted">
                          Operator lever
                        </p>

                        <p className="mt-2 font-mono text-[11px] leading-relaxed text-theme-secondary break-anywhere">
                          {r.lever}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden overflow-hidden rounded-2xl border border-brand-500/15 bg-surface-1 md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <thead className="bg-surface-2/40">
                        <tr className="border-b border-theme-border">
                          <th className="w-[22%] p-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
                            Feature
                          </th>

                          <th className="w-[50%] p-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
                            What it does
                          </th>

                          <th className="w-[28%] p-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
                            Operator lever
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((r) => (
                          <tr
                            key={r.feature}
                            className="border-b border-theme-border/70 align-top transition-colors last:border-0 hover:bg-surface-2/20"
                          >
                            <td className="p-5 text-sm font-semibold leading-relaxed text-theme-primary">
                              {r.feature}
                            </td>

                            <td className="p-5 text-[13px] leading-relaxed text-theme-secondary">
                              {r.what}
                            </td>

                            <td className="p-5 font-mono text-[11px] leading-relaxed text-theme-muted break-anywhere">
                              {r.lever}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          })()}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed tracking-[0.01em] text-theme-muted">
          Receipts and labels live alongside the existing provenance + supersession
          primitives — the governance layer was designed to extend the data model
          that was already there, not bolt on a parallel one. Full reference:{' '}
          <a
            className="text-theme-primary underline underline-offset-2 transition-colors hover:text-brand-400"
            href="https://github.com/smaramwbc/statewave-docs/blob/main/receipts.md"
          >
            receipts.md
          </a>{' '}
          and{' '}
          <a
            className="text-theme-primary underline underline-offset-2 transition-colors hover:text-brand-400"
            href="https://github.com/smaramwbc/statewave-docs/blob/main/sensitivity-labels.md"
          >
            sensitivity-labels.md
          </a>
          .
        </p>
      </Section>

      <Section>
        <div className="max-w-4xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            RETRIEVAL
          </div>

          <Heading
            id="scoring-model"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Scoring model
          </Heading>

          <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-theme-secondary">
            Ranking is deterministic and inspectable. Items are sorted by composite score
            and packed into your token budget. Support-agent workloads apply additional session,
            urgency, and repeat-issue signals on top of the core formula below.
          </p>
        </div>

        <div className="mt-12">
          {(() => {
            const rows: Array<{
              signal: string
              range: string
              description: string
            }> = [
                {
                  signal: 'Kind priority',
                  range: '3–10',
                  description:
                    'profile_fact=10, procedure=8, episode_summary=5, raw_episode=3',
                },
                {
                  signal: 'Recency',
                  range: '0–5',
                  description: 'Linear scale: most recent = max',
                },
                {
                  signal: 'Task relevance',
                  range: '0–8',
                  description:
                    'Word overlap (0–5) or cosine similarity (0–8)',
                },
                {
                  signal: 'Temporal validity',
                  range: '-4 to +3',
                  description: 'Currently valid = +3, expired = -4',
                },
              ]

            return (
              <>
                {/* Mobile */}
                <div className="space-y-4 md:hidden">
                  {rows.map((r) => (
                    <article
                      key={r.signal}
                      className="rounded-2xl border border-brand-500/15 bg-surface-1 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-base font-semibold text-theme-primary break-anywhere">
                          {r.signal}
                        </h3>

                        <span className="shrink-0 font-mono text-xs text-theme-secondary">
                          {r.range}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-theme-secondary break-anywhere">
                        {r.description}
                      </p>
                    </article>
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden overflow-hidden rounded-2xl border border-brand-500/15 bg-surface-1 md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <thead className="bg-surface-2/40">
                        <tr className="border-b border-theme-border">
                          <th className="w-[28%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                            Signal
                          </th>

                          <th className="w-[16%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                            Range
                          </th>

                          <th className="w-[56%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                            Description
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((r) => (
                          <tr
                            key={r.signal}
                            className="border-b border-theme-border/70 transition-colors last:border-0 hover:bg-surface-2/20"
                          >
                            <td className="px-5 py-4 text-sm font-semibold text-theme-primary">
                              {r.signal}
                            </td>

                            <td className="px-5 py-4 font-mono text-sm text-theme-secondary">
                              {r.range}
                            </td>

                            <td className="px-5 py-4 text-sm leading-relaxed text-theme-secondary">
                              {r.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          })()}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed tracking-[0.01em] text-theme-muted">
          <strong className="text-theme-secondary">
            Customization today:
          </strong>{' '}
          the weights are fixed. Filter the candidate set (by kind or subject) before retrieval,
          or subclass the assembler in your deployment if you need different defaults.
          Per-call weight overrides are not exposed — we'd rather ship that in response to a
          concrete misranking than speculatively. Full signal list:{' '}
          <a
            href="https://github.com/smaramwbc/statewave-docs/blob/main/architecture/ranking.md"
            className="text-theme-primary underline underline-offset-2 transition-colors hover:text-brand-400"
          >
            Ranking &amp; Retrieval →
          </a>
        </p>
      </Section>
    </>
  )
}
