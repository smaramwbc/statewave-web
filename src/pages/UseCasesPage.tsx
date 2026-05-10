import { useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { CardAnchor } from '../components/CardAnchor'
import { slugify } from '../lib/slugify'
import { usePageSEO } from '../lib/seo'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context-api'

/* ─── Hash-based active card highlight ───────────────────────────────────── */

function useHashActive(id: string): boolean {
  const { hash } = useLocation()
  return hash === `#${id}`
}

/* ─── Domain types ───────────────────────────────────────────────────────── */

type CategoryId =
  | 'support'
  | 'coding'
  | 'workspace'
  | 'account'
  | 'voice'
  | 'infra'
  | 'domain'

type StatusId = 'strongest' | 'good-fit' | 'connector' | 'future'

interface UseCase {
  title: string
  description: string
  category: CategoryId
  status: StatusId
  tags?: string[]
}

interface Connector {
  title: string
  description: string
  group: 'support' | 'engineering' | 'docs' | 'crm' | 'realtime' | 'events'
  /** When set, this card maps to a real package in the @statewavedev/connectors-* ecosystem. */
  package?: {
    /** 'available' = Phase-1 package shipped; 'planned' = on the connector roadmap. */
    status: 'available' | 'planned'
    /** Optional anchor in /connectors or external doc URL — defaults to /connectors. */
    docHref?: string
  }
}

/* ─── Categories ─────────────────────────────────────────────────────────── */

const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'support', label: 'Support & service', blurb: 'The strongest current wedge — ticket, chat, and incident workflows.' },
  { id: 'coding', label: 'Developer copilots', blurb: 'Repo-aware coding agents and engineering assistants.' },
  { id: 'workspace', label: 'Workspace & knowledge', blurb: 'Cross-source assistants that remember what your team decided.' },
  { id: 'account', label: 'Customer & GTM', blurb: 'Account-aware sales, success, and renewal workflows.' },
  { id: 'voice', label: 'Voice & realtime', blurb: 'Live conversation continuity and multimodal session memory.' },
  { id: 'infra', label: 'Agent infrastructure', blurb: 'Memory primitives for multi-agent and long-running workflows.' },
  { id: 'domain', label: 'Domain-specific', blurb: 'Vertical applications — legal, education, healthcare, ops, hiring.' },
]

const STATUSES: { id: StatusId; label: string; pillClass: string; dotClass: string }[] = [
  {
    id: 'strongest',
    label: 'Strongest today',
    pillClass: 'bg-accent/10 text-accent border-accent/30',
    dotClass: 'bg-accent',
  },
  {
    id: 'good-fit',
    label: 'Good fit now',
    pillClass: 'bg-brand-500/10 text-brand-300 border-brand-500/25',
    dotClass: 'bg-brand-400',
  },
  {
    id: 'connector',
    label: 'Connector / bootstrap',
    pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'future',
    label: 'Frontier idea',
    pillClass: 'bg-surface-3 text-theme-muted border-theme-border',
    dotClass: 'bg-theme-muted',
  },
]

/* ─── Use case inventory ─────────────────────────────────────────────────── */

