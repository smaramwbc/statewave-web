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
  'agent-memory-provenance-audit-trails': [
    {
      question: 'What is provenance in AI agent memory?',
      answer:
        'Every compiled memory carries source_episode_ids — the immutable IDs of the raw episodes it was derived from. That means you can walk from anything the agent said back to the conversation, tool call, or decision that produced it.',
    },
    {
      question: 'What does adding provenance cost?',
      answer:
        'Storage is trivial: roughly 50 MB for a million memories averaging three source episodes each. Compute is zero at retrieval time, since the IDs already live on the memory row. The API surface is one extra field plus an optional expand=episodes parameter.',
    },
    {
      question: 'How does provenance help with compliance?',
      answer:
        'Provenance is the lineage a regulator asks for, by construction — a compiled fact like "user opted out of marketing emails" links to the episode that captured the opt-out, with a timestamp and channel. GDPR right-to-explanation, CCPA notice obligations, and sector rules like HIPAA, GLBA, or SOX all reduce to the same queryable chain from output back to source event.',
    },
    {
      question: 'Why build provenance in from day one instead of adding it later?',
      answer:
        "Retrofitting is expensive — a memory model without provenance throws away source linkage at compile time, so adding it back means re-running compilation on the entire historical episode log with no guarantee the original order is preserved. It's also a forcing function: if every memory has to carry its sources, the compiler can't sneak in a fact that isn't backed by an episode.",
    },
    {
      question: 'Can I retrieve the raw source episodes, not just the compiled memory?',
      answer:
        'Yes. Pass expand: ["episodes"] on the /v1/context call and the response inlines the source episodes alongside the compiled memories, so the agent can cite them and a reviewer can walk them by hand.',
    },
    {
      question: 'Does provenance fix a wrong fact the agent stated?',
      answer:
        'Not automatically, but it makes the fix findable. Pull the bundle the agent saw, walk to the memories in it, walk to the source episodes, and find the conversation turn that planted the wrong fact — then correct or supersede that episode and recompile.',
    },
  ],
  'ai-agent-memory-vs-rag': [
    {
      question: "What's the difference between RAG and AI agent memory?",
      answer:
        "RAG retrieves content the agent doesn't already know — document chunks ranked by cosine similarity. Memory retrieves context the agent has already participated in — episodes and compiled facts ranked by recency, kind, validity, and similarity.",
    },
    {
      question: 'Can I use RAG in place of a memory layer for agent memory?',
      answer:
        "You can stretch it, but three failure modes show up: embedding-nearest isn't decision-relevant (an allergy note won't be the closest embedding to a lunch question), there's no compaction of history into durable facts, and there's no invalidation model for facts that get superseded.",
    },
    {
      question: 'Do I need both RAG and a memory runtime?',
      answer:
        "Most production agents do. The grounding corpus — docs, knowledge base — lives in RAG. The user, account, or project context lives in memory. Trying to make either pattern do the other's job is the common architecture mistake.",
    },
    {
      question: "What does a memory runtime add that a vector store alone doesn't?",
      answer:
        'Three things: compilation (turning raw episodes into typed facts with confidence and validity), deterministic ranking (the same query always returns the same bundle), and provenance (every compiled memory carries the IDs of the episodes it came from).',
    },
    {
      question: 'Is Statewave a RAG framework?',
      answer:
        "No. It uses pgvector under the hood but ships no document loader, chunker, or retriever for grounding over a corpus. It's the who-you're-talking-to layer, meant to run alongside your existing RAG stack rather than replace it.",
    },
    {
      question: 'How do I decide which one to reach for?',
      answer:
        'Look at the shape of the question. "What does our content say about X?" is RAG. "What does this user, agent, or project need to know right now?" is memory.',
    },
  ],
  'persistent-memory-for-ai-support-agents': [
    {
      question: 'How long does it take to add persistent memory to a support agent?',
      answer:
        'About 30 minutes end-to-end: four HTTP calls — record, compile, retrieve, splice — with no memory bookkeeping in the agent itself.',
    },
    {
      question: 'What should I use as the subject ID for a customer?',
      answer:
        "A stable identifier that survives across sessions — a CRM ID, account UUID, or email hash. Avoid the chat session ID; that's per-conversation, and memory needs to outlive the conversation.",
    },
    {
      question: 'How does compilation avoid creating duplicate memories?',
      answer:
        'Compilation is idempotent — running it twice on the same episodes produces no duplicates. That means you can compile after every turn for low latency, or batch it on a timer for lower cost, without worrying about side effects either way.',
    },
    {
      question: 'How much better is this than just concatenating recent chat history?',
      answer:
        'On the eight-criteria support workflow benchmark, a naive prompt-stuffing baseline that concatenates the last N turns scores 2/8. A Statewave-backed agent scores 8/8 on the same dataset and model, with no agent-side memory code.',
    },
    {
      question: 'Does the memory layer replace a knowledge base or RAG stack?',
      answer:
        "No. Product docs, runbooks, and troubleshooting articles still belong in your RAG stack. Statewave handles the who-you're-talking-to layer, not the what-does-the-documentation-say layer.",
    },
    {
      question: 'Why instruct the model to cite source episode IDs?',
      answer:
        'That one instruction is what turns the agent from "AI that confidently makes things up" into one that points at receipts — a reviewer can check the cited episode instead of trusting the claim on faith.',
    },
  ],
  'self-hosted-memory-postgres-pgvector': [
    {
      question: 'Why does Statewave use Postgres and pgvector instead of a dedicated vector database?',
      answer:
        'Transactional consistency. When a compiled memory references its source episodes, that reference can be an enforceable foreign key rather than a best-effort pointer maintained by application code — non-negotiable for a memory layer that needs to stay auditable.',
    },
    {
      question: 'What do you give up by using pgvector instead of Pinecone, Weaviate, Milvus, or Qdrant?',
      answer:
        "Marginal recall-versus-latency on extreme corpora (above roughly 50M vectors with sub-millisecond p99 SLAs), some advanced filtering optimizations, and the vendor's prebuilt management UI. In exchange you get one durable substrate and the entire Postgres operational toolkit.",
    },
    {
      question: 'Can pgvector handle production-scale vector search?',
      answer:
        "Its HNSW index is competitive with dedicated vector databases up into the tens of millions of vectors per index. Statewave hasn't bench-tested above 50M vectors in a single index — that's the scale to validate before committing if you're near it.",
    },
    {
      question: 'What does a production Statewave deployment look like?',
      answer:
        'Two processes: a stateless API server that scales horizontally behind any load balancer, and your own Postgres with pgvector holding all durable state. Backups, replicas, point-in-time recovery, and access control are whatever you already run for Postgres.',
    },
    {
      question: 'Is there a paid tier that unlocks features the open-source version lacks?',
      answer:
        "No. The server, SDKs, and connectors are all Apache-2.0 with no community-versus-enterprise split. What's sold commercially — SLA, indemnity, architecture review, optional managed hosting — doesn't gate any code.",
    },
    {
      question: 'Why not use a separate vector database for embeddings from the start?',
      answer:
        'An early prototype did exactly that. Keeping the two stores in sync — writes, deletes, schema migrations, restores — became about 30% of the code, none of it about memory, and a compile pass touching both stores could never be made atomic.',
    },
  ],
} as const

export const HOWTO_SLUGS: readonly string[] = ['persistent-memory-for-ai-support-agents']
