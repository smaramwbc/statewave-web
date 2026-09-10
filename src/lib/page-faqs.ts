/* Per-route Q&A blocks for the pages that aren't the homepage or /faq.
 *
 * Why this exists: answer engines extract a citation by pairing a question
 * *heading* with the text immediately after it. Thirteen public pages had no
 * question heading at all, so none of them could be cited for the questions
 * they actually answer. Each entry here renders as an <h3> question with its
 * answer directly beneath (components/PageFaq → FaqAccordion) and is emitted
 * as FAQPage JSON-LD automatically by usePageSEO — one source of truth, and
 * no per-page wiring to forget.
 *
 * Same honesty rule as lib/faq.ts: every answer must be backed by the docs,
 * the repo, or the page it sits on. Answers deliberately carry concrete
 * figures (ranking weights, endpoints, versions, counts) and attributions —
 * fact density is what makes an answer worth quoting. Benchmark scores stay
 * off these pages; /benchmarks is the only surface that publishes them with
 * the harness, the opponent, and the retrieval-budget asymmetry disclosed.
 */

import type { FaqEntry, RouteKey } from './seo-meta'
import { CREDIBILITY_STATS, formatCompactCount } from './credibility-stats'
import { PROOF_FIGURES } from './proof-stats'

const s = CREDIBILITY_STATS

/** "322 GitHub stars and 26 forks, 13.2k Docker pulls, …, counted on
 *  2026-09-07" — built from the committed snapshot so the answer can't
 *  drift from the stat tiles above it. Every field is nullable (see
 *  credibility-stats.ts), so parts drop out rather than rendering "null". */
function adoptionSentence(): string {
  const parts: string[] = []
  if (s.github_stars !== null) {
    parts.push(
      `${s.github_stars} GitHub stars${
        s.github_forks !== null ? ` and ${s.github_forks} forks` : ''
      }`,
    )
  }
  const pulls = formatCompactCount(s.docker_pulls)
  if (pulls) parts.push(`${pulls} Docker pulls`)
  if (s.pypi_version) {
    parts.push(
      `statewave ${s.pypi_version} on PyPI${
        s.pypi_downloads_month !== null
          ? ` (${s.pypi_downloads_month} downloads a month)`
          : ''
      }`,
    )
  }
  if (s.npm_version) {
    parts.push(
      `@statewavedev/sdk ${s.npm_version} on npm${
        s.npm_downloads_month !== null ? ` (${s.npm_downloads_month} a month)` : ''
      }`,
    )
  }
  const asOf = s.fetched_at ? `, counted on ${s.fetched_at.slice(0, 10)}` : ''
  return parts.length ? `${parts.join(', ')}${asOf}` : ''
}

const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'

/** The date these answers were last checked against the docs and the repo,
 *  rendered under every page FAQ. Deliberately a hand-maintained constant
 *  rather than the build date: a rebuild is not a re-read, and a date that
 *  advances on its own would be asserting a review nobody did. Bump it in
 *  the same PR whenever an answer below changes. */
export const PAGE_FAQS_REVIEWED = '2026-09-09'

/* The /vs/* entries are rendered by each comparison page's own FaqSection
 * (their card layouts differ), not by <PageFaq> — they live here so the
 * prerenderer can emit their FAQPage JSON-LD too. Before this, those four
 * pages served visible Q&A with no schema to any crawler that doesn't run
 * JavaScript, and /vs/mem0 emitted none at all. */