const USE_CASES: UseCase[] = [
  /* Support & service — primary wedge */
  {
    title: 'Support agent memory',
    description: 'Persistent customer context across sessions — plan, history, prior issues, last resolution. The flagship Statewave workflow.',
    category: 'support', status: 'strongest', tags: ['support', 'multi-tenant'],
  },
  {
    title: 'Escalation handoff packs',
    description: 'Compact, structured briefs with active issue, attempted steps, health, and SLA — ready for tier-2 or human takeover.',
    category: 'support', status: 'strongest', tags: ['support', 'handoff'],
  },
  {
    title: 'Support health & SLA intelligence',
    description: 'Deterministic 0–100 health scores with explainable factors. First-response and resolution SLA tracking with breach detection.',
    category: 'support', status: 'strongest', tags: ['support', 'analytics'],
  },
  {
    title: 'Repeat-issue detection',
    description: 'Surface prior resolutions automatically when recurring patterns appear. Stop re-solving the same ticket.',
    category: 'support', status: 'strongest', tags: ['support'],
  },
  {
    title: 'Multi-tenant support brain',
    description: 'One Statewave instance, isolated subjects per tenant. Each B2B customer gets their own remembered timeline.',
    category: 'support', status: 'good-fit', tags: ['support', 'multi-tenant'],
  },
  {
    title: 'Customer issue timeline assistant',
    description: 'Reconstruct a customer’s full issue history — ranked, deduplicated, provenance-traced — in a single context bundle.',
    category: 'support', status: 'good-fit', tags: ['support'],
  },
  {
    title: 'Resolution playbook miner',
    description: 'Compile recurring fixes into typed procedure memories. Promote the best resolutions back into the agent’s context.',
    category: 'support', status: 'good-fit', tags: ['support', 'knowledge'],
  },
  {
    title: 'Tier-2 → tier-3 escalation copilot',
    description: 'Hand off a ticket up the support tiers with everything that has already been tried, with confidence-scored facts.',
    category: 'support', status: 'good-fit', tags: ['support', 'handoff'],
  },
  {
    title: 'Outage-aware support agent',
    description: 'Cross-reference incident streams with support sessions so the agent knows which tickets are downstream of an outage.',
    category: 'support', status: 'future', tags: ['support', 'realtime'],
  },

  /* Developer copilots */
  {
    title: 'Repo-aware coding assistant',
    description: 'Persist architecture, conventions, and prior reviews per repo. Coding agents stop re-learning the same codebase.',
    category: 'coding', status: 'good-fit', tags: ['coding'],
  },
  {
    title: 'Issue & PR memory',
    description: 'Ingest GitHub issues and PR threads as episodes. Compile decisions, blockers, and review feedback into durable memory.',
    category: 'coding', status: 'good-fit', tags: ['coding', 'connectors'],
  },
  {
    title: 'Architecture decision assistant',
    description: 'Surface prior ADRs, RFC outcomes, and trade-off discussions when the agent reasons about a new system.',
    category: 'coding', status: 'good-fit', tags: ['coding', 'knowledge'],
  },
  {
    title: 'Code review continuity',
    description: 'Remember what each reviewer pushed back on last time. Pre-empt the same review comments before the PR opens.',
    category: 'coding', status: 'good-fit', tags: ['coding'],
  },
  {
    title: 'Engineering onboarding copilot',
    description: 'Compress the team’s tribal knowledge into structured memory so new hires can ask their copilot first.',
    category: 'coding', status: 'good-fit', tags: ['coding', 'workspace'],
  },
  {
    title: 'Bug triage memory',
    description: 'Cluster related bug reports by subject. Carry repro steps, owners, and prior fixes across triage sessions.',
    category: 'coding', status: 'good-fit', tags: ['coding'],
  },
  {
    title: 'Long-running migration agent',
    description: 'A multi-week refactor agent that remembers every file it touched, every decision, every revert.',
    category: 'coding', status: 'future', tags: ['coding', 'infra'],
  },
  {
    title: 'Convention-aware code reviewer',
    description: 'A reviewer agent with persistent memory of team conventions, never re-asking about the same lint rule.',
    category: 'coding', status: 'good-fit', tags: ['coding'],
  },
  {
    title: 'DevRel snippet & example curator',
    description: 'Track which examples developers actually struggle with. Compile into improved docs and copilot snippets.',
    category: 'coding', status: 'good-fit', tags: ['coding', 'knowledge'],
  },

  /* Workspace & knowledge */
  {
    title: 'Cross-source workspace assistant',
    description: 'Docs + tickets + code + chat — one assistant with one memory layer instead of four disconnected RAG indexes.',
    category: 'workspace', status: 'good-fit', tags: ['workspace', 'knowledge'],
  },
  {
    title: 'Decision & meeting memory',
    description: 'Ingest meeting notes and decisions. Compile typed memories — owners, deadlines, dependencies — surfaced when relevant.',
    category: 'workspace', status: 'good-fit', tags: ['workspace'],
  },
  {
    title: 'Long-lived knowledge assistant',
    description: 'A copilot that gets smarter over months, not just within one session — ranked, deduplicated, provenance-traced.',
    category: 'workspace', status: 'good-fit', tags: ['workspace', 'knowledge'],
  },
  {
    title: 'Org-aware research assistant',
    description: 'Combine prior internal research with new web context. Past memos remembered alongside fresh sources.',
    category: 'workspace', status: 'good-fit', tags: ['workspace'],
  },
  {
    title: 'New-hire onboarding memory',
    description: 'Each new hire gets their own subject — questions asked, doc gaps surfaced, follow-ups remembered weeks later.',
    category: 'workspace', status: 'good-fit', tags: ['workspace'],
  },
  {
    title: 'Strategy & OKR memory assistant',
    description: 'Persist the why behind strategy decisions across quarterly cycles. Surface prior trade-offs when revisiting goals.',
    category: 'workspace', status: 'future', tags: ['workspace'],
  },

  /* Customer & GTM */
  {
    title: 'Account-history assistant',
    description: 'Every conversation, ticket, and renewal attached to one account subject. The single source of customer truth.',
    category: 'account', status: 'good-fit', tags: ['account', 'multi-tenant'],
  },
  {
    title: 'Customer-success copilot',
    description: 'Remember adoption signals, blockers, and prior commitments per account. CSMs stop re-reading the whole CRM.',
    category: 'account', status: 'good-fit', tags: ['account'],
  },
  {
    title: 'Sales-to-support handoff',
    description: 'Carry pre-sale promises, integrations discussed, and contractual context into post-sale support sessions.',
    category: 'account', status: 'good-fit', tags: ['account', 'handoff'],
  },
  {
    title: 'Renewal & health workflows',
    description: 'Combine product usage, support load, and CSM notes into a renewal-readiness memory and signal model.',
    category: 'account', status: 'good-fit', tags: ['account', 'analytics'],
  },
  {
    title: 'Champion & contact graph memory',
    description: 'Remember who advocated, who left, who blocks renewals. Carry stakeholder graphs across reps and tools.',
    category: 'account', status: 'good-fit', tags: ['account'],
  },
  {
    title: 'Win/loss memory',
    description: 'Compile structured win/loss reasoning across closed deals. Feed it back to AEs at proposal time.',
    category: 'account', status: 'good-fit', tags: ['account', 'knowledge'],
  },
  {
    title: 'Outreach sequence memory',
    description: 'Remember which messages each prospect already saw and how they reacted — across channels and reps.',
    category: 'account', status: 'good-fit', tags: ['account'],
  },

  /* Voice & realtime */
  {
    title: 'Voice support continuity',
    description: 'Caller hangs up, calls back tomorrow — the voice agent picks up exactly where it left off, with prior issues ranked.',
    category: 'voice', status: 'good-fit', tags: ['voice', 'realtime', 'support'],
  },
  {
    title: 'Call memory & summaries',
    description: 'Ingest call transcripts as episodes. Compile durable summaries with action items, owners, and follow-ups.',
    category: 'voice', status: 'good-fit', tags: ['voice', 'connectors'],
  },
  {
    title: 'Live agent memory',
    description: 'Streaming agent that updates its memory as the session progresses, while keeping context bundles token-bounded.',
    category: 'voice', status: 'good-fit', tags: ['voice', 'realtime'],
  },
  {
    title: 'Multilingual support memory',
    description: 'Capture episodes in any language; the compiled memory is normalized so context retrieval is language-agnostic.',
    category: 'voice', status: 'good-fit', tags: ['voice', 'support'],
  },
  {
    title: 'Multimodal session continuity',
    description: 'Voice + screen-share + text — every modality lands in the same episode log, compiled into one memory.',
    category: 'voice', status: 'future', tags: ['voice', 'realtime'],
  },
  {
    title: 'Wearable & kiosk session memory',
    description: 'Short bursts of interaction with the same person across days and devices, stitched into one durable subject.',
    category: 'voice', status: 'future', tags: ['voice'],
  },

  /* Agent infrastructure */
  {
    title: 'Multi-agent memory router',
    description: 'Several specialized agents share one memory layer — each scoped by subject, none reading raw episodes blindly.',
    category: 'infra', status: 'good-fit', tags: ['infra', 'multi-agent'],
  },
  {
    title: 'Long-running agent state',
    description: 'Agents that run for hours or days persist progress, decisions, and tool outcomes as durable episodes.',
    category: 'infra', status: 'good-fit', tags: ['infra'],
  },
  {
    title: 'Stateful copilot platform',
    description: 'Build a copilot product where every customer’s memory is isolated, deletable, and provenance-traced by default.',
    category: 'infra', status: 'good-fit', tags: ['infra', 'multi-tenant'],
  },
  {
    title: 'Per-tenant memory systems',
    description: 'Ship an AI feature in a B2B product without exposing one tenant’s data to another. Subjects are the boundary.',
    category: 'infra', status: 'good-fit', tags: ['infra', 'multi-tenant'],
  },
  {
    title: 'Agent handoff middleware',
    description: 'Standardize how agents pass work between each other — typed memories instead of free-text dumps.',
    category: 'infra', status: 'good-fit', tags: ['infra', 'handoff'],
  },
  {
    title: 'Memory-as-a-service inside your product',
    description: 'Expose Statewave behind your own API. Your customers get persistent context without ever knowing what powers it.',
    category: 'infra', status: 'good-fit', tags: ['infra'],
  },
  {
    title: 'Multi-step workflow durable state',
    description: 'Replace fragile JSON blobs in a workflow engine with structured, queryable memory tied to the run’s subject.',
    category: 'infra', status: 'good-fit', tags: ['infra'],
  },
  {
    title: 'Planning-execution memory',
    description: 'A planner agent emits steps; executor agents log outcomes back as episodes. The plan adapts from real history.',
    category: 'infra', status: 'future', tags: ['infra', 'multi-agent'],
  },
  {
    title: 'Self-improving feedback memory',
    description: 'Capture user corrections as episodes. Compile them into preference memories that bias future agent behavior.',
    category: 'infra', status: 'future', tags: ['infra'],
  },

  /* Domain-specific */
  {
    title: 'Legal matter memory',
    description: 'A matter is a subject. Filings, calls, and notes become episodes. Compiled facts are provenance-traced for audit.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'Education tutor memory',
    description: 'Track each student’s misunderstandings and progress over months. The tutor never forgets what already clicked.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'Field service technician copilot',
    description: 'Per-asset memory — every visit, repair, and part swap becomes an episode. The next tech walks in informed.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'HR people-ops assistant',
    description: 'Per-employee subjects with policies, requests, and prior answers — surfaced privately and on demand.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'Recruiter pipeline memory',
    description: 'Per-candidate timeline across interviewers, rounds, and feedback. No more re-asking what was already covered.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'Investor relations memory',
    description: 'Conversations, materials shared, and prior questions per investor — surfaced before the next call.',
    category: 'domain', status: 'good-fit', tags: ['domain'],
  },
  {
    title: 'Trading & research analyst memory',
    description: 'Persistent thesis tracking — what was said, when, with what confidence, and what later revised it.',
    category: 'domain', status: 'future', tags: ['domain'],
  },
  {
    title: 'Healthcare patient timeline',
    description: 'A careful, audit-grade application — patient as subject, encounters as episodes, compiled with provenance.',
    category: 'domain', status: 'future', tags: ['domain'],
  },
]

