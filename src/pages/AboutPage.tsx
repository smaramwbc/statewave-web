import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'
import { PROOF_STATS } from '../lib/proof-stats'
import { CREDIBILITY_STATS, formatCompactCount } from '../lib/credibility-stats'

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
  { name: 'statewave-connectors', desc: 'GitHub, Markdown/ADRs, MCP, Slack, Discord, Zendesk, Intercom, Freshdesk, Notion, Gmail, n8n, Zapier connectors.', url: 'https://github.com/smaramwbc/statewave-connectors' },
  { name: 'statewave-admin', desc: 'Read-only operator console for inspecting subjects, episodes, memories, and bundles in a running instance.', url: 'https://github.com/smaramwbc/statewave-admin' },
  { name: 'statewave-bench', desc: 'Open evaluation harness — every published proof figure is reproducible by running these scripts.', url: 'https://github.com/smaramwbc/statewave-bench' },
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
  const items: { key: string; value: string; label: string; href?: string }[] = []
  if (stars !== null) {
    items.push({
      key: 'github',
      value: `${stars}`,
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
        ? '@statewavedev/sdk on npm · ' + npmDownloads + '/mo'
        : '@statewavedev/sdk on npm',
      href: 'https://www.npmjs.com/package/@statewavedev/sdk',
    })
  }
  if (items.length === 0) return null
  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-[0.18em] text-theme-muted mb-3">
        Live community counts
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => {
          const inner = (
            <>
              <p className="text-xl md:text-2xl font-semibold text-theme-primary">
                {it.value}
              </p>
              <p className="mt-1 text-xs text-theme-muted">{it.label}</p>
            </>
          )
          return it.href ? (
            <a
              key={it.key}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center rounded-2xl border border-theme-border bg-surface-1 p-4 hover:border-accent/40 transition-colors"
            >
              {inner}
            </a>
          ) : (
            <div
              key={it.key}
              className="text-center rounded-2xl border border-theme-border bg-surface-1 p-4"
            >
              {inner}
            </div>
          )
        })}
      </div>
      {s.fetched_at && (
        <p className="mt-3 text-[11px] text-theme-muted/80">
          Counts last refreshed {new Date(s.fetched_at).toISOString().slice(0, 10)}.
        </p>
      )}
    </div>
  )
}

export function AboutPage() {
  usePageSEO({
    title: 'About Statewave — Open-Source Memory Runtime for AI Agents',
    description:
      'Statewave is an open-source, self-hosted memory runtime for AI agents — durable episodic and semantic memory with provenance, deterministic ranking, and token-bounded context bundles. Apache-2.0, framework-neutral, no managed cloud.',
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            About
          </p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            About Statewave
          </h1>
          <p className="mt-6 text-base sm:text-lg text-theme-secondary leading-relaxed">
            Statewave is an open-source memory runtime for AI agents and LLM
            applications. It records raw events as immutable episodes,
            compiles them into typed semantic and episodic memories with
            provenance, and returns ranked, token-bounded context bundles
            that drop straight into a prompt.
          </p>
          <p className="mt-4 text-base text-theme-secondary leading-relaxed">
            We built Statewave because the problem most LLM apps spend
            engineering time on isn&rsquo;t which model to call — it&rsquo;s
            remembering what was already said, decided, or learned. Prompt
            stuffing breaks at scale, naive RAG returns embedding-nearest
            instead of decision-relevant, and chat-history replay drowns
            agents in noise. A memory layer with structure, ranking, and
            provenance is infrastructure, not a feature, and it deserves to
            be open and self-hostable.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading
            id="principles"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            What we&rsquo;re committed to
          </Heading>
          <ul className="space-y-6">
            {PRINCIPLES.map((p) => (
              <li
                key={p.title}
                className="rounded-2xl border border-theme-border bg-surface-1 p-6"
              >
                <h3 className="text-base font-semibold text-theme-primary">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <div className="mx-auto max-w-3xl">
          <Heading
            id="proven"
            className="text-2xl font-bold text-theme-primary mb-3"
          >
            Proven, not promised
          </Heading>
          <p className="text-sm text-theme-muted leading-relaxed mb-6">
            Every claim on this site is backed by automated evals and
            benchmarks that run in CI. The figures below come from the
            <a
              href="https://github.com/smaramwbc/statewave-bench"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >{' '}
              statewave-bench
            </a>{' '}
            harness — anyone can clone it and reproduce them.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROOF_STATS.map((s) => (
              <div
                key={s.label}
                className="text-center rounded-2xl border border-theme-border bg-surface-0 p-5"
              >
                <p className="text-2xl md:text-3xl font-bold text-theme-primary">
                  {s.value}
                </p>
                <p className="mt-2 text-xs text-theme-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <AdoptionStatsRow />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading
            id="repos"
            className="text-2xl font-bold text-theme-primary mb-3"
          >
            What we ship
          </Heading>
          <p className="text-sm text-theme-muted leading-relaxed mb-6">
            Statewave is split across focused repositories so teams can
            adopt only what they need. All are public on GitHub under
            Apache-2.0.
          </p>
          <ul className="space-y-3">
            {REPOS.map((r) => (
              <li
                key={r.name}
                className="rounded-xl border border-theme-border bg-surface-1 p-4"
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono font-semibold text-accent hover:underline"
                >
                  {r.name}
                </a>
                <p className="mt-1 text-sm text-theme-muted leading-relaxed">
                  {r.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading
            id="contact"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Get in touch
          </Heading>
          <ul className="space-y-3 text-sm text-theme-secondary">
            <li>
              <span className="font-semibold text-theme-primary">
                Bugs, feature requests, integration questions:
              </span>{' '}
              open an issue on{' '}
              <a
                href="https://github.com/smaramwbc/statewave/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub
              </a>
              . That&rsquo;s where the project is built in the open.
            </li>
            <li>
              <span className="font-semibold text-theme-primary">
                Commercial use, enterprise support, procurement:
              </span>{' '}
              <a
                href="mailto:licensing@statewave.ai"
                className="text-accent hover:underline"
              >
                licensing@statewave.ai
              </a>
              . Apache-2.0 is permissive — you don&rsquo;t need a contract
              to use Statewave commercially. We offer optional SLA,
              indemnity, architecture review, and managed hosting on
              request.
            </li>
            <li>
              <span className="font-semibold text-theme-primary">
                Press, partnerships, brand assets:
              </span>{' '}
              <a
                href="mailto:press@statewave.ai"
                className="text-accent hover:underline"
              >
                press@statewave.ai
              </a>
              . Logos and a one-page fact sheet are on the{' '}
              <a href="/press" className="text-accent hover:underline">
                press
              </a>{' '}
              page.
            </li>
            <li>
              <span className="font-semibold text-theme-primary">
                Security disclosures:
              </span>{' '}
              <a
                href="mailto:security@statewave.ai"
                className="text-accent hover:underline"
              >
                security@statewave.ai
              </a>
              . Please don&rsquo;t open public issues for vulnerabilities.
            </li>
          </ul>
          <p className="mt-8 text-xs text-theme-muted">
            — the Statewave team
          </p>
        </div>
      </Section>
    </>
  )
}
