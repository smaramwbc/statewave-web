import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'
import { howToJsonLd } from '../lib/seo-meta'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context-api'
import { HeroInstallCommand } from '../components/HeroInstallCommand'
import {
  Blocks,
  Braces,
  Code2,
  FileCode2,
  FlaskConical,
  ServerCog,
} from 'lucide-react'

export function DevelopersPage() {
  // The install/quickstart HowTo lives here, where the actual steps are
  // shown — not statically in index.html, where it would ride along on every
  // route. Google retired HowTo rich results, but answer engines still read it.
  usePageSEO({ jsonLd: [howToJsonLd()] })
  const { openWidget } = useChatWidget()
  const liveDemoRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(liveDemoRef)
  return (
    <>
      <section className="relative overflow-hidden bg-surface-1 pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-32 lg:pt-36">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_50%_10%,rgba(122,92,255,0.16),transparent_62%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              DEVELOPERS
            </div>

            <h1 className="font-heading text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.045em] text-theme-primary">
              Start building
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-theme-secondary sm:text-xl">
              Everything you need to integrate Statewave into your AI application.
              Running locally in under 2 minutes.
            </p>
          </motion.div>

          <QuickstartLead />
        </div>
      </section>

      <Section>
        <div className="mb-12 max-w-3xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Resources
          </span>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-theme-primary sm:text-4xl lg:text-5xl">
            Everything you need to build with Statewave
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-theme-muted sm:text-lg">
            Documentation, SDKs, examples, architecture and deployment guides.
          </p>
        </div>

        {/* Main resources */}
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Getting Started',
              desc: 'Clone, run, ingest your first episode in about 5 minutes.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md',
              tag: 'Guide',
            },
            {
              title: 'Live Demo',
              desc: 'Two identical agents — one with memory, one without. See the difference in 10 seconds.',
              onClick: () => openWidget(),
              tag: 'Demo',
            },
            {
              title: 'Use Cases',
              desc: 'A categorized map of what you can build — support, coding, workspace, account, voice, multi-agent, connector patterns and frontier ideas.',
              to: '/use-cases',
              tag: 'Inspiration',
            },
          ].map((item, i) => {
            const cardClass =
              'sw-card group relative block min-h-[240px] w-full overflow-hidden rounded-3xl border border-brand-500/20 bg-surface-1/90 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/45 sm:p-8'

            const motionProps = {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: i * 0.06 },
            } as const

            const inner = (
              <div className="flex h-full min-h-[176px] flex-col">
                <span className="w-fit rounded-md bg-brand-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-500">
                  {item.tag}
                </span>

                <h3 className="mt-5 text-xl font-semibold text-theme-primary transition-colors group-hover:text-brand-500">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300/80">
                  {item.desc}
                </p>

              </div>
            )

            if ('onClick' in item && item.onClick) {
              return (
                <motion.button
                  key={item.title}
                  ref={liveDemoRef}
                  type="button"
                  onClick={item.onClick}
                  {...motionProps}
                  className={cardClass}
                >
                  {inner}
                </motion.button>
              )
            }

            if ('to' in item && item.to) {
              return (
                <motion.div
                  key={item.title}
                  {...motionProps}
                  className="h-full"
                >
                  <Link to={item.to} className={cardClass}>
                    {inner}
                  </Link>
                </motion.div>
              )
            }

            if ('href' in item && item.href) {
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...motionProps}
                  className={cardClass}
                >
                  {inner}
                </motion.a>
              )
            }

            return null
          })}
        </div>

        {/* Secondary resources */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {[
            {
              title: 'Python SDK',
              desc: 'Sync + async clients, Pydantic models, retry with backoff. pip install statewave.',
              href: 'https://github.com/smaramwbc/statewave-py',
              tag: 'SDK',
              icon: Code2,
            },
            {
              title: 'TypeScript SDK',
              desc: 'Fetch-based client with full type definitions. npm install @statewavedev/sdk.',
              href: 'https://github.com/smaramwbc/statewave-ts',
              tag: 'SDK',
              icon: Braces,
            },
            {
              title: 'API v1 Contract',
              desc: 'Full endpoint reference with examples, scoring model and webhook specs.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md',
              tag: 'Reference',
              icon: FileCode2,
            },
            {
              title: 'Architecture Overview',
              desc: 'System design, component architecture, middleware stack and compilation pipeline.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md',
              tag: 'Docs',
              icon: Blocks,
            },
            {
              title: 'Deployment Guide',
              desc: 'Docker Compose, Fly.io and Railway. Production configuration and health checks.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md',
              tag: 'Ops',
              icon: ServerCog,
            },
            {
              title: 'Examples',
              desc: 'Quickstart, support agent, coding agent, LLM loop, eval suite and benchmarks.',
              href: 'https://github.com/smaramwbc/statewave-examples',
              tag: 'Examples',
              icon: FlaskConical,
            },
            {
              title: 'GitHub Repository',
              desc: 'Source code, issues and discussions. Apache-2.0 licensed.',
              href: 'https://github.com/smaramwbc/statewave',
              tag: 'Source',
              icon: null,
            },
          ].map((item, i) => {
            const Icon = item.icon

            return (
              <motion.a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`sw-card group flex flex-col rounded-2xl border border-theme-border/80 bg-surface-1/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/35 ${i < 4 ? 'lg:col-span-3' : 'lg:col-span-4'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                    {item.title === 'GitHub Repository' ? (
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient
                            id="github-icon-gradient"
                            x1="0"
                            y1="0"
                            x2="24"
                            y2="24"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor="#00C6FF" />
                            <stop offset="55%" stopColor="#4A8CFF" />
                            <stop offset="100%" stopColor="#7A5CFF" />
                          </linearGradient>
                        </defs>

                        <path
                          fill="url(#github-icon-gradient)"
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                    ) : Icon ? (
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient
                            id={`icon-gradient-${i}`}
                            x1="0"
                            y1="0"
                            x2="24"
                            y2="24"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor="#00C6FF" />
                            <stop offset="55%" stopColor="#4A8CFF" />
                            <stop offset="100%" stopColor="#7A5CFF" />
                          </linearGradient>
                        </defs>

                        <Icon
                          className="h-6 w-6"
                          stroke={`url(#icon-gradient-${i})`}
                          strokeWidth={2}
                        />
                      </svg>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-500/75">
                      {item.tag}
                    </span>

                    <h3 className="mt-2 text-base font-semibold leading-snug text-theme-primary transition-colors group-hover:text-brand-500">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-theme-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </Section>
    </>
  )
}

/* Faithful, condensed render of the real CLI output. Theme-aware: structure
 * uses surface/border/text tokens that flip with [data-theme], and the
 * semantic accents (emerald-600 success, brand-500 links) are chosen to read
 * on both the light and dark surface-1 panel. The window dots stay their
 * literal traffic-light colors (at reduced opacity) in both themes, matching
 * the existing Quick-install terminal. */
function QuickstartTerminal() {
  return (

    <div className="relative min-w-0">
      <div
        className="absolute inset-0 -z-10 scale-95 rounded-[2rem] bg-accent/20 blur-[80px]"
        aria-hidden="true"
      />

      <div className="sw-card relative z-10 overflow-hidden rounded-3xl border border-brand-500/25 bg-surface-1/90 backdrop-blur">
        <div className="flex items-center border-b border-theme-border/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          </div>

          <span className="ml-4 font-mono text-xs text-theme-muted">
            statewave quickstart
          </span>
        </div>

        <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-theme-secondary sm:px-6 sm:py-6">
          <span className="text-theme-muted">
            Which MCP clients should I set up?
          </span>
          {'\n'}  1. Claude Code              <span className="text-emerald-500">✓ detected</span>
          {'\n'}  2. Claude Desktop           <span className="text-emerald-500">✓ detected</span>
          {'\n'}  3. Cursor                   <span className="text-emerald-500">✓ detected</span>
          {'\n'}  4. VS Code (GitHub Copilot) <span className="text-emerald-500">✓ detected</span>
          {'\n'}  5. Codex CLI                <span className="text-emerald-500">✓ detected</span>
          {'\n'}  <span className="text-theme-muted">
            Enter = detected, 'a' = all, 'n' = none:
          </span>{' '}
          <span className="text-brand-500">a</span>
          {'\n\n'}
          <span className="text-theme-muted">
            Optional — an LLM API key sharpens the memory:
          </span>
          {'\n'}  Paste an LLM API key, or press Enter to skip:
          {'\n\n'}Starting Statewave (api + admin + db) via docker compose…
          {'\n'} <span className="text-emerald-500">✔</span> Container statewave-quickstart-db-1     <span className="text-emerald-500">Healthy</span>
          {'\n'} <span className="text-emerald-500">✔</span> Container statewave-quickstart-api-1    <span className="text-emerald-500">Started</span>
          {'\n'} <span className="text-emerald-500">✔</span> Container statewave-quickstart-admin-1  <span className="text-emerald-500">Started</span>
          {'\n'}<span className="text-emerald-500">✓</span> Server healthy at{' '}
          <span className="text-brand-500">http://localhost:8100</span>.
          {'\n\n'}<span className="text-emerald-500">✓</span> Configured Claude Code{' '}
          <span className="text-theme-muted">(server id: statewave)</span>
          {'\n'}<span className="text-emerald-500">✓</span> Configured Cursor · VS Code (Copilot) · Codex CLI
          {'\n\n'}Seeding repo:your-project from this repo…
          {'\n'}<span className="text-emerald-500">✓</span> ingested 139/139 episodes — compiled:{' '}
          <span className="text-emerald-500">yes</span>
          {'\n\n'}<span className="text-theme-muted">Admin console: </span>
          <span className="text-brand-500">http://localhost:8080</span>
        </pre>
      </div>
    </div>
  )
}

function QuickstartLead() {
  return (
    <div className="mt-16 grid items-start gap-12 lg:mt-24 lg:grid-cols-[0.56fr_0.44fr] xl:gap-16">
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-500/75">
          Fastest start
        </span>

        <Heading
          id="one-command"
          className="mt-3 font-heading text-3xl font-bold leading-tight tracking-[-0.025em] text-theme-primary md:text-[42px]"
        >
          Zero to memory in one command
        </Heading>

        <p className="mt-5 max-w-xl text-[17px] leading-7 text-theme-secondary">
          One line boots a local Statewave, wires it into your MCP clients, and
          seeds your repo — self-hosted, offline, no account.
        </p>

        <div className="mt-7 max-w-[620px]">
          <HeroInstallCommand showGuide={false} />
        </div>

        <p className="mt-5 text-xs leading-5 text-theme-muted">
          Tear it down with{" "}
          <span className="font-mono text-theme-secondary">
            npx @statewavedev/statewave --down
          </span>
          .
        </p>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Configures automatically
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "Claude Code",
              "Claude Desktop",
              "Cursor",
              "VS Code Copilot",
              "Codex CLI",
            ].map((client) => (
              <span
                key={client}
                className="inline-flex items-center gap-2 rounded-full border border-theme-border/70 bg-surface-2/70 px-3 py-1.5 text-xs font-medium text-theme-secondary"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500/70" />
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative min-w-0 lg:max-w-[660px] lg:justify-self-end">
        <div
          className="absolute inset-0 -z-10 scale-95 rounded-[2rem] bg-accent/20 blur-[80px]"
          aria-hidden="true"
        />

        <QuickstartTerminal />
      </div>
    </div>
  )
}