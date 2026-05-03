import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context'

export function DevelopersPage() {
  usePageSEO()
  const { openWidget } = useChatWidget()
  const liveDemoRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(liveDemoRef)
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
              Start building
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-theme-muted max-w-2xl leading-[1.65] sm:leading-[1.7]">
              Everything you need to integrate Statewave into your AI application.
              Running locally in under 2 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Getting Started',
              desc: 'Clone, run, ingest your first episode in under 10 minutes.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md',
              tag: 'Guide',
            },
            {
              title: 'API v1 Contract',
              desc: 'Full endpoint reference with examples, scoring model, and webhook specs.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md',
              tag: 'Reference',
            },
            {
              title: 'Python SDK',
              desc: 'Sync + async clients, Pydantic models, retry with backoff. pip install statewave-py.',
              href: 'https://github.com/smaramwbc/statewave-py',
              tag: 'SDK',
            },
            {
              title: 'TypeScript SDK',
              desc: 'Fetch-based client with full type definitions. npm install statewave-ts.',
              href: 'https://github.com/smaramwbc/statewave-ts',
              tag: 'SDK',
            },
            {
              title: 'Examples',
              desc: 'Quickstart, support agent, coding agent, LLM loop, eval suite, benchmarks.',
              href: 'https://github.com/smaramwbc/statewave-examples',
              tag: 'Examples',
            },
            {
              title: 'Use Cases',
              desc: 'A categorized map of what you can build — support, coding, workspace, account, voice, multi-agent, plus connector patterns and frontier ideas.',
              to: '/use-cases',
              tag: 'Inspiration',
            },
            {
              title: 'Live Demo',
              desc: 'Two identical agents — one with memory, one without. See the difference in 10 seconds.',
              onClick: () => openWidget(),
              tag: 'Demo',
            },
            {
              title: 'Architecture Overview',
              desc: 'System design, component architecture, middleware stack, compilation pipeline.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md',
              tag: 'Docs',
            },
            {
              title: 'Deployment Guide',
              desc: 'Docker Compose, Fly.io, Railway. Production configuration and health checks.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md',
              tag: 'Ops',
            },
            {
              title: 'GitHub Repository',
              desc: 'Source code, issues, discussions. AGPL-3.0 licensed.',
              href: 'https://github.com/smaramwbc/statewave',
              tag: 'Source',
            },
          ].map((item, i) => {
            const cardClass = 'block w-full text-left p-6 rounded-2xl border border-theme-border bg-surface-1 hover:border-accent/20 transition-colors group'
            const motionProps = {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: i * 0.05 },
              whileHover: { y: -4 },
            } as const
            const inner = (
              <>
                <span className="text-[10px] font-medium uppercase tracking-wider text-accent">{item.tag}</span>
                <h3 className="text-base font-semibold text-theme-primary mt-2 mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{item.desc}</p>
              </>
            )
            if ('onClick' in item && item.onClick) {
              return (
                <motion.button
                  key={i}
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
                <motion.div key={i} {...motionProps}>
                  <Link to={item.to} className={cardClass}>
                    {inner}
                  </Link>
                </motion.div>
              )
            }
            return (
              <motion.a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                {...motionProps}
                className={cardClass}
              >
                {inner}
              </motion.a>
            )
          })}
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <div className="text-center">
          <Heading id="quick-install" className="text-2xl font-bold text-theme-primary mb-4">Quick install</Heading>
          <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-xl border border-theme-border bg-surface-2 p-6 text-left">
              <p className="text-xs text-theme-muted font-mono mb-3">Python</p>
              <code className="text-sm text-theme-secondary">pip install statewave-py</code>
            </div>
            <div className="rounded-xl border border-theme-border bg-surface-2 p-6 text-left">
              <p className="text-xs text-theme-muted font-mono mb-3">TypeScript</p>
              <code className="text-sm text-theme-secondary">npm install statewave-ts</code>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" size="lg">
              Read the Guide
            </Button>
            <Button href="https://github.com/smaramwbc/statewave" variant="secondary" size="lg">
              View Source
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