export const PAGE_FAQS: Partial<Record<RouteKey, readonly FaqEntry[]>> = {
  '/why': [
    {
      question:
        'Why does an agent need a memory runtime instead of a bigger context window?',
      answer:
        'A context window is per-call state — re-sent, re-priced, and discarded every turn. A memory runtime keeps durable facts outside the prompt and assembles only what the current task needs, packed to a token budget rather than truncated at the end. Statewave ranks candidates on four fixed signals: kind priority (profile_fact 10, procedure 8, episode_summary 5, raw_episode 3), recency, task relevance, and temporal validity (+3 while valid, −4 once expired). The same subject, task, and budget return the same bundle every run.',
      links: [
        { label: 'How it works', href: '/product' },
        { label: 'Ranking and retrieval', href: `${DOCS}/architecture/ranking.md` },
      ],
    },
    {
      question: 'What does provenance-first mean in practice?',
      answer:
        'Every compiled memory carries the IDs of the episodes it was derived from, a confidence score, and a validity window, so any fact an agent used traces back to the raw event that produced it. Context assembly can also emit a state-assembly receipt: an immutable, ULID-addressable record carrying a SHA-256 hash of the exact bytes handed to the model, plus the content hash of the policy bundle in force. "Why did the agent say that, and under which policy?" stays answerable months later.',
      links: [
        { label: 'Audit and governance', href: '/product' },
        { label: 'Receipts reference', href: `${DOCS}/receipts.md` },
      ],
    },
    {
      question: 'Does anything leave my infrastructure?',
      answer:
        'Storage does not: episodes, compiled memories, and their embeddings live in your own Postgres with pgvector, and ranking is a single local query. What leaves depends on two choices you make. The heuristic compiler runs entirely on your network. An LLM compiler routes through LiteLLM, which supports 100+ providers including self-hosted Ollama and vLLM, so fully local is a configuration you can verify rather than a promise you have to trust.',
      links: [
        { label: 'Privacy and data flow', href: '/product' },
        { label: 'Architecture', href: `${DOCS}/architecture/overview.md` },
      ],
    },
    {
      question: 'Who is Statewave not a good fit for today?',
      answer:
        'Teams who want a hosted SaaS — Statewave is self-hosted infrastructure with no managed cloud. Teams who only need nearest-neighbor search, where pgvector or a vector database on its own is simpler. Chatbots with no multi-session requirement, which have nothing to remember. And workloads needing verified high-throughput scale today: the multi-replica API is supported but has not been load-tested beyond 10,000 subjects, on a single Postgres with no cross-region clustering.',
      links: [{ label: 'Compare the alternatives', href: '/why#vs-alternatives' }],
    },
  ],

  '/product': [
    {
      question: 'How does a raw event become retrievable memory?',
      answer:
        `Three endpoints carry the whole loop. POST /v1/episodes appends an immutable, content-hashed event under a subject. POST /v1/memories/compile turns new episodes into typed memories — profile_fact, procedure, episode_summary, artifact_ref — each with a confidence score, a validity window, and its source episode IDs. POST /v1/context returns a ranked, token-bounded bundle. Compilation is idempotent: running it twice creates no duplicates, a property the core repo covers with ${PROOF_FIGURES.unitTests} unit tests and ${PROOF_FIGURES.evalAssertions} eval assertions across the record → compile → retrieve path.`,
      links: [
        { label: 'API v1 contract', href: `${DOCS}/api/v1-contract.md` },
        { label: 'Getting started', href: `${DOCS}/getting-started.md` },
      ],
    },
    {
      question: 'What is inside a context bundle?',
      answer:
        'Sections for the task, compiled facts, procedures, recent history, and raw episodes — ranked by composite score and packed until the token budget is spent, never truncated mid-item. Every row carries its kind, confidence, validity window, source episode IDs, and supersession state (active, superseded, or tombstoned), so the calling application can render or audit exactly what the model saw. The benchmark harness exercises budgets of 512, 1,024, 2,048, and 4,096 tokens.',
      links: [{ label: 'Domain model', href: '/product#domain-model' }],
    },
    {
      question: 'How does Statewave decide which memories make the cut?',
      answer:
        'A fixed, inspectable scoring model rather than embedding distance alone. Kind priority scores profile_fact 10, procedure 8, episode_summary 5, and raw_episode 3. Recency is a linear scale with the newest item at maximum. Task relevance is word overlap (0–5), or cosine similarity (0–8) when embeddings are configured. Temporal validity adds +3 for a currently valid memory and −4 for an expired one. Support workloads layer session, urgency, and repeat-issue signals on top.',
      links: [{ label: 'Ranking and retrieval', href: `${DOCS}/architecture/ranking.md` }],
    },
    {
      question: 'What is a state-assembly receipt?',
      answer:
        'An immutable, ULID-addressable record of one context call, introduced with the v0.8 governance layer and extended in v0.9 with HMAC signing and receipt replay. It carries a SHA-256 integrity hash of the bytes delivered to the agent, the per-entry supersession status, and the content hash of the policy bundle that was in force — so a reviewer can verify it without trusting the application that wrote it. Request one per call with emit_receipt, or set receipts: always per tenant.',
      links: [{ label: 'Receipts reference', href: `${DOCS}/receipts.md` }],
    },
    {
      question: 'Can I change the ranking weights?',
      answer:
        'Not today. The weights are constants in server/services/context.py with no per-tenant override, a deliberate choice to keep ranking deterministic and reproducible. You can scope requests by subject, filter /v1/memories/search results by kind, or modify the context assembler in your own self-hosted deployment. Per-call overrides stay unexposed on purpose: we would rather ship them in response to a concrete misranking than speculatively, because every knob is a new way for two deployments to disagree about the same subject.',
      links: [{ label: 'Ranking and retrieval', href: `${DOCS}/architecture/ranking.md` }],
    },
  ],

  '/about': [
    {
      question: 'How is Statewave licensed, and can I use it commercially?',
      answer:
        'Everything — the server, both SDKs, the connectors, the admin console, the benchmark harness, and this website — is public on GitHub under Apache-2.0. That license is permissive and carries an explicit patent grant, so you can use, fork, modify, distribute, and ship commercial products on Statewave without signing anything. Optional SLA, indemnity, architecture review, and managed hosting are available on request at licensing@statewave.ai.',
      links: [
        { label: 'Apache License 2.0', href: 'https://www.apache.org/licenses/LICENSE-2.0' },
        { label: 'Source on GitHub', href: 'https://github.com/smaramwbc/statewave' },
      ],
    },
    {
      question: 'Is there a hosted Statewave I can sign up for?',
      answer:
        'No. Statewave runs on your infrastructure, and there is no Statewave-hosted backend the SDKs quietly phone home to — episodes, compiled memories, and embeddings stay in your Postgres. The one exception is transparent: the live demo on this site talks to an instance we operate ourselves, so you can try the runtime without installing it. Managed hosting exists only as an optional commercial arrangement, never as the default path.',
      links: [{ label: 'How it works', href: '/product' }],
    },
    {
      question: 'How much adoption does the project have?',
      answer: `Public counts, refreshed out-of-band by a script and committed to the repo so this page is never a live guess: ${adoptionSentence()}. The engineering figures beside them come from CI — ${PROOF_FIGURES.unitTests} unit tests, ${PROOF_FIGURES.evalAssertions} eval assertions, and ${PROOF_FIGURES.supportCriteria} support eval criteria — and every published proof figure is reproducible by cloning the statewave-memory-benchmarks harness and running it yourself.`,
      links: [
        { label: 'Benchmarks and method', href: '/benchmarks' },
        {
          label: 'Benchmark harness',
          href: 'https://github.com/smaramwbc/statewave-memory-benchmarks',
        },
      ],
    },
    {
      question: 'Which repository should I start with?',
      answer:
        'statewave is the core server — REST API, compiler, ranking, and storage. statewave-py and statewave-ts are the SDKs; statewave-docs holds the architecture notes, API contracts, and ADRs; statewave-examples has runnable end-to-end agent flows. statewave-connectors ships GitHub, Jira, Slack, Notion, Discord, Zendesk, Intercom, Freshdesk, Gmail, n8n, Zapier, database, Markdown/ADR, and MCP packages. Adopt only the pieces you need — they are separate packages on purpose.',
      links: [{ label: 'Developer hub', href: '/developers' }],
    },
  ],

  '/developers': [
    {
      question: 'How long does it take to get Statewave running locally?',
      answer:
        'Under two minutes with one command: npx @statewavedev/statewave boots a local runtime, wires it into Claude Code, Claude Desktop, Cursor, VS Code Copilot, and Codex CLI, and seeds your repo — self-hosted, offline, no account. Tear it down with --down. The Docker Compose route takes about five minutes: docker compose up -d brings the API up on port 8100 alongside Postgres with pgvector, and curl localhost:8100/healthz reports ok once it is ready.',
      links: [
        { label: 'Getting started', href: `${DOCS}/getting-started.md` },
        { label: 'Deployment guide', href: `${DOCS}/deployment/guide.md` },
      ],
    },
    {
      question: 'Which SDKs and clients are supported?',
      answer: `The Python SDK (pip install statewave, ${
        s.pypi_version ?? 'current release'
      }) ships sync and async clients, Pydantic models, and retry with backoff. The TypeScript SDK (npm install @statewavedev/sdk, ${
        s.npm_version ?? 'current release'
      }) is fetch-based with full type definitions. Anything else talks to the documented v1 REST contract directly, and the shipped MCP server exposes the same runtime to any MCP-compatible client.`,
      links: [
        { label: 'API v1 contract', href: `${DOCS}/api/v1-contract.md` },
        { label: 'Model Context Protocol', href: 'https://modelcontextprotocol.io' },
      ],
    },
    {
      question: 'Do I need a GPU or a separate vector database?',
      answer:
        'Neither. Storage is Postgres plus the pgvector extension — usually already in your stack — and retrieval is a single ranked query, not a call out to a second system. The heuristic compiler needs no model at all, so a fully local deployment is CPU-only. Embeddings are optional: without them task relevance falls back to word overlap (0–5 instead of 0–8), and the rest of the scoring model is unchanged.',
      links: [
        { label: 'pgvector', href: 'https://github.com/pgvector/pgvector' },
        { label: 'Architecture overview', href: `${DOCS}/architecture/overview.md` },
      ],
    },
    {
      question: 'Where are the runnable examples?',
      answer:
        'statewave-examples carries the quickstart, a support agent, a coding agent, a bare LLM loop, the eval suite, and the benchmarks. The smallest useful integration is two calls — get_context before the model call, create_episode after it — and that is the whole surface for a chat app. The repo also has a React chat panel that renders every compiled fact grouped by kind, scored, and sourced back to its episode.',
      links: [
        { label: 'Examples repo', href: 'https://github.com/smaramwbc/statewave-examples' },
        { label: 'Live demo', href: '/demo' },
      ],
    },
  ],

  '/connectors': [
    {
      question: 'What does a Statewave connector actually do?',
      answer:
        'It normalizes one source system’s events into the same Statewave episode shape, written under a stable subject prefix — repo:owner/name for code, customer: for support, community: for chat, contact: for mail. Because every connector emits the same contract, an agent queries memory by subject without knowing which tool a fact came from, and the compiler and the ranking model treat a Jira ticket and a Slack thread identically.',
      links: [{ label: 'How compilation works', href: '/product' }],
    },
    {
      question: 'Which sources can I ingest today?',
      answer:
        'GitHub (issues, pull requests, comments, reviews, releases), Jira, Slack, Discord, Notion, Zendesk, Intercom, Freshdesk, Gmail, n8n, Zapier, SQL databases, and local Markdown docs, ADRs, and RFCs. The MCP server runs the other direction: it exposes Statewave itself to Copilot, Claude, Cursor, and any MCP-compatible client. All of them ship as separate packages under Apache-2.0.',
      links: [
        { label: 'Model Context Protocol', href: 'https://modelcontextprotocol.io' },
      ],
    },
    {
      question: 'Do I have to install the whole suite?',
      answer:
        'No — that is why they are modular packages rather than one binary. Install only the connectors for the systems you actually run, and add more later without touching the runtime or migrating anything: a new source appends new episodes under its own subjects, and existing compiled memories are untouched. A repo-memory-only deployment is just the GitHub and Markdown packages.',
      links: [{ label: 'Developer hub', href: '/developers' }],
    },
    {
      question: 'How much of my Slack does the connector read?',
      answer:
        'Only what you allow. It authenticates with a bot token and requires an explicit --channels allowlist, then pulls channel and thread history and subscribes to the Events API for messages, reactions, and pins. Direct messages (dm:<user>) and group DMs (mpim:<channel>) are opt-in behind --include-dms and --include-mpim, and stay off unless you pass them. Per-memory sensitivity labels and the policy engine then govern who can read the result.',
      links: [{ label: 'Governance model', href: '/product' }],
    },
  ],

  '/use-cases': [
    {
      question: 'What is Statewave strongest at today?',
      answer:
        'Support agents with returning customers. That workflow has the most machinery behind it: session-aware ranking, escalation handoff packs, repeat-issue detection, first-response and resolution SLA tracking, and deterministic 0–100 health scores with explainable factors (healthy ≥70, watch 40–69, at_risk below 40). It is the shape with the most evidence today, not the limit of the runtime — the same primitives carry every other use case on this page.',
      links: [{ label: 'Support-native features', href: '/product' }],
    },
    {
      question: 'Can I use Statewave outside customer support?',
      answer:
        'Yes. The explorer on this page catalogs 54 use-case ideas across coding copilots, workspace and account assistants, voice continuity, and multi-agent infrastructure, four of them written up as full deep-dives. They differ only in which subjects you write and which task you retrieve for; record, compile, retrieve, and govern is the same loop underneath all of them.',
      links: [{ label: 'Multi-agent memory', href: '/use-cases/multi-agent-memory' }],
    },
    {
      question: 'Does my agent have to start from an empty memory?',
      answer:
        'No. The bootstrap pattern backfills the history you already have: pipe existing tickets, repositories, documents, and call transcripts through the connectors as episodes, compile once, and the agent walks into its first session already informed. Because episodes are append-only and compilation is idempotent, a backfill can be re-run safely — it produces no duplicate memories.',
      links: [{ label: 'Connectors', href: '/connectors' }],
    },
    {
      question: 'Which use case should I build first?',
      answer:
        'Pick one subject type and one workflow — a customer, a repo, or a pipeline run — and wrap the two-call pattern around the agent you already have: retrieve a context bundle before the model call, write an episode after it. That is enough to see ranked memory in production. Widen to more subjects and more connectors once the first loop is boring, rather than modelling every subject up front.',
      links: [{ label: 'Start building', href: '/developers' }],
    },
  ],

  '/use-cases/multi-agent-memory': [
    {
      question: 'How do several agents share memory without passing messages?',
      answer:
        'They read and write one subject. Each agent appends its findings with POST /v1/episodes, the compiler turns those into typed memories, and every other agent calls POST /v1/context before it acts — so a decision is visible to the whole fleet without a message being routed anywhere. Message passing assumes turn order; parallel agents have none, which is why the shared store is the coordination point rather than the channel.',
      links: [
        { label: 'Shared context walkthrough', href: '/use-cases/multi-agent-shared-context' },
      ],
    },
    {
      question: 'What happens when two agents record conflicting facts?',
      answer:
        'The compiler resolves the overlap instead of leaving both in the prompt. Overlapping memories are marked superseded, and /v1/context returns active memories only — so a stale figure never reaches the model for it to guess between. Each entry keeps its provenance: source episode IDs, confidence score, and supersession state, so the retired fact stays auditable even though it is no longer retrievable as current.',
      links: [{ label: 'Provenance and supersession', href: '/product' }],
    },
    {
      question: 'What happens if an agent crashes mid-run?',
      answer:
        'Nothing upstream re-runs. Every agent’s work is durably persisted as episodes the moment it is written, so a killed agent restarts from the last compiled context while its peers’ findings stay cached. GET /v1/timeline reconstructs the chronological chain for the run — what each agent knew when it acted, and what it wrote — which is also how you audit a pipeline afterwards instead of reading logs.',
      links: [{ label: 'API v1 contract', href: `${DOCS}/api/v1-contract.md` }],
    },
    {
      question: 'How do I stop shared memory from blowing the context window?',
      answer:
        'Set max_tokens on every context call. The bundle is ranked first and packed to that ceiling, highest-signal memories first, so each agent receives the slice relevant to its task rather than the full episode log. The budget is enforced before recall, not by truncating a prompt afterwards — the benchmark harness runs the same path at 512, 1,024, 2,048, and 4,096 tokens.',
      links: [{ label: 'Scoring model', href: '/product' }],
    },
  ],

  '/use-cases/personal-assistant-memory': [
    {
      question: 'How much code does it take to give an assistant memory?',
      answer:
        'Two calls. get_context(user_id, message) before the model call, create_episode(user_id, message, reply) after it — the minimal-quickstart example is a single Python file with no framework and no UI. Everything else is optional: compilation runs as a background pass, and the React reference build adds a panel rendering each compiled fact grouped by kind, with its confidence score and source episode.',
      links: [
        { label: 'Examples repo', href: 'https://github.com/smaramwbc/statewave-examples' },
        { label: 'Start building', href: '/developers' },
      ],
    },
    {
      question: 'How is this different from replaying chat history into the prompt?',
      answer:
        'Raw history carries no ranking signal — a throwaway aside weighs the same as a critical bug report, and after eight to ten turns the window is full and early facts are silently dropped. Statewave keeps every turn as an immutable episode, compiles the durable parts into typed memories with confidence scores and provenance, and returns only what the current question needs, ranked and packed to a token budget you set.',
      links: [{ label: 'Why a memory runtime', href: '/why' }],
    },
    {
      question: 'Can one user’s memory leak into another’s?',
      answer:
        'Not by construction. Every episode and memory is scoped to a subject and retrieval is per-subject, so dev_alice and dev_bob compile and read separate memory with no shared candidate set on a single instance. Multi-tenant deployments add per-memory sensitivity labels (pii, financial, secret) and a declarative policy engine that filters on caller identity, with require_caller_identity available to make anonymous calls fail closed.',
      links: [{ label: 'Governance model', href: '/product' }],
    },
    {
      question: 'Does it lock me into one model or framework?',
      answer:
        'No. The same two calls sit in front of OpenAI, Claude, or CrewAI, because Statewave returns text a prompt can carry rather than a model-specific structure. Compilation routes through LiteLLM (100+ providers, including self-hosted Ollama and vLLM), retrieval is provider-agnostic, and the runtime is an HTTP service with two thin SDKs — swap the model layer and the memory layer does not change.',
      links: [{ label: 'What we are committed to', href: '/about' }],
    },
  ],

  '/use-cases/multi-agent-shared-context': [
    {
      question: 'How is shared context different from message passing?',
      answer:
        'Message passing assumes an ordering parallel agents do not have — an agent cannot wait for a message nobody has sent yet. Shared context inverts it: before_acting() reads the authoritative bundle for the run’s subject before an agent decides, and decide() writes the outcome back as an episode. "Did someone already decide this?" becomes a lookup against one store rather than a guess about which messages happened to arrive.',
      links: [{ label: 'Multi-agent memory', href: '/use-cases/multi-agent-memory' }],
    },
    {
      question: 'What actually stops two agents from duplicating work?',
      answer:
        'Ordering. The Coder’s context read happens before it chooses what to build, not after — so the Planner’s deprecation is known before the first line of code exists, and the obsolete module is never rebuilt. A reviewer-style check catches the same conflict only once both agents have finished, and that compute is unrecoverable. Prevention is a read-before-write discipline, not a smarter conflict detector.',
      links: [{ label: 'How ranking works', href: '/product' }],
    },
    {
      question: 'How do I audit what an agent knew when it acted?',
      answer:
        'Every read and write carries a caller_id and the run is one subject_id, so timeline_inspector.py --run <id> prints the chronological chain: what each agent read, what it wrote, and the final memory state. For compliance-grade runs, context assembly can also emit a state-assembly receipt with a SHA-256 hash of the exact bytes delivered and the content hash of the policy bundle applied.',
      links: [{ label: 'Receipts reference', href: `${DOCS}/receipts.md` }],
    },
    {
      question: 'Do I have to rewrite my agents to use it?',
      answer:
        'No. SharedContext wraps whatever loop you already run — the same before_acting() and decide() pair goes around a CrewAI tool or a Claude Agent SDK loop, and each agent keeps its own prompt and model. Coordination runs on Postgres with no extra infrastructure: no message broker, no scheduler, and no graph database to operate alongside it.',
      links: [{ label: 'Developer hub', href: '/developers' }],
    },
  ],

  '/use-cases/grounded-shop-assistant': [
    {
      question: 'How does the assistant avoid inventing product facts?',
      answer:
        'Grounding is enforced by the memory runtime rather than by prompt wording. The model answers strictly from evidence retrieved out of compiled Subjects, and the citation IDs it returns are validated against the evidence actually retrieved — unknown IDs are dropped and flagged as a warning. An answer ships only if at least one citation survives validation, so "sounds plausible" is not a passing grade.',
      links: [{ label: 'How compilation works', href: '/product' }],
    },
    {
      question: 'What happens when the assistant cannot ground an answer?',
      answer:
        'It says it does not know, and the route writes the question to an ops:coverage-gaps Episode carrying the shopper’s exact wording. The Ops Assistant reads those gaps beside the catalog and the FAQs, so the content team resolves them from the same console. An unanswerable question becomes a tracked object with an owner, instead of a guess that reaches a customer.',
      links: [{ label: 'More use cases', href: '/use-cases' }],
    },
    {
      question: 'How are product updates handled without rewriting history?',
      answer:
        'Nothing is mutated in place. Updating a product or resolving a gap appends a new Episode under the same sourceId, and the newest episode per sourceId supersedes the older one at compile time — so facts change while the record of what was true when stays intact. Ingestion deduplicates by content hash, so re-running the job over an unchanged catalog writes nothing.',
      links: [{ label: 'Domain model', href: '/product#domain-model' }],
    },
    {
      question: 'What does this assistant run on?',
      answer:
        'The same open-source memory runtime this site documents: append-only episodes, compileSubject, and Subjects persisted through StatewaveStore, served over one completion path shared by the shopper and ops assistants. Completions route through LiteLLM or OpenRouter, and an offline mode runs the flow with no provider at all. Its test suite is node --test across chat-core, statewave-core, and server, green on every Node version in CI.',
      links: [{ label: 'Source on GitHub', href: 'https://github.com/smaramwbc/statewave' }],
    },
  ],

  '/vs/mem0': [
    { question: 'How is Statewave different from Mem0?', answer: 'Mem0 ranks memories by relevance for an id you pass. Statewave compiles raw episodes into typed memories, ranks them with a fixed scoring model to a token budget, applies policy on the read path, and returns an integrity-hashed receipt of exactly what was delivered.' },
    { question: 'What makes retrieval deterministic?', answer: 'A fixed scoring model: kind priority (3–10), recency (0–5), task relevance (0–8), and temporal validity (−4 to +3). The same subject, task, and budget produce the same bundle every time.' },
    { question: 'What is a state-assembly receipt?', answer: 'An immutable, ULID-addressable record of one context call. It carries a byte-level integrity hash of what was delivered and references the policy bundle hash, so ‘what did the agent see, under which policy’ is answerable forever.' },
    { question: 'Does it work with Claude, Cursor, or Codex?', answer: 'Yes. One command (npx @statewavedev/statewave) boots the runtime and auto-wires Claude Code, Claude Desktop, Cursor, VS Code Copilot, and Codex CLI. Any MCP-compatible client connects too.' },
    { question: 'Can I run it fully offline?', answer: 'Yes. Storage is Postgres-only and self-hosted. The heuristic compiler keeps everything on your network; nothing leaves unless you configure an LLM compiler or hosted embeddings.' },
  ],

  '/vs/letta': [
    { question: 'How is Statewave different from Letta?', answer: 'In Letta the agent manages its own memory: it edits memory blocks in a git-tracked context tree (MemFS) with tool calls, so retrieval is the model’s job and costs tokens every turn. Statewave compiles episodes into typed memories, ranks them to a token budget, applies policy on the read path, and returns an integrity-hashed receipt, with no model in the loop.' },
    { question: 'Do I have to replace my agent framework?', answer: 'No. Letta is a whole agent runtime; Statewave is only the memory layer. Keep your existing agent or framework and point its memory reads and writes at Statewave over REST, the SDKs, or MCP.' },
    { question: 'What makes retrieval deterministic?', answer: 'A fixed scoring model applied to a hybrid lexical and vector candidate set: kind priority (3–10), recency (0–5), task relevance (0–8), and temporal validity (−4 to +3). The same subject, task, budget, and point in time produce the same bundle every time.' },
    { question: 'What is a state-assembly receipt?', answer: 'An immutable, ULID-addressable record of one context call. It carries a byte-level integrity hash of what was delivered and references the policy bundle hash, so ‘what did the agent see, under which policy’ is answerable forever.' },
    { question: 'Does it work with Claude, Cursor, or Codex?', answer: 'Yes. One command (npx @statewavedev/statewave) boots the runtime, and its shipped MCP server connects any MCP-compatible client: Claude, Cursor, Copilot, and agent runtimes.' },
    { question: 'Can I run it fully offline?', answer: 'Yes. Storage is Postgres-only and self-hosted. The heuristic compiler keeps everything on your network; nothing leaves unless you configure an LLM compiler or hosted embeddings.' },
  ],

  '/vs/zep': [
    { tag: 'OVERVIEW', question: 'How is Statewave different from Zep?', answer: 'Zep is a Graph RAG product: it models memory as a knowledge graph of entities and edges and returns retrieval as an optimized Context Block string. Statewave compiles raw episodes into typed memories with confidence and validity, ranks them with a fixed scoring model to a token budget, and returns a structured bundle: per-row kind, confidence, validity, and source episode ids, with no graph to traverse.' },
    { tag: 'CAPABILITY', question: 'Can I still do graph reasoning?', answer: 'Not natively. Statewave has no graph-traversal surface, so "find everything Alice is connected to within two hops" isn’t its shape. If your domain needs entity-relationship reasoning, keep that in Zep or your own data layer, and use Statewave for episode and typed-memory storage.' },
    { tag: 'MIGRATION', question: 'What happens to relational facts like "Alice works at Acme"?', answer: 'Facts about a single subject migrate cleanly. Relational facts that link two entities don’t survive directly. You encode the relationship in the subject’s memory content, write the memory to both subjects with cross-references, or keep the relationship in your application’s graph.' },
    { tag: 'DETERMINISM', question: 'What makes retrieval deterministic?', answer: 'The bundle is compiled and assembled the same way every run: four ranking signals (kind priority, recency, task relevance, and temporal validity) combined to a fixed token budget. The same subject, task, and point in time produce the same bytes. Graph traversal with a reranker can’t promise that, because index state and reranker variation introduce drift.' },
    { tag: 'STORAGE', question: 'Do I have to run a graph database?', answer: 'No. Storage is Postgres plus pgvector and nothing else, usually already in your stack. There is no separate graph store to operate, back up, or scale.' },
    { tag: 'DEPLOYMENT', question: 'Does Zep offer a self-hosted option?', answer: 'No. Zep discontinued its self-hosted Community Edition in 2025 and now concentrates its open-source work on Graphiti, the temporal-graph engine underneath; the memory API this page compares (thread.get_user_context, graph.search) is only available through Zep Cloud, BYOK, or Bring-Your-Own-Cloud. Statewave runs the whole stack, Postgres included, on your own infrastructure, with no cloud dependency and no usage credits to meter.' },
    { tag: 'INTEGRATIONS', question: 'Does it work with Claude, Cursor, or Codex?', answer: 'Yes. One command (npx @statewavedev/statewave) boots the runtime, and its shipped MCP server connects any MCP-compatible client: Claude, Cursor, Copilot, and agent runtimes. Zep is cloud-only; Statewave runs entirely on your own infrastructure.' },
  ],

  '/vs/supermemory': [
    { question: 'How is Statewave different from Supermemory?', answer: 'Supermemory ingests documents and chats, extracts memories into a graph with user profiles, and answers search with hybrid retrieval and a reranker, tuned for recall and speed. Statewave compiles typed memories with confidence and validity, ranks them to a token budget, and returns a deterministic bundle with read-path governance and optional receipts.' },
    { question: 'Can I compare Statewave’s 0.905 against Supermemory’s 59.7%?', answer: 'No, they measure different things. Statewave’s 0.905 is end-to-end QA answer accuracy on LoCoMo; Supermemory’s 59.7% is Precision@1, a retrieval metric. Different metrics, different sample sizes. Read each on its own terms, and benchmark both on your own workload.' },
    { question: 'Isn’t Supermemory also open-source and self-hostable?', answer: 'Yes, but the two binaries ask different things of you. Supermemory’s self-hosted binary is zero-config, an embedded graph engine with local embeddings and no database to provision. Statewave’s self-hosted core asks you to run Postgres and pgvector. The read path also differs: deterministic, provenance-traced assembly with receipts, versus fast, recall-tuned reranked search with an extracted profile.' },
    { question: 'Which one is faster?', answer: 'Supermemory is engineered for speed and publishes sub-300ms retrieval at scale. Statewave doesn’t headline a latency number; its read path is a single Postgres query, designed around determinism rather than raw throughput.' },
    { question: 'What makes Statewave retrieval deterministic?', answer: 'Four ranking signals, kind priority, recency, task relevance, and temporal validity, combine to a fixed token budget. The same subject, task, and point in time always produce the same bytes.' },
    { question: 'Does it work with Claude, Cursor, or Codex?', answer: 'Yes. One command boots the runtime, and its shipped MCP server connects any MCP-compatible client. Supermemory’s hosted platform also ships MCP and connectors; Statewave is self-hosted, so you operate Postgres and a container.' },
    { question: 'Can I run it fully offline?', answer: 'Yes. Statewave’s storage is Postgres plus pgvector, self-hosted with no cloud dependency. Supermemory’s local binary also runs standalone, but its managed platform is a Cloudflare-edge service.' },
  ],
}