/* ─── Connector inventory (bootstrap patterns) ───────────────────────────── */

const CONNECTOR_GROUPS: { id: Connector['group']; label: string; description: string }[] = [
  { id: 'support', label: 'Support systems', description: 'Backfill ticket history into episodes — bootstrap memory before the first live session.' },
  { id: 'engineering', label: 'Engineering systems', description: 'Ingest issues, PRs, and commits to give coding agents real project memory.' },
  { id: 'docs', label: 'Docs & wikis', description: 'Compile durable knowledge from internal documentation rather than re-embedding it ad hoc.' },
  { id: 'crm', label: 'CRM & customer notes', description: 'Bring account history into a structured per-account memory.' },
  { id: 'realtime', label: 'Voice & transcripts', description: 'Replay calls and meetings as episodes so the next conversation builds on the last.' },
  { id: 'events', label: 'Event streams', description: 'Pipe product activity, incidents, and webhook deliveries into the episode log.' },
]

const CONNECTORS: Connector[] = [
  { title: 'Zendesk ticket import', description: 'Backfill historical tickets and comments as episodes per customer (organization or requester) subject.', group: 'support', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/zendesk/README.md' } },
  { title: 'Intercom conversation import', description: 'Ingest conversations, public replies, and admin notes scoped per customer (primary company or contact). US/EU/AU regions.', group: 'support', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/intercom/README.md' } },
  { title: 'Front inbox connector', description: 'Stream shared-inbox threads and tags into episodes by account.', group: 'support' },
  { title: 'Freshdesk ticket import', description: 'Backfill historical tickets, public replies, and private notes scoped per customer (company or requester). API key auth.', group: 'support', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/freshdesk/README.md' } },
  { title: 'Help Scout import', description: 'One-shot import of historical conversations, then incremental sync going forward.', group: 'support' },
  { title: 'PagerDuty incident connector', description: 'Bring incidents and post-mortems into the episode log so support agents know what broke.', group: 'support' },

  { title: 'GitHub issues + PRs', description: 'Compile decisions, review comments, and resolutions as durable repo memory.', group: 'engineering', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-docs/blob/main/connectors/github.md' } },
  { title: 'GitLab / Bitbucket connector', description: 'Same patterns as GitHub — issue, MR, and pipeline events as episodes.', group: 'engineering' },
  { title: 'Linear / Jira ticket sync', description: 'Per-project subjects with ticket history, owners, and resolutions.', group: 'engineering' },
  { title: 'Sentry / error stream', description: 'Errors and root-cause notes become episodes the coding agent can recall later.', group: 'engineering' },
  { title: 'Datadog / observability events', description: 'Incidents, deploys, and SLOs land in the episode log next to the tickets they caused.', group: 'engineering' },

  { title: 'Notion page ingestion', description: 'Treat Notion pages (and optionally their body content) as decision-memory episodes; re-pull when last_edited_time advances. Subject is operator-controlled — repo:owner/name, project:foo, or any string.', group: 'docs', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/notion/README.md' } },
  { title: 'Confluence ingestion', description: 'Same shape as Notion — treat doc pages as episodes, recompile when pages change. Planned.', group: 'docs' },
  { title: 'Google Docs / Drive connector', description: 'Watch a folder, ingest doc revisions, compile typed memories from changelogs.', group: 'docs' },
  { title: 'Discourse / community forum', description: 'Public Q&A becomes durable knowledge memory available to the support agent.', group: 'docs' },
  { title: 'GitHub markdown docs', description: 'Sync /docs and README content as episodes so the agent always speaks the latest API.', group: 'docs', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-docs/blob/main/connectors/markdown.md' } },

  { title: 'Salesforce / HubSpot CRM', description: 'Account notes, opportunity history, and emails as per-account episodes.', group: 'crm' },
  { title: 'Slack channel + thread import', description: 'Targeted channel imports — internal conversations as searchable episodes per subject.', group: 'crm', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/slack/README.md' } },
  { title: 'Microsoft Teams thread import', description: 'Channel + meeting-chat history per workspace subject.', group: 'crm', package: { status: 'planned', docHref: 'https://github.com/smaramwbc/statewave-docs/blob/main/connectors/index.md' } },
  { title: 'Gmail relationship memory', description: 'Pull messages matching a Gmail search query — per-contact email history scoped to relationship:<email>. Body extracted from MIME (text/plain preferred, text/html fallback). OAuth 2.0 refresh-token; gmail.readonly scope.', group: 'crm', package: { status: 'available', docHref: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/gmail/README.md' } },
  { title: 'Email thread connector (other providers)', description: 'Same shape as Gmail, but for Outlook, Fastmail, ProtonMail. Planned.', group: 'crm' },
  { title: 'Customer.io / Segment activity', description: 'Product activity events streamed in as episodes — usage memory by account.', group: 'crm' },

  { title: 'Gong / Chorus call transcripts', description: 'Sales calls become episodes; compiled memories surface in the next call’s prep.', group: 'realtime' },
  { title: 'Zoom / Meet recording connector', description: 'Meeting transcripts ingested per project or account subject.', group: 'realtime' },
  { title: 'Voice agent realtime stream', description: 'Live voice sessions emit episodes as they happen — context stays current.', group: 'realtime' },
  { title: 'Otter / Fireflies notes connector', description: 'AI meeting notes become structured memory with owners and action items.', group: 'realtime' },

  { title: 'Webhook event-stream replay', description: 'Replay any system’s historical webhooks as episodes to bootstrap memory.', group: 'events' },
  { title: 'Kafka / SQS ingest pipeline', description: 'Stream high-volume product events into episodes with batched compilation.', group: 'events' },
  { title: 'Stripe customer events', description: 'Subscription lifecycle, payment failures, and refunds as account episodes.', group: 'events' },
  { title: 'Postgres CDC ingest', description: 'Treat row changes in your own DB as episodes via change-data-capture.', group: 'events' },
]

/* ─── Frontier ideas ─────────────────────────────────────────────────────── */

const FRONTIER_IDEAS: { title: string; description: string }[] = [
  {
    title: 'Memory portability between AI providers',
    description: 'Move your compiled memory between models or vendors — provenance and validity windows travel with it.',
  },
  {
    title: 'Audit-grade memory for regulated workflows',
    description: 'Provenance-traced facts and immutable episodes as the substrate for compliance-grade AI applications.',
  },
  {
    title: 'Federated memory across orgs',
    description: 'Cross-organization memory protocols where each side keeps storage local but agreed-upon facts can be shared.',
  },
  {
    title: 'Personal memory layer for end-users',
    description: 'Consumer agents that remember you across apps — under your control, deletable, and transparent.',
  },
  {
    title: 'Industry-specific compiled memory packs',
    description: 'Pre-trained compilers and memory schemas for verticals — legal, healthcare, finance, support.',
  },
  {
    title: 'Agent-to-agent memory protocols',
    description: 'A standard handshake for two agents to exchange typed memory, not unstructured prose.',
  },
  {
    title: 'Memory-aware evals across vendors',
    description: 'Evaluate models on the same compiled memory layer — apples-to-apples context quality benchmarks.',
  },
  {
    title: 'Continuous self-improving copilots',
    description: 'Copilots that compile their own mistakes into preference memories and quietly get better each week.',
  },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function statusMeta(id: StatusId) {
  return STATUSES.find((s) => s.id === id)!
}

function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!.label
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function UseCasesPage() {
  usePageSEO()
  return (
    <>
      <HeroSection />
      <MentalModelStrip />
      <StrongestTodaySection />
      <ExplorerSection />
      <ConnectorSection />
      <FrontierSection />
      <CTASection />
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  const total = USE_CASES.length + CONNECTORS.length + FRONTIER_IDEAS.length
  return (
    <section className="relative pt-32 pb-12 overflow-hidden">
      {/* Soft accent glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 0%, rgba(99,102,241,0.08), transparent 70%), radial-gradient(50% 40% at 80% 10%, rgba(96,165,250,0.06), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent/[0.04] text-accent text-[11px] font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/80" />
            {total}+ ideas to build
          </span>
          <h1 className="mt-6 sm:mt-8 text-[clamp(2rem,7vw,3.75rem)] font-bold text-theme-primary tracking-[-0.025em] leading-[1.08] break-anywhere">
            Build with{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              durable memory
            </span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-theme-muted max-w-[40rem] leading-[1.65] sm:leading-[1.7]">
            Statewave is an open-source memory runtime for AI agents. Support agents are the
            strongest workflow today — but the same primitives power coding copilots, account
            assistants, voice continuity, multi-agent platforms, and far more. This page is the
            map.
          </p>

          {/* Quick-jump nav */}
          <div className="mt-8 flex flex-wrap gap-2">
            <JumpChip href="#strongest" label="Strongest today" tone="accent" />
            <JumpChip href="#explorer" label="Use case explorer" />
            <JumpChip href="#connectors" label="Connectors & bootstrap" tone="emerald" />
            <JumpChip href="#frontier" label="Frontier ideas" tone="muted" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function JumpChip({
  href,
  label,
  tone = 'default',
}: {
  href: string
  label: string
  tone?: 'default' | 'accent' | 'emerald' | 'muted'
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-accent/30 bg-accent/[0.06] text-accent hover:bg-accent/10'
      : tone === 'emerald'
        ? 'border-emerald-500/25 bg-emerald-500/[0.05] text-emerald-300 hover:bg-emerald-500/10'
        : tone === 'muted'
          ? 'border-theme-border bg-surface-2 text-theme-muted hover:text-theme-secondary'
          : 'border-theme-border bg-surface-2 text-theme-secondary hover:border-theme-border-hover hover:text-theme-primary'
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${toneClass}`}
    >
      {label}
      <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  )
}

/* ─── Mental model: existing data → episodes → memory → context ──────────── */

function MentalModelStrip() {
  const steps = [
    { label: 'Existing data', desc: 'Tickets, code, docs, calls, events', tone: 'muted' as const },
    { label: 'Episodes', desc: 'Immutable, append-only', tone: 'brand' as const },
    { label: 'Compiled memory', desc: 'Typed facts with provenance', tone: 'accent' as const },
    { label: 'Context bundles', desc: 'Ranked, token-bounded', tone: 'accent' as const },
  ]
  return (
    <Section className="!py-16">
      <div className="rounded-2xl border border-theme-border bg-surface-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="md:max-w-md">
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">The unifying loop</p>
            <Heading id="same-loop" className="mt-2 text-xl md:text-2xl font-semibold text-theme-primary">
              Every use case on this page is the same loop
            </Heading>
            <p className="mt-3 text-sm text-theme-muted leading-relaxed">
              Existing systems become episodes. Episodes compile into typed memory. Memory gets
              ranked into a token-bounded bundle. Your agent gets the context it needs — and
              nothing it doesn’t.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`relative p-4 rounded-xl border ${
                  s.tone === 'accent'
                    ? 'border-accent/25 bg-accent/[0.04]'
                    : s.tone === 'brand'
                      ? 'border-brand-500/25 bg-brand-500/[0.04]'
                      : 'border-theme-border bg-surface-2'
                }`}
              >
                <p
                  className={`text-[10px] font-mono ${
                    s.tone === 'accent' ? 'text-accent' : s.tone === 'brand' ? 'text-brand-300' : 'text-theme-muted'
                  }`}
                >
                  0{i + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-theme-primary">{s.label}</p>
                <p className="mt-1 text-xs text-theme-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Strongest today (preserve the support wedge) ───────────────────────── */

function StrongestTodaySection() {
  const featured = USE_CASES.filter((u) => u.status === 'strongest')
  const navigate = useNavigate()

  const goToComparison = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // The hash is what ScrollToTop reads to jump to the comparison table.
    // Without it the visitor lands at the top of the manifesto hero instead
    // of the section the link advertises.
    navigate(
      { pathname: '/why', hash: '#vs-alternatives' },
      {
        state: {
          returnTo: '/use-cases',
          returnLabel: 'Use Cases',
          returnSection: 'Strongest today',
          returnScrollY: window.scrollY,
        },
      },
    )
  }

  return (
    <Section id="strongest" className="!pt-8 !pb-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Strongest today</p>
          <Heading id="proven-wedge" className="mt-3 text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
            The proven wedge: support agents
          </Heading>
          <p className="mt-4 text-theme-muted leading-relaxed">
            Support is where Statewave is deeply optimized — session-aware ranking, handoff packs,
            health and SLA scoring, repeat-issue detection. It’s the workflow with the most
            evidence today, not the limit of the platform.
          </p>
        </div>
        <a
          href="/why#vs-alternatives"
          onClick={goToComparison}
          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-light transition-colors whitespace-nowrap"
        >
          See the technical comparison
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {featured.map((uc, i) => (
          <FeaturedCard key={uc.title} uc={uc} index={i} />
        ))}
      </div>
    </Section>
  )
}

function FeaturedCard({ uc, index }: { uc: UseCase; index: number }) {
  const meta = statusMeta(uc.status)
  const slug = slugify(uc.title)
  const active = useHashActive(slug)
  return (
    <motion.div
      id={slug}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className={`group relative scroll-mt-24 p-6 md:p-7 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.04] to-transparent ring-1 ring-accent/10 hover:ring-accent/25 transition-all ${
        active ? 'card-anchor-active' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wider ${meta.pillClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-theme-muted">{categoryLabel(uc.category)}</span>
      </div>
      <h3 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-theme-primary">
        <span>{uc.title}</span>
        <CardAnchor id={slug} />
      </h3>
      <p className="mt-2 text-sm text-theme-muted leading-relaxed">{uc.description}</p>
      {uc.tags && uc.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {uc.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-theme-muted bg-surface-2 border border-theme-border">
      {label}
    </span>
  )
}

/* ─── Explorer (filterable grid) ─────────────────────────────────────────── */

type CategoryFilter = CategoryId | 'all'
type StatusFilter = StatusId | 'all'

function ExplorerSection() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const explorerPool = useMemo(() => USE_CASES.filter((u) => u.status !== 'strongest'), [])

  const filtered = useMemo(() => {
    return explorerPool.filter((u) => {
      if (category !== 'all' && u.category !== category) return false
      if (status !== 'all' && u.status !== status) return false
      return true
    })
  }, [explorerPool, category, status])

  const categoryCount = (id: CategoryFilter) =>
    id === 'all' ? explorerPool.length : explorerPool.filter((u) => u.category === id).length

  const statusCount = (id: StatusFilter) =>
    id === 'all' ? explorerPool.length : explorerPool.filter((u) => u.status === id).length

  return (
    <Section id="explorer" className="bg-surface-1/50">
      <div className="max-w-2xl mb-10">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Use case explorer</p>
        <Heading id="beyond-support" className="mt-3 text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Beyond support: what else fits
        </Heading>
        <p className="mt-4 text-theme-muted leading-relaxed">
          The same memory primitives power developer copilots, workspace assistants, account
          intelligence, voice continuity, and multi-agent infrastructure. Filter by category or by
          how production-ready each shape is today.
        </p>
      </div>

      {/* Category filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={category === 'all'}
          onClick={() => setCategory('all')}
          label="All categories"
          count={categoryCount('all')}
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
            label={c.label}
            count={categoryCount(c.id)}
          />
        ))}
      </div>

      {/* Status filter row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-theme-muted mr-1">
          Status
        </span>
        <FilterChip
          active={status === 'all'}
          onClick={() => setStatus('all')}
          label="Any"
          count={statusCount('all')}
          subtle
        />
        {STATUSES.filter((s) => s.id !== 'strongest' && s.id !== 'connector').map((s) => (
          <FilterChip
            key={s.id}
            active={status === s.id}
            onClick={() => setStatus(s.id)}
            label={s.label}
            count={statusCount(s.id)}
            subtle
            statusDotClass={s.dotClass}
          />
        ))}
      </div>

      {/* Active filter description */}
      {category !== 'all' && (
        <p className="mt-6 text-sm text-theme-muted max-w-2xl">
          <span className="text-theme-secondary font-medium">{categoryLabel(category)}.</span>{' '}
          {CATEGORIES.find((c) => c.id === category)!.blurb}
        </p>
      )}

      {/* Grid */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((uc, i) => (
          <UseCaseCard key={uc.title} uc={uc} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center py-16 rounded-2xl border border-dashed border-theme-border bg-surface-2/40">
          <p className="text-sm text-theme-muted">No use cases match this filter combination.</p>
          <button
            type="button"
            onClick={() => {
              setCategory('all')
              setStatus('all')
            }}
            className="mt-3 text-sm text-accent hover:text-accent-light"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="mt-8 text-xs text-theme-muted">
        Showing <span className="text-theme-secondary font-medium">{filtered.length}</span> of{' '}
        {explorerPool.length} ideas
        {category !== 'all' && ` in ${categoryLabel(category)}`}
        {status !== 'all' && ` · ${statusMeta(status as StatusId).label}`}
      </p>
    </Section>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  subtle = false,
  statusDotClass,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  subtle?: boolean
  statusDotClass?: string
}) {
  const base = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all'
  const activeClass = subtle
    ? 'border-theme-border-hover bg-surface-3 text-theme-primary'
    : 'border-accent/30 bg-accent/10 text-accent shadow-sm'
  const idleClass = subtle
    ? 'border-theme-border bg-transparent text-theme-muted hover:text-theme-secondary hover:border-theme-border-hover'
    : 'border-theme-border bg-surface-2 text-theme-secondary hover:text-theme-primary hover:border-theme-border-hover'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeClass : idleClass}`}
      aria-pressed={active}
    >
      {statusDotClass && <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />}
      <span>{label}</span>
      <span
        className={`text-[10px] tabular-nums ${
          active && !subtle ? 'text-accent/80' : 'text-theme-muted'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function UseCaseCard({ uc, index }: { uc: UseCase; index: number }) {
  const meta = statusMeta(uc.status)
  const slug = slugify(uc.title)
  const active = useHashActive(slug)
  return (
    <motion.article
      id={slug}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.4 }}
      whileHover={{ y: -3 }}
      className={`group scroll-mt-24 p-5 rounded-2xl border border-theme-border bg-surface-1 hover:border-accent/25 transition-colors ${
        active ? 'card-anchor-active' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-theme-muted">
          {categoryLabel(uc.category)}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${meta.pillClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
      </div>
      <h3 className="flex items-center gap-2 text-base font-semibold text-theme-primary group-hover:text-accent transition-colors">
        <span>{uc.title}</span>
        <CardAnchor id={slug} />
      </h3>
      <p className="mt-2 text-sm text-theme-muted leading-relaxed">{uc.description}</p>
      {uc.tags && uc.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uc.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}
    </motion.article>
  )
}

/* ─── Connectors / bootstrap patterns ────────────────────────────────────── */

function ConnectorSection() {
  return (
    <Section id="connectors">
      <div className="max-w-2xl mb-8">
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
          Connectors & bootstrap
        </p>
        <Heading id="not-just-live-chats" className="mt-3 text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Statewave is not just for live chats
        </Heading>
        <p className="mt-4 text-theme-muted leading-relaxed">
          You don’t need to wait for a new conversation to start. Pipe existing system history into
          episodes, compile it once, and your agent walks into its first session already informed.
        </p>
      </div>

      {/* Pointer to the official ecosystem. The patterns below cover anything you can build
          on the ingest API; some of them now ship as official Statewave Connector packages. */}
      <div className="mb-10 flex flex-col gap-3 rounded-2xl border border-accent/20 bg-accent/[0.04] p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
            Official ecosystem
          </p>
          <p className="mt-1 text-sm text-theme-secondary leading-relaxed">
            Looking for ready-made connectors instead of integration recipes? <strong className="text-theme-primary">Statewave Connectors</strong> are modular packages — install only what you need. Phase 1 ships GitHub, Markdown/docs, and the MCP server.
          </p>
        </div>
        <Link
          to="/connectors"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-accent/30 bg-accent/10 text-accent hover:bg-accent/15 hover:border-accent/50 transition-colors"
        >
          Explore Statewave Connectors
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* The bootstrap formula */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 md:p-8 mb-10">
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
          The bootstrap pattern
        </p>
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:gap-3 gap-2">
          <BootstrapStep label="Existing data" sub="ticket / repo / doc / call" tone="muted" />
          <Arrow />
          <BootstrapStep label="Episodes" sub="immutable, per-subject" tone="brand" />
          <Arrow />
          <BootstrapStep label="Compiled memory" sub="typed, confidence-scored" tone="emerald" />
          <Arrow />
          <BootstrapStep label="Better context" sub="ranked, token-bounded" tone="emerald" />
        </div>
        <p className="mt-5 text-sm text-theme-muted leading-relaxed max-w-3xl">
          Every connector below is a recipe for that pattern. Most teams start with a one-shot
          historical import, then keep their connector running incrementally so the memory stays
          current as new events arrive.
        </p>
      </div>

      {/* Connector groups */}
      <div className="space-y-10">
        {CONNECTOR_GROUPS.map((group) => {
          const items = CONNECTORS.filter((c) => c.group === group.id)
          if (items.length === 0) return null
          return (
            <div key={group.id}>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-4">
                <h3 className="text-lg font-semibold text-theme-primary">{group.label}</h3>
                <p className="text-sm text-theme-muted md:max-w-md md:text-right">
                  {group.description}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((c) => (
                  <ConnectorCard key={c.title} connector={c} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-xs text-theme-muted/80 max-w-3xl">
        Most of the patterns above are integration recipes built on Statewave’s ingest API — write a
        small importer in your preferred language; the SDKs make the per-subject episode loop
        straightforward. Cards tagged{' '}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-medium uppercase tracking-wider align-middle">
          Available
        </span>{' '}
        or{' '}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-2 text-theme-muted text-[10px] font-medium uppercase tracking-wider align-middle">
          Coming soon
        </span>{' '}
        ship as official packages — see the{' '}
        <Link to="/connectors" className="text-accent hover:underline">
          Statewave Connectors page
        </Link>
        .
      </p>
    </Section>
  )
}

function BootstrapStep({
  label,
  sub,
  tone,
}: {
  label: string
  sub: string
  tone: 'muted' | 'brand' | 'emerald'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-theme-primary'
      : tone === 'brand'
        ? 'border-brand-500/25 bg-brand-500/[0.05] text-theme-primary'
        : 'border-theme-border bg-surface-2 text-theme-secondary'
  const subToneClass =
    tone === 'emerald' ? 'text-emerald-300' : tone === 'brand' ? 'text-brand-300' : 'text-theme-muted'
  return (
    <div className={`flex-1 px-4 py-3 rounded-xl border ${toneClass}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className={`text-[11px] mt-0.5 ${subToneClass}`}>{sub}</p>
    </div>
  )
}

function Arrow() {
  return (
    <svg
      className="hidden md:block w-4 h-4 text-theme-muted shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ConnectorCard({ connector }: { connector: Connector }) {
  const slug = slugify(connector.title)
  const active = useHashActive(slug)
  const pkg = connector.package
  return (
    <div
      id={slug}
      className={`group scroll-mt-24 p-4 rounded-xl border bg-surface-1 transition-colors ${
        pkg ? 'border-accent/20 hover:border-accent/40' : 'border-theme-border hover:border-emerald-500/25'
      } ${active ? 'card-anchor-active' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${pkg ? 'bg-accent' : 'bg-emerald-400'}`}
            aria-hidden
          />
          <h4 className="flex items-center gap-2 text-sm font-semibold text-theme-primary truncate">
            <span className="truncate">{connector.title}</span>
            <CardAnchor id={slug} />
          </h4>
        </div>
        {pkg && (
          <span
            className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
              pkg.status === 'available'
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-surface-2 text-theme-muted'
            }`}
          >
            {pkg.status === 'available' ? 'Available' : 'Coming soon'}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-theme-muted leading-relaxed">{connector.description}</p>
      {pkg && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium">
          <Link
            to="/connectors"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            View Statewave Connector
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {pkg.docHref && (
            <a
              href={pkg.docHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-theme-muted hover:text-accent transition-colors"
            >
              Docs
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5M19 5l-9 9M5 7v12h12" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Frontier ───────────────────────────────────────────────────────────── */

function FrontierSection() {
  return (
    <Section id="frontier" className="bg-surface-1/50">
      <div className="max-w-2xl mb-10">
        <p className="text-[11px] font-medium uppercase tracking-wider text-theme-muted">
          Frontier
        </p>
        <Heading id="ideas-at-the-edge" className="mt-3 text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Ideas at the edge
        </Heading>
        <p className="mt-4 text-theme-muted leading-relaxed">
          Directions Statewave makes possible but doesn’t yet ship pre-built. Some are research
          territory; some are just engineering work the platform doesn’t prescribe. Treat this
          section as inspiration, not a roadmap.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FRONTIER_IDEAS.map((idea, i) => (
          <FrontierCard key={idea.title} idea={idea} index={i} />
        ))}
      </div>
    </Section>
  )
}

function FrontierCard({
  idea,
  index,
}: {
  idea: { title: string; description: string }
  index: number
}) {
  const slug = slugify(idea.title)
  const active = useHashActive(slug)
  return (
    <motion.div
      id={slug}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`group scroll-mt-24 p-5 rounded-2xl border border-dashed border-theme-border bg-surface-2/30 ${
        active ? 'card-anchor-active' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-theme-muted" aria-hidden />
        <span className="text-[10px] font-medium uppercase tracking-wider text-theme-muted">
          Frontier
        </span>
      </div>
      <h3 className="flex items-center gap-2 text-base font-semibold text-theme-secondary">
        <span>{idea.title}</span>
        <CardAnchor id={slug} />
      </h3>
      <p className="mt-2 text-sm text-theme-muted leading-relaxed">{idea.description}</p>
    </motion.div>
  )
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */

function CTASection() {
  const { openWidget } = useChatWidget()
  const ctaDemoRef = useRef<HTMLElement>(null)
  useTrackDemoCta(ctaDemoRef)
  return (
    <Section>
      <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] via-surface-1 to-surface-1 p-10 md:p-14 text-center">
        <Heading id="see-your-idea" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          See your idea on this page
        </Heading>
        <p className="mt-5 text-theme-muted max-w-2xl mx-auto leading-relaxed">
          If you’re building any AI workflow with multi-session memory, Statewave is the layer
          underneath. Run it locally in two minutes — or try the live demo first.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" size="lg">
            Get started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button ref={ctaDemoRef} onClick={() => openWidget()} variant="secondary" size="lg">
            Try the live demo
          </Button>
          <Button to="/developers" variant="secondary" size="lg">
            Developer resources
          </Button>
        </div>
      </div>
    </Section>
  )
}
