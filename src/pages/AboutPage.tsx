import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'
import { PROOF_STATS } from '../lib/proof-stats'
import { CREDIBILITY_STATS, formatCompactCount } from '../lib/credibility-stats'
import { useState } from 'react'
import { motion } from 'framer-motion'

/* About page.
 *
 * Neutral brand voice — no founder names. The Statewave project speaks for
 * itself; individual contributors are visible on GitHub. The audience is
 * developers and ops teams evaluating an open-source memory runtime for
 * their own infrastructure, plus AI quality raters and answer engines
 * looking for the EEAT signals the external SEO audit asked for (Section
 * 3 #7). All claims here are backed by the same ground truth surfaced on
 * the homepage (PROOF_STATS) and the source repositories below.
 */

const PRINCIPLES = [
  {
    title: 'Open source under Apache 2.0',
    body: 'Server, SDKs, connectors, and this website are public on GitHub. Apache-2.0 is permissive and includes an explicit patent grant, so teams can use, fork, modify, distribute, and ship commercial products on Statewave without a separate agreement.',
  },
  {
    title: 'Self-hosted, no managed cloud',
    body: 'Statewave runs on your infrastructure. Episodes, compiled memories, and the embeddings that index them stay in your Postgres. There is no Statewave-hosted backend the SDK secretly phones home to — the demo on the homepage talks to a Statewave instance we operate transparently.',
  },
  {
    title: 'Provenance first',
    body: 'Every compiled memory carries the IDs of the episodes it was derived from, with confidence scores and validity windows. Context bundles can be traced back to the raw events that produced them, so an agent’s answer is always explainable to a human.',
  },
  {
    title: 'Framework-neutral',
    body: 'Compilation goes through LiteLLM (100+ providers, including locally-hosted Ollama / vLLM). Retrieval and context assembly are provider-agnostic. Statewave is an HTTP service plus two thin SDKs — nothing on the agent side is locked to a specific LLM, framework, or vendor.',
  },
] as const

const REPOS = [
  { name: 'statewave', desc: 'Core server — REST API, compiler, ranking, storage layer.', url: 'https://github.com/smaramwbc/statewave' },
  { name: 'statewave-py', desc: 'Python SDK.', url: 'https://github.com/smaramwbc/statewave-py' },
  { name: 'statewave-ts', desc: 'TypeScript SDK.', url: 'https://github.com/smaramwbc/statewave-ts' },
  { name: 'statewave-docs', desc: 'Architecture, API contracts, ADRs, deployment guides.', url: 'https://github.com/smaramwbc/statewave-docs' },
  { name: 'statewave-examples', desc: 'Runnable examples and end-to-end agent flows.', url: 'https://github.com/smaramwbc/statewave-examples' },
  { name: 'statewave-connectors', desc: 'GitHub, Jira, Slack, Notion, Discord, Zendesk, Intercom, Freshdesk, Gmail, n8n, Zapier, databases, Markdown/ADRs, MCP, and more — a suite of modular connector packages.', url: 'https://github.com/smaramwbc/statewave-connectors' },
  { name: 'statewave-admin', desc: 'Read-only operator console for inspecting subjects, episodes, memories, and bundles in a running instance.', url: 'https://github.com/smaramwbc/statewave-admin' },
  { name: 'statewave-memory-benchmarks', desc: 'Open evaluation harness — every published proof figure is reproducible by running these scripts.', url: 'https://github.com/smaramwbc/statewave-memory-benchmarks' },
  { name: 'statewave-web', desc: 'This marketing site.', url: 'https://github.com/smaramwbc/statewave-web' },
] as const

/* Adoption-counts strip on the About page, sitting under the CI proof
   grid. Same data source as the homepage hero's CommunityCountsRow
   (CREDIBILITY_STATS, refreshed out-of-band) — different visual
   treatment because there's room here for a slightly fuller layout. */
