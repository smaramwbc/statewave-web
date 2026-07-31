import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { CopyButton } from '../components/CopyButton'
import { usePageSEO } from '../lib/seo'
import { Button } from '../components/Button'

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
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-180px] bottom-0 bg-[radial-gradient(ellipse_at_top,rgba(122,92,255,0.15),transparent_72%)]"
        />

        <div className="relative mx-auto max-w-4xl">
          <p className="section-eyebrow mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Press Kit
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary sm:text-5xl md:text-[56px]">
            Everything you need to write about{" "}
            <span className="text-gradient-brand">Statewave.</span>
          </h1>

          <p className="mt-7 text-[17px] leading-[1.7] text-theme-secondary/90 sm:text-[19px] md:text-[20px]">
            Statewave is an open-source memory runtime for AI agents. This page
            collects the assets, key facts, and direct contact information for
            journalists, newsletter editors, and reviewers covering the project.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm leading-relaxed text-theme-muted">
            <span>Press contact:</span>

            <a
              href="mailto:press@statewave.ai"
              className="font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              press@statewave.ai
            </a>

            <CopyButton
              text={PRESS_CONTACT}
              label="Copy press contact email"
            />

            <span className="text-theme-muted/50">•</span>

            <span>
              Replies within 24 hours during launch week, 72 hours otherwise.
            </span>
          </div>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Media resources
            </p>

            <Heading
              id="boilerplate"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Boilerplate
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              A ready-to-use project description for articles, newsletters, podcasts,
              and product roundups.
            </p>
          </div>

          <div className="relative rounded-[2rem] border border-theme-border bg-surface-2/35 p-7 pr-20 backdrop-blur-sm transition-colors hover:border-theme-border-hover sm:p-8 sm:pr-24">
            <div className="absolute right-4 top-4">
              <CopyButton
                text={BOILERPLATE_LONG}
                label="Copy boilerplate paragraph"
                variant="card-corner"
              />
            </div>

            <p className="text-[16px] leading-[1.8] text-theme-secondary">
              Statewave is the open-source memory runtime that gives AI agents
              reproducible, provenance-tagged context — without sampling-noise from
              query-time retrieval. It compiles raw events into deterministic context
              bundles per subject and assembles a ranked, token-bounded bundle on
              demand, with full provenance back to source episodes. Statewave is
              Apache-2.0 across server and SDKs, self-hosted on PostgreSQL +
              pgvector, and ships with a public LoCoMo-based benchmark anyone can
              rerun in roughly 20 minutes.
            </p>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-theme-muted">
              Short version (≤120 characters)
            </p>

            <div className="relative rounded-2xl border border-theme-border bg-surface-2/20 p-5 pr-14 transition-colors hover:border-theme-border-hover">
              <div className="absolute right-3 top-3">
                <CopyButton
                  text={BOILERPLATE_SHORT}
                  label="Copy short boilerplate"
                />
              </div>

              <p className="pr-2 text-[15px] leading-[1.7] text-theme-secondary">
                “Open-source memory runtime for AI agents — compiled,
                provenance-tagged context bundles, Apache-2.0, self-hosted on
                Postgres.”
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-theme-muted">
              Free to copy verbatim.
            </p>
          </div>
        </div>
      </Section>

      <Section className="relative overflow-hidden bg-surface-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-500/[0.05] blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Project overview
            </p>

            <Heading
              id="fast-facts"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Fast facts
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              The core technical and project details editors and reviewers usually
              need at a glance.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FactCard label="Category" value="Memory runtime for AI agents" />

            <FactCard
              label="License"
              value="Apache-2.0 across the server, SDKs, and benchmark"
            />

            <FactCard
              label="Language"
              value="Python core with a TypeScript SDK"
            />

            <FactCard
              label="Storage"
              value="PostgreSQL 14+ with pgvector"
            />

            <FactCard
              label="Deployment"
              value="Docker Compose, Helm chart, and bare-metal"
            />

            <FactCard
              label="Model providers"
              value="100+ through LiteLLM, including OpenAI, Anthropic, Bedrock, and Ollama"
            />

            <FactCard
              label="v1.0 released"
              value="June 9, 2026"
            />

            <FactCard
              label="Repository"
              value="github.com/smaramwbc/statewave"
            />

            <FactCard
              label="Open benchmark"
              value="github.com/smaramwbc/statewave-memory-benchmarks"
            />

            <FactCard
              label="Live demo"
              value="statewave.ai/demo — no signup required"
            />
          </dl>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Brand resources
            </p>

            <Heading
              id="logo"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Logo &amp; brand assets
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              Official Statewave logos, icons, colors, and source files for press
              coverage, articles, presentations, and partner materials.
            </p>
          </div>

          {/* Logo previews */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-theme-border bg-[#08152d]">
              <div className="flex min-h-[250px] items-center justify-center px-6 py-8 sm:min-h-[300px] sm:px-8">
                <img
                  src="/press/statewave-wordmark-dark.png"
                  alt="Statewave logo for dark backgrounds"
                  className="max-h-60 w-full max-w-[360px] object-contain"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Logo for dark backgrounds
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    PNG · 1600×600 · transparent
                  </p>
                </div>

                <a
                  href="/press/statewave-wordmark-light.png"
                  download
                  className="text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Download ↓
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-theme-border bg-white">
              <div className="flex min-h-[250px] items-center justify-center px-8 py-12 sm:min-h-[300px] sm:px-12">
                <img
                  src="/press/statewave-wordmark-light.png"
                  alt="Statewave logo for light backgrounds"
                  className="max-h-60 w-full max-w-[360px] object-contain"
                />
              </div>

              <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Logo for light backgrounds
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PNG · 1600×600 · transparent
                  </p>
                </div>

                <a
                  href="/press/statewave-wordmark-dark.png"
                  download
                  className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                >
                  Download ↓
                </a>
              </div>
            </div>
          </div>

          {/* Icon and colors */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="flex min-h-[220px] flex-col rounded-[2rem] border border-theme-border bg-surface-2/25 p-6">
              <div className="flex flex-1 items-center justify-center py-6">
                <img
                  src="/press/statewave-icon.png"
                  alt="Statewave icon"
                  className="h-28 w-28 object-contain"
                />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Statewave icon
                  </p>
                  <p className="mt-1 text-xs text-theme-muted">
                    PNG · 1000×1000 · transparent
                  </p>
                </div>

                <a
                  href="/press/statewave-icon.png"
                  download
                  className="text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Download ↓
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-theme-border bg-surface-2/25 p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-sm font-semibold text-theme-primary">
                  Brand colors
                </p>
                <p className="mt-1 text-xs leading-relaxed text-theme-muted">
                  Primary colors used across the Statewave identity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <BrandColor
                  name="Cyan"
                  hex="#00C7FF"
                  className="bg-[#00C7FF]"
                />

                <BrandColor
                  name="Blue"
                  hex="#3B82F6"
                  className="bg-[#3B82F6]"
                />

                <BrandColor
                  name="Indigo"
                  hex="#6366F1"
                  className="bg-[#6366F1]"
                />

                <BrandColor
                  name="Violet"
                  hex="#7C5CFF"
                  className="bg-[#7C5CFF]"
                />
              </div>

              <a
                href="/press/statewave-brand-colors.png"
                download
                className="mt-6 inline-flex text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
              >
                Download full color reference ↓
              </a>
            </div>
          </div>

          {/* Additional files */}
          <div className="mt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
              Additional files
            </p>

            <div className="divide-y divide-theme-border overflow-hidden rounded-2xl border border-theme-border bg-surface-2/20">
              <AssetDownload
                title="Wordmark SVG"
                description="Scalable vector source"
                href="/press/statewave-wordmark.svg"
                fileType="SVG"
              />

              <AssetDownload
                title="Complete brand kit"
                description="Logos, icons, SVG sources, and color reference"
                href="/press/BRAND-ASSETS.zip"
                fileType="ZIP"
              />

              <AssetDownload
                title="Trademark and naming guidance"
                description="Guidance for referencing Statewave in media coverage"
                href="https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md"
                fileType="MD"
                external
              />
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Media assets
            </p>

            <Heading
              id="screenshots"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Product screenshots
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              Official Statewave interface screenshots for articles, presentations,
              reviews, media coverage, and partner documentation.
            </p>
          </div>

          <div className="rounded-[2rem] border border-theme-border bg-surface-2/25 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Overview */}
              <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1">
                <img
                  src="/images/press/screenshots/overview-light.png"
                  alt="Statewave overview interface"
                  className="theme-light aspect-video h-full w-full object-cover"
                />

                <img
                  src="/images/press/screenshots/overview-dark.png"
                  alt="Statewave overview interface"
                  className="theme-dark aspect-video h-full w-full object-cover"
                />
              </div>

              {/* Subjects */}
              <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1">
                <img
                  src="/images/press/screenshots/subjects-light.png"
                  alt="Statewave subjects interface"
                  className="theme-light aspect-video h-full w-full object-cover"
                />

                <img
                  src="/images/press/screenshots/subjects-dark.png"
                  alt="Statewave subjects interface"
                  className="theme-dark aspect-video h-full w-full object-cover"
                />
              </div>

              {/* Diagnostics */}
              <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1">
                <img
                  src="/images/press/screenshots/diagnostics-light.png"
                  alt="Statewave diagnostics interface"
                  className="theme-light aspect-video h-full w-full object-cover"
                />

                <img
                  src="/images/press/screenshots/diagnostics-dark.png"
                  alt="Statewave diagnostics interface"
                  className="theme-dark aspect-video h-full w-full object-cover"
                />
              </div>

            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-theme-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">
                  Complete Screenshot Pack
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-theme-secondary">
                  High-resolution PNG screenshots (1920×1080), ready for articles,
                  presentations, and press coverage.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = "/press/SCREENSHOTS.zip"
                  link.download = "Statewave-Screenshots.zip"
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                Download

                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Contact
            </p>

            <Heading
              id="team"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Team & media contact
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              Statewave is developed by the team at
              <span className="font-semibold text-theme-primary">
                {" "}WebConnect World SL
              </span>
              {" "}in Madrid, Spain. For interviews, quotes, background information,
              or media enquiries, contact our press team and we'll connect you with
              the appropriate person.
            </p>
          </div>

          <div className="rounded-[2rem] border border-theme-border bg-surface-2/25 p-7 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted">
                  Press contact
                </p>

                <a
                  href="mailto:press@statewave.ai"
                  className="mt-2 inline-block text-xl font-semibold text-brand-400 transition-colors hover:text-brand-300"
                >
                  press@statewave.ai
                </a>

                <p className="mt-3 text-sm leading-relaxed text-theme-secondary">
                  Interview requests, press quotes, media kits and partnership
                  enquiries.
                </p>
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  window.location.href = "mailto:press@statewave.ai"
                }}
              >
                Contact us
              </Button>
            </div>

            <div className="mt-8 border-t border-theme-border pt-6 text-sm text-theme-muted">
              Full legal disclosure available on{" "}
              <a
                href="/impressum"
                className="font-medium text-brand-400 hover:text-brand-300"
              >
                /impressum
              </a>
              .
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Open science
            </p>

            <Heading
              id="data"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Data & reproducibility
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              Every benchmark we publish can be reproduced using your own API keys.
              No embargoes, no hidden datasets, and no private evaluation process.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ResourceCard
              title="Benchmark suite"
              description="Apache-2.0 benchmark with LoCoMo-based datasets and row-level JSONL output."
              href="https://github.com/smaramwbc/statewave-memory-benchmarks"
            />

            <ResourceCard
              title="Architecture"
              description="System architecture, execution flow and memory pipeline."
              href="https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md"
            />

            <ResourceCard
              title="Comparisons"
              description="Transparent comparisons against other memory systems and vector stores."
              href="https://github.com/smaramwbc/statewave-docs/tree/main/comparisons"
            />
          </div>
        </div>
      </Section>
    </>
  );
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-[1.5rem] border border-theme-border bg-surface-2/25 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-theme-border-hover"
    >
      <h3 className="text-lg font-semibold text-theme-primary">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-[1.7] text-theme-secondary">
        {description}
      </p>

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-400 group-hover:text-brand-300">
        View resource ↗
      </span>
    </a>
  )
}

function FactCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-theme-border bg-surface-2/30 p-5 transition-colors hover:border-theme-border-hover sm:p-6">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-theme-muted">
        {label}
      </dt>

      <dd className="mt-2 text-[15px] leading-[1.65] text-theme-primary">
        {value}
      </dd>
    </div>
  )
}

function BrandColor({
  name,
  hex,
  className,
}: {
  name: string
  hex: string
  className: string
}) {
  return (
    <div>
      <div className={`h-20 rounded-xl ${className}`} />

      <p className="mt-3 text-xs font-semibold text-theme-primary">
        {name}
      </p>

      <p className="mt-1 font-mono text-[11px] text-theme-muted">
        {hex}
      </p>
    </div>
  )
}

function AssetDownload({
  title,
  description,
  href,
  fileType,
  external = false,
}: {
  title: string
  description: string
  href: string
  fileType: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      download={!external}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-surface-2/40 sm:px-6"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-theme-primary">
          {title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-theme-muted">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="rounded-md border border-theme-border px-2 py-1 font-mono text-[10px] text-theme-muted">
          {fileType}
        </span>

        <span className="text-sm font-medium text-brand-400 transition-transform group-hover:translate-y-0.5">
          {external ? "↗" : "↓"}
        </span>
      </div>
    </a>
  )
}
