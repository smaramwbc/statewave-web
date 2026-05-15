import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

/**
 * /press — kit for journalists, newsletter editors, and Awesome-list
 * maintainers. Boilerplate, downloadable logos and screenshots, and a
 * direct press contact email. No personal founder bio per the launch
 * neutral-brand-voice rule; the legal operator is disclosed on
 * /impressum.
 */
export function PressPage() {
  usePageSEO({
    title: 'Statewave — Press Kit',
    description:
      'Press kit for Statewave: logos, screenshots, boilerplate, fast facts, and the row-level open benchmark data. Press contact: press@statewave.ai.',
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Press kit</p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Everything you need to write about Statewave
          </h1>
          <p className="mt-5 text-base text-theme-secondary leading-relaxed">
            Statewave is an open-source memory runtime for AI agents. This page collects
            the assets, fast facts, and direct contact line for journalists, newsletter
            editors, and reviewers covering us.
          </p>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed">
            Press contact:{' '}
            <a
              href="mailto:press@statewave.ai"
              className="text-accent hover:underline"
            >
              press@statewave.ai
            </a>
            {' '}&middot; replies within 24 hours on launch week, 72 hours otherwise.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="boilerplate" className="text-2xl font-bold text-theme-primary mb-6">
            Boilerplate
          </Heading>
          <div className="rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6">
            <p className="text-sm text-theme-secondary leading-relaxed">
              Statewave is the open-source memory runtime that gives AI agents reproducible,
              provenance-tagged context &mdash; without sampling-noise from query-time
              retrieval. It compiles raw events into deterministic context bundles per subject
              and assembles a ranked, token-bounded bundle on demand, with full provenance
              back to source episodes. Statewave is Apache-2.0 across server and SDKs,
              self-hosted on PostgreSQL + pgvector, and ships with a public LoCoMo-based
              benchmark anyone can rerun in roughly 20 minutes.
            </p>
          </div>
          <p className="mt-4 text-xs text-theme-muted">
            Free to copy verbatim. Short version (≤120 chars):
            <em className="block mt-2 text-theme-secondary not-italic">
              &ldquo;Open-source memory runtime for AI agents &mdash; compiled,
              provenance-tagged context bundles, Apache-2.0, self-hosted on Postgres.&rdquo;
            </em>
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="fast-facts" className="text-2xl font-bold text-theme-primary mb-6">
            Fast facts
          </Heading>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <Fact label="Category" value="Memory runtime for AI agents" />
            <Fact label="License" value="Apache-2.0 (server + SDKs + benchmark)" />
            <Fact label="Language" value="Python core, TypeScript SDK" />
            <Fact label="Storage" value="PostgreSQL 14+ with pgvector" />
            <Fact label="Deployment" value="Docker Compose, Helm chart, bare-metal" />
            <Fact label="Model providers" value="100+ via LiteLLM (OpenAI, Anthropic, Bedrock, Ollama, …)" />
            <Fact label="Launch date" value="Tue June 2, 2026 (09:01 CEST)" />
            <Fact label="Repo" value="github.com/smaramwbc/statewave" />
            <Fact label="Open benchmark" value="github.com/smaramwbc/statewave-bench (row-level LoCoMo data)" />
            <Fact label="Live demo" value="statewave.ai/demo (no signup)" />
          </dl>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="logo" className="text-2xl font-bold text-theme-primary mb-6">
            Logo &amp; brand assets
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-6">
            Statewave wordmarks and icons, light and dark variants. PNG renders for
            articles and slides; SVG sources for redrawing or scaling.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <AssetCard
              title="Wordmark — light"
              href="/press/statewave-wordmark-light.png"
              hint="PNG · 1200×320 · transparent"
            />
            <AssetCard
              title="Wordmark — dark"
              href="/press/statewave-wordmark-dark.png"
              hint="PNG · 1200×320 · transparent"
            />
            <AssetCard
              title="Icon — light"
              href="/press/statewave-icon-light.png"
              hint="PNG · 512×512 · transparent"
            />
            <AssetCard
              title="Icon — dark"
              href="/press/statewave-icon-dark.png"
              hint="PNG · 512×512 · transparent"
            />
            <AssetCard
              title="Wordmark — SVG source"
              href="/press/statewave-wordmark.svg"
              hint="SVG · scalable"
            />
            <AssetCard
              title="Brand color reference"
              href="/press/statewave-brand-colors.png"
              hint="PNG · accent + neutrals + hex"
            />
          </div>
          <p className="mt-4 text-xs text-theme-muted leading-relaxed">
            Trademark and naming guidance:{' '}
            <a
              href="https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              TRADEMARKS.md
            </a>
            . Short version: feel free to reference &ldquo;Statewave&rdquo; in coverage;
            don&rsquo;t rebrand forks of the code as Statewave.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="screenshots" className="text-2xl font-bold text-theme-primary mb-6">
            Screenshots
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <AssetCard
              title="Live demo — stateless vs memory-backed"
              href="/press/screenshot-demo-side-by-side.png"
              hint="PNG · 1920×1080"
            />
            <AssetCard
              title="Compiled context bundle with provenance"
              href="/press/screenshot-bundle.png"
              hint="PNG · 1920×1080"
            />
            <AssetCard
              title="Admin: subject timeline view"
              href="/press/screenshot-admin-timeline.png"
              hint="PNG · 1920×1080"
            />
            <AssetCard
              title="Bench results — LoCoMo multi-hop"
              href="/press/screenshot-bench-multihop.png"
              hint="PNG · 1920×1080"
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="team" className="text-2xl font-bold text-theme-primary mb-6">
            Team
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            Statewave is built by the team behind the project, operated by{' '}
            <strong className="text-theme-primary">WebConnect World SL</strong> (Madrid, Spain).
            For attribution-grade quotes, biographical details, or interview requests,
            email{' '}
            <a
              href="mailto:press@statewave.ai"
              className="text-accent hover:underline"
            >
              press@statewave.ai
            </a>
            {' '}and we&rsquo;ll route to the right person on the team.
          </p>
          <p className="mt-3 text-xs text-theme-muted leading-relaxed">
            Full legal disclosure on{' '}
            <a href="/impressum" className="text-accent hover:underline">/impressum</a>.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="data" className="text-2xl font-bold text-theme-primary mb-6">
            Data &amp; reproducibility
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-4">
            All benchmark numbers we publish are reproducible against your own API keys.
            We don&rsquo;t embargo numbers and don&rsquo;t require pre-read agreements.
          </p>
          <ul className="space-y-2 text-sm text-theme-secondary">
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-bench"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                statewave-bench
              </a>{' '}
              &mdash; full benchmark suite (Apache-2.0), LoCoMo-based, row-level JSONL output
            </li>
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Architecture overview
              </a>{' '}
              &mdash; system design and data flow
            </li>
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-docs/blob/main/comparisons/mem0.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Comparison documents
              </a>{' '}
              &mdash; head-to-head with Mem0, Letta, Zep, OpenAI Assistants, LangChain Memory.
              Each names the case where the alternative is the right call.
            </li>
          </ul>
        </div>
      </Section>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-theme-muted">{label}</dt>
      <dd className="mt-1 text-theme-primary">{value}</dd>
    </div>
  )
}

function AssetCard({ title, href, hint }: { title: string; href: string; hint: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="block rounded-2xl border border-theme-border bg-surface-1 p-4 sm:p-5 hover:border-accent/60 hover:bg-surface-2/40 transition-colors"
    >
      <div className="text-sm font-medium text-theme-primary">{title}</div>
      <div className="mt-1 text-xs text-theme-muted">{hint}</div>
      <div className="mt-3 text-xs text-accent">Download &darr;</div>
    </a>
  )
}