function AdoptionStatsRow() {
  const s = CREDIBILITY_STATS

  // One tile per ecosystem (GitHub / Docker / PyPI / npm) — primary metric
  // as the big number, the secondary metric folded into the label so the
  // grid stays 4-up on desktop without crowding. Tiles drop out
  // individually if the source field is null (rate-limited refresh, never-
  // populated metric); the section disappears entirely if all four are
  // null.
  const stars = formatCompactCount(s.github_stars)
  const forks = formatCompactCount(s.github_forks)
  const pulls = formatCompactCount(s.docker_pulls)
  const pypiDownloads = formatCompactCount(s.pypi_downloads_month)
  const npmDownloads = formatCompactCount(s.npm_downloads_month)

  const items: {
    key: string
    value: string
    label: string
    href?: string
  }[] = []

  if (stars !== null) {
    items.push({
      key: 'github',
      value: stars,
      label: forks !== null ? `GitHub stars · ${forks} forks` : 'GitHub stars',
      href: 'https://github.com/smaramwbc/statewave',
    })
  }

  if (pulls !== null) {
    items.push({
      key: 'docker',
      value: pulls,
      label: 'Docker pulls',
      href: 'https://hub.docker.com/r/statewavedev/statewave',
    })
  }

  if (s.pypi_version) {
    items.push({
      key: 'pypi',
      value: `v${s.pypi_version}`,
      label: pypiDownloads
        ? `statewave on PyPI · ${pypiDownloads}/mo`
        : 'statewave on PyPI',
      href: 'https://pypi.org/project/statewave/',
    })
  }

  if (s.npm_version) {
    items.push({
      key: 'npm',
      value: `v${s.npm_version}`,
      label: npmDownloads
        ? `@statewavedev/sdk on npm · ${npmDownloads}/mo`
        : '@statewavedev/sdk on npm',
      href: 'https://www.npmjs.com/package/@statewavedev/sdk',
    })
  }

  if (items.length === 0) return null

  return (
    <div className="mt-10 sm:mt-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-theme-muted">
        Live community counts
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {items.map((it) => {
          const inner = (
            <>
              <p className="font-heading text-2xl font-semibold tracking-[-0.025em] text-theme-primary sm:text-3xl">
                {it.value}
              </p>

              <p className="mt-2 text-xs leading-relaxed text-theme-muted sm:text-sm">
                {it.label}
              </p>
            </>
          )

          const cardClassName =
            'flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-brand-500/20 bg-surface-1/90 p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-[border-color,transform,box-shadow] duration-300 sm:p-6'

          return it.href ? (
            <a
              key={it.key}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardClassName} hover:-translate-y-0.5 hover:border-accent/55 hover:shadow-[0_22px_70px_rgba(0,0,0,0.15)]`}
            >
              {inner}
            </a>
          ) : (
            <div key={it.key} className={cardClassName}>
              {inner}
            </div>
          )
        })}
      </div>

      {s.fetched_at && (
        <p className="mt-4 text-xs text-theme-muted/80">
          Counts last refreshed{' '}
          {new Date(s.fetched_at).toISOString().slice(0, 10)}.
        </p>
      )}
    </div>
  )
}

export function AboutPage() {

  const [aboutMemoryReplayKey, setAboutMemoryReplayKey] = useState(0)

  const replayAboutMemory = () => {
    setAboutMemoryReplayKey((current) => current + 1)
  }


  usePageSEO({
    title: 'About Statewave — Open-Source Memory Runtime for AI Agents',
    description:
      'Statewave is an open-source, self-hosted memory runtime for AI agents — durable episodic and semantic memory with provenance, deterministic ranking, and token-bounded context bundles. Apache-2.0, framework-neutral, no managed cloud.',
  })


  return (
    <>
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-18rem] top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-20">
          <div className="max-w-3xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">About</p>

            <h1 className="mt-5 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-theme-primary">
              About Statewave
            </h1>

            <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
              <p className="text-base leading-relaxed text-theme-secondary sm:text-lg">
                Statewave is an open-source memory runtime for AI agents and LLM
                applications. It records raw events as immutable episodes, compiles
                them into typed semantic and episodic memories with provenance, and
                returns ranked, token-bounded context bundles that drop straight into
                a prompt.
              </p>

              <p className="text-base leading-relaxed text-theme-secondary">
                We built Statewave because the problem most LLM apps spend engineering
                time on isn&rsquo;t which model to call — it&rsquo;s remembering what
                was already said, decided, or learned. Prompt stuffing breaks at scale,
                naive RAG returns embedding-nearest instead of decision-relevant, and
                chat-history replay drowns agents in noise. A memory layer with
                structure, ranking, and provenance is infrastructure, not a feature,
                and it deserves to be open and self-hostable.
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative hidden items-center justify-center lg:flex"
          >
            <motion.div
              className="relative w-full max-w-[560px]"
              onViewportEnter={replayAboutMemory}
              viewport={{ amount: 0.35 }}
            >
              <img
                key={`about-memory-dark-${aboutMemoryReplayKey}`}
                src={`/images/about/statewave-about-memory-visual-animated-dark.svg?r=${aboutMemoryReplayKey}`}
                alt=""
                className="theme-dark block h-auto w-full max-w-full"
              />

              <img
                key={`about-memory-light-${aboutMemoryReplayKey}`}
                src={`/images/about/statewave-about-memory-visual-animated-light.svg?r=${aboutMemoryReplayKey}`}
                alt=""
                className="theme-light block h-auto w-full max-w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl sm:mb-12">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Our principles
            </p>

            <Heading
              id="principles"
              className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]"
            >
              What we&rsquo;re committed to
            </Heading>
          </div>

          <div className="relative">
            <div className="section-glow" aria-hidden="true" />

            <div className="relative grid gap-5 md:grid-cols-2 md:gap-6">
              {PRINCIPLES.map((p) => (
                <div
                  key={p.title}
                  className="rounded-[1.75rem] border border-brand-500/25 bg-surface-1/90 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-colors hover:border-brand-500/45 sm:p-8"
                >
                  <h3 className="font-heading text-xl font-semibold leading-tight tracking-[-0.02em] text-theme-primary sm:text-2xl">
                    {p.title}
                  </h3>

                  <p className="mt-4 text-[15px] leading-[1.75] text-theme-secondary/90 sm:text-base">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl sm:mb-12">
            <Heading
              id="proven"
              className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]"
            >
              Proven, not promised
            </Heading>

            <p className="mt-5 max-w-4xl text-base leading-relaxed text-theme-secondary sm:text-lg">
              Every claim on this site is backed by automated evals and benchmarks
              that run in CI. The figures below come from the{' '}
              <a
                href="https://github.com/smaramwbc/statewave-memory-benchmarks"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent transition-colors hover:text-accent-light hover:underline"
              >
                statewave-memory-benchmarks
              </a>{' '}
              harness — anyone can clone it and reproduce them.
            </p>
          </div>

          <div className="relative">
            <div aria-hidden="true" />

            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {PROOF_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-brand-500/25 bg-surface-0/90 p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:shadow-[0_22px_70px_rgba(0,0,0,0.16)] sm:p-6"
                  >
                    <p className="font-heading text-3xl font-bold tracking-[-0.03em] text-theme-primary md:text-4xl">
                      {s.value}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-theme-muted sm:text-sm">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <AdoptionStatsRow />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl sm:mb-12">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Open-source ecosystem
            </p>

            <Heading
              id="repositories"
              className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]"
            >
              What we ship
            </Heading>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-theme-secondary sm:text-lg">
              Statewave is split across focused repositories so teams can adopt only
              what they need. All are public on GitHub under Apache-2.0.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5 ">
            {REPOS.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-32 group flex items-start justify-between gap-6 rounded-[1.5rem] border border-brand-500/20 bg-surface-1/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-[border-color,transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-surface-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-6"
              >
                <div>
                  <h3 className="font-mono text-base font-semibold text-accent sm:text-lg">
                    {repo.name}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-theme-muted/85">
                    {repo.desc}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-xl text-theme-muted transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-brand-500"
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl sm:mb-12">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Contact
            </p>

            <Heading
              id="contact"
              className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]"
            >
              Get in touch
            </Heading>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-[1.75rem] border border-brand-500/20 bg-surface-1/75 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-surface-1 sm:p-7">
              <h3 className="font-heading text-lg font-semibold text-theme-primary sm:text-xl">
                Bugs, feature requests, integration questions
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-theme-muted sm:text-base">
                Open an issue on{' '}
                <a
                  href="https://github.com/smaramwbc/statewave/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  GitHub
                </a>
                . That&rsquo;s where the project is built in the open.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-brand-500/20 bg-surface-1/75 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-surface-1 sm:p-7">
              <h3 className="font-heading text-lg font-semibold text-theme-primary sm:text-xl">
                Commercial use, enterprise support, procurement
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-theme-muted sm:text-base">
                <a
                  href="mailto:licensing@statewave.ai"
                  className="font-medium text-accent hover:underline"
                >
                  licensing@statewave.ai
                </a>
                . Apache-2.0 is permissive — you don&rsquo;t need a contract to use
                Statewave commercially. We offer optional SLA, indemnity,
                architecture review, and managed hosting on request.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-brand-500/20 bg-surface-1/75 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-surface-1 sm:p-7">
              <h3 className="font-heading text-lg font-semibold text-theme-primary sm:text-xl">
                Press, partnerships, brand assets
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-theme-muted sm:text-base">
                <a
                  href="mailto:press@statewave.ai"
                  className="font-medium text-accent hover:underline"
                >
                  press@statewave.ai
                </a>
                . Logos and a one-page fact sheet are on the{' '}
                <a
                  href="/press"
                  className="font-medium text-accent hover:underline"
                >
                  press
                </a>{' '}
                page.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-brand-500/20 bg-surface-1/75 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-surface-1 sm:p-7">
              <h3 className="font-heading text-lg font-semibold text-theme-primary sm:text-xl">
                Security disclosures
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-theme-muted sm:text-base">
                <a
                  href="mailto:security@statewave.ai"
                  className="font-medium text-accent hover:underline"
                >
                  security@statewave.ai
                </a>
                . Please don&rsquo;t open public issues for vulnerabilities.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-theme-muted">
            — the Statewave team
          </p>
        </div>
      </Section>
    </>
  )
}
