/* Per-post structured data that isn't cheap to derive from the compiled
 * MDX component (FAQPage / HowTo need plain question+answer text, not a
 * React tree). Keep each entry in sync with the visible content in the
 * matching .mdx file's FAQ / step-by-step section — this is a second
 * representation of the same content, not a separate source of truth.
 *
 * Keyed by slug so BlogPostPage (client-side) and the prerender pipeline
 * (server-side, for crawlers that don't run JS) can both look up the same
 * data without re-parsing MDX.
 */

import type { FaqEntry } from './seo-meta'

export const POST_FAQ: Readonly<Record<string, readonly FaqEntry[]>> = {
  'episodic-vs-semantic-memory': [
    {
      question: 'What is the difference between episodic and semantic memory in AI agents?',
      answer:
        'Episodic memory stores specific events with time and context, like "user canceled on March 4 after a price increase." Semantic memory stores general, reusable facts, like "user prefers terse answers." Agents write episodes at interaction time and derive semantic facts from them.',
    },
    {
      question: 'Is episodic or semantic memory better for AI agents?',
      answer:
        'Neither. They do different jobs, and most production agents need both. Episodic memory handles recall of past interactions and few-shot examples. Semantic memory handles personalization by injecting compact facts into the prompt.',
    },
    {
      question: 'What is memory consolidation in AI agents?',
      answer:
        'Consolidation is a background pass that reads raw episodes and produces durable semantic facts, shrinking 200 conversation turns into one line like "senior engineer at a fintech, prefers terse responses."',
    },
    {
      question: 'Where does procedural memory fit alongside episodic and semantic?',
      answer:
        'Procedural memory holds skills and rules for how to do a task, separate from facts (semantic) and events (episodic). The CoALA framework defines all three as long-term stores.',
    },
    {
      question: 'Why do AI agents forget things between sessions?',
      answer:
        "LLMs are stateless, so every session starts from zero unless you store memory outside the context window. On Salesforce's CRMArena-Pro benchmark, agent success dropped from about 58% on single-turn tasks to about 35% on multi-turn ones, with lost context a leading cause.",
    },
    {
      question: "Isn't a bigger context window enough to replace agent memory?",
      answer:
        'No. Putting an entire history into every call raises cost and latency without fixing recall, and models still struggle with order and time. The better approach is compaction: store episodes, compile them into typed facts, and retrieve only what fits the prompt.',
    },
  ],
  'ai-data-governance-for-ai-agents': [
    {
      question: 'What is AI data governance?',
      answer:
        'AI data governance is the set of controls determining which data an AI system may use, under which rules, with what record of the decision. For agents, the governed object is the context bundle assembled at read time, not just the tables at rest.',
    },
    {
      question: 'Does the EU AI Act apply to my AI agent?',
      answer:
        'It depends on your use case, not your architecture. The Act became applicable on 2 August 2026. Most agents fall under transparency obligations, already in force. Agents used in Annex III areas such as employment screening, credit decisions, education, or biometrics are high-risk and face strict obligations from 2 December 2027.',
    },
    {
      question: 'What is a state-assembly receipt?',
      answer:
        'An immutable, ULID-addressable record of a single context assembly call. It carries a SHA-256 hash of the exact bytes delivered to the agent, every selected memory with its validity window and supersession status, the hash of the policy bundle in force, the serving region, and an HMAC-SHA256 signature.',
    },
    {
      question: 'Can I audit an AI agent without changing my model provider?',
      answer:
        "Yes. Auditability lives in the retrieval layer, not the model. The provider's logs show the request that was sent; they cannot show why those particular facts were selected over others available at the time.",
    },
    {
      question: 'Is self-hosting enough for AI data governance?',
      answer:
        'No. Self-hosting decides where episodes and compiled memories live. It does not decide who may read them, whether stale facts are excluded, or whether you can produce evidence afterward. Those need labels, a policy on the read path, and an audit artifact.',
    },
    {
      question: 'How do I handle a GDPR erasure request for data my agent learned?',
      answer:
        'Delete the subject, not the individual facts — one API call removes every episode, compiled memory, resolution, and entity for that subject. Receipts are append-only and expire separately under a retention setting, so plan them as a second, deliberate step in your erasure runbook.',
    },
    {
      question: 'What is the difference between suggested and authoritative sensitivity labels?',
      answer:
        'Sensitivity labels are operator-set and the only column the policy engine reads. Suggested labels are written by heuristic detectors at compile time and are advisory only, so a noisy detector can never tighten policy on live traffic.',
    },
  ],
  'multi-tenant-isolation-in-ai-memory': [
    {
      question: 'Is application-layer tenant isolation enough to pass SOC 2?',
      answer:
        'No audit framework names a specific enforcement mechanism, so the question an auditor actually asks is whether you can demonstrate the control and produce evidence it operated. Application-layer scoping plus signed state-assembly receipts gives you both.',
    },
    {
      question: 'Can I just use subject_id as the tenant boundary?',
      answer:
        'No. Every subject ID becomes structurally coupled to a tenant, so moving or sharing a subject later fights the scheme, and tenant_id is indexed while a prefixed string forces a prefix scan without the same isolation guarantees.',
    },
    {
      question: 'What happens to my existing memories when I enable tenant isolation?',
      answer:
        'They stop appearing in scoped queries. Rows written before the migration carry a NULL tenant, and a query with a tenant filter will not return NULL-tenant rows — audit and backfill them before flipping the switch.',
    },
    {
      question: 'Do sensitivity labels replace tenant isolation?',
      answer:
        "They solve a different problem. Tenant isolation decides whose data a query can reach. Sensitivity labels decide which of that tenant's own memories a particular caller is allowed to see. Run both.",
    },
    {
      question: 'Should each tenant get its own Statewave instance?',
      answer:
        'Only if something forces it — a tenant needing its own retention window, compiler mode, database-enforced isolation, or jurisdiction. Absent one of those, a single instance with tenant scoping and per-tenant rate limiting is cheaper and more maintainable.',
    },
    {
      question: 'Does tenant scoping slow down retrieval?',
      answer:
        'tenant_id is stored on every row with composite indexes, and sensitivity labels use a GIN-indexed array column, so policy filters evaluate on the hot path. There is no published benchmark comparing scoped and unscoped latency — measure it on your own data if it matters to a decision.',
    },
    {
      question: 'How do multi-agent pipelines work with tenant isolation?',
      answer:
        "Agents in one pipeline share a subject deliberately — that's how one agent's decision reaches the next. That sharing is bounded by the tenant: the shared subject lives under one tenant_id, and every agent's read and write carries it.",
    },
  ],
} as const

export const HOWTO_SLUGS: readonly string[] = ['persistent-memory-for-ai-support-agents']
