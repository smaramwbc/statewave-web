import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Button } from '../components/Button'

export function DevelopersPage() {
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
              Start building
            </h1>
            <p className="mt-6 text-lg text-theme-muted max-w-2xl">
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
              title: 'Live Demo',
              desc: 'Two identical agents — one with memory, one without. See the difference in 10 seconds.',
              href: 'https://statewave-demo.vercel.app',
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
          ].map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="block p-6 rounded-2xl border border-theme-border bg-surface-1 hover:border-accent/20 transition-colors group"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-accent">{item.tag}</span>
              <h3 className="text-base font-semibold text-theme-primary mt-2 mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{item.desc}</p>
            </motion.a>
          ))}
        </div>
      </Section>

      <Section className="bg-surface-1/50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">Quick install</h2>
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
