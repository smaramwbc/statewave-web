import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { CopyButton } from '../components/CopyButton'
import { usePageSEO } from '../lib/seo'

// Copy-button text constants — defined here so the rendered prose and the
// copied-to-clipboard string stay in sync, and so journalists copying
// these snippets get a clean plain-text version (no React entities).
const BOILERPLATE_LONG =
  'Statewave is the open-source memory runtime that gives AI agents reproducible, provenance-tagged context — without sampling-noise from query-time retrieval. It compiles raw events into deterministic context bundles per subject and assembles a ranked, token-bounded bundle on demand, with full provenance back to source episodes. Statewave is Apache-2.0 across server and SDKs, self-hosted on PostgreSQL + pgvector, and ships with a public LoCoMo-based benchmark anyone can rerun in roughly 20 minutes.'

const BOILERPLATE_SHORT =
  'Open-source memory runtime for AI agents — compiled, provenance-tagged context bundles, Apache-2.0, self-hosted on Postgres.'

const PRESS_CONTACT = 'press@statewave.ai'

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
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            Press kit
          </p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Everything you need to write about Statewave
          </h1>
          <p className="mt-5 text-base text-theme-secondary leading-relaxed">
            Statewave is an open-source memory runtime for AI agents. This page
            collects the assets, fast facts, and direct contact line for
            journalists, newsletter editors, and reviewers covering us.
          </p>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed">
            Press contact:{" "}
            <a
              href="mailto:press@statewave.ai"
              className="text-accent hover:underline"
            >
              press@statewave.ai
            </a>
            <CopyButton text={PRESS_CONTACT} label="Copy press contact email" />{" "}
            &middot; replies within 24 hours on launch week, 72 hours otherwise.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading
            id="boilerplate"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Boilerplate
          </Heading>
          <div className="relative rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 pr-20 sm:pr-24">
            <div className="absolute top-3 right-3">
              <CopyButton
                text={BOILERPLATE_LONG}
                label="Copy boilerplate paragraph"
                variant="card-corner"
              />
            </div>
            <p className="text-sm text-theme-secondary leading-relaxed">
              Statewave is the open-source memory runtime that gives AI agents
              reproducible, provenance-tagged context &mdash; without
              sampling-noise from query-time retrieval. It compiles raw events
              into deterministic context bundles per subject and assembles a
              ranked, token-bounded bundle on demand, with full provenance back
              to source episodes. Statewave is Apache-2.0 across server and
              SDKs, self-hosted on PostgreSQL + pgvector, and ships with a
              public LoCoMo-based benchmark anyone can rerun in roughly 20
              minutes.
            </p>
          </div>
          <div className="mt-4 text-xs text-theme-muted">
            Free to copy verbatim. Short version (≤120 chars):
            <div className="relative mt-2 rounded-xl border border-theme-border/60 bg-surface-1/40 p-3 pr-12">
              <div className="absolute top-1.5 right-1.5">
                <CopyButton
                  text={BOILERPLATE_SHORT}
                  label="Copy short boilerplate"
                />
              </div>
              <em className="block text-theme-secondary not-italic">
                &ldquo;Open-source memory runtime for AI agents &mdash;
                compiled, provenance-tagged context bundles, Apache-2.0,
                self-hosted on Postgres.&rdquo;
              </em>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading
            id="fast-facts"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Fast facts
          </Heading>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <Fact label="Category" value="Memory runtime for AI agents" />
            <Fact
              label="License"
              value="Apache-2.0 (server + SDKs + benchmark)"
            />
            <Fact label="Language" value="Python core, TypeScript SDK" />
            <Fact label="Storage" value="PostgreSQL 14+ with pgvector" />
            <Fact
              label="Deployment"
              value="Docker Compose, Helm chart, bare-metal"
            />
            <Fact
              label="Model providers"
              value="100+ via LiteLLM (OpenAI, Anthropic, Bedrock, Ollama, …)"
            />
            <Fact label="v1.0 released" value="June 9, 2026" />
            <Fact label="Repo" value="github.com/smaramwbc/statewave" />
            <Fact
              label="Open benchmark"
              value="github.com/smaramwbc/statewave-memory-benchmarks (row-level LoCoMo data)"
            />
            <Fact label="Live demo" value="statewave.ai/demo (no signup)" />
          </dl>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading
            id="logo"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Logo &amp; brand assets
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-6">
            Statewave logos, icons, brand colors, and downloadable assets for
            press, partners, articles, presentations, and media coverage.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <AssetCard
              title="Wordmark — light"
              href="/press/statewave-wordmark-light.png"
              hint="PNG · 1600×600 · transparent"
            />

            <AssetCard
              title="Wordmark — dark"
              href="/press/statewave-wordmark-dark.png"
              hint="PNG · 1600×600 · transparent"
            />

            <AssetCard
              title="Icon"
              href="/press/statewave-icon.png"
              hint="PNG · 1000×1000 · transparent"
            />

            <AssetCard
              title="Wordmark — SVG source"
              href="/press/statewave-wordmark.svg"
              hint="SVG · scalable"
            />

            <AssetCard
              title="Brand color reference"
              href="/press/statewave-brand-colors.png"
              hint="PNG · brand palette + hex values"
            />

            <AssetCard
              title="Complete Brand Kit"
              href="/press/BRAND-ASSETS.zip"
              hint="ZIP · logos, icons, SVG sources and guidelines"
            />
          </div>
          <p className="mt-4 text-xs text-theme-muted leading-relaxed">
            Trademark and naming guidance:{" "}
            <a
              href="https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              TRADEMARKS.md
            </a>
            . Short version: feel free to reference &ldquo;Statewave&rdquo; in
            coverage; don&rsquo;t rebrand forks of the code as Statewave.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading
            id="screenshots"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Screenshots
          </Heading>

          <p className="text-sm text-theme-secondary leading-relaxed mb-6">
            Statewave product screenshots for articles, presentations, media
            coverage, investor materials, and partner documentation.
          </p>

          <AssetCard
            title="Complete Screenshot Pack"
            href="/press/SCREENSHOTS.zip"
            hint="ZIP · high-resolution product screenshots · 1920×1080"
          />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading
            id="team"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Team
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            Statewave is built by the team behind the project, operated by{" "}
            <strong className="text-theme-primary">WebConnect World SL</strong>{" "}
            (Madrid, Spain). For attribution-grade quotes, biographical details,
            or interview requests, email{" "}
            <a
              href="mailto:press@statewave.ai"
              className="text-accent hover:underline"
            >
              press@statewave.ai
            </a>{" "}
            and we&rsquo;ll route to the right person on the team.
          </p>
          <p className="mt-3 text-xs text-theme-muted leading-relaxed">
            Full legal disclosure on{" "}
            <a href="/impressum" className="text-accent hover:underline">
              /impressum
            </a>
            .
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading
            id="data"
            className="text-2xl font-bold text-theme-primary mb-6"
          >
            Data &amp; reproducibility
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-4">
            All benchmark numbers we publish are reproducible against your own
            API keys. We don&rsquo;t embargo numbers and don&rsquo;t require
            pre-read agreements.
          </p>
          <ul className="space-y-2 text-sm text-theme-secondary">
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-memory-benchmarks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                statewave-memory-benchmarks
              </a>{" "}
              &mdash; full benchmark suite (Apache-2.0), LoCoMo-based, row-level
              JSONL output
            </li>
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Architecture overview
              </a>{" "}
              &mdash; system design and data flow
            </li>
            <li>
              <a
                href="https://github.com/smaramwbc/statewave-docs/tree/main/comparisons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Comparison documents
              </a>{" "}
              &mdash; head-to-head with other dedicated memory layers, vector
              stores, and agent-framework memory. Each names the case where the
              alternative is the right call.
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-theme-muted">{label}</dt>
      <dd className="mt-1 text-theme-primary inline-flex items-baseline gap-1">
        <span>{value}</span>
        <CopyButton text={value} label={`Copy ${label.toLowerCase()}`} />
      </dd>
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
