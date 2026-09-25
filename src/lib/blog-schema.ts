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
        "Score it on a task rather than on recall. The support workflow benchmark scores an agent on eight criteria that map to real support concerns — identity persistence across sessions, preference surfacing, token budget compliance, provenance tracing, idempotent compilation, session-aware ranking, repeat-issue detection, and explainable health scoring. The harness is open source, so run it against your own stack and read the criteria rather than anyone's score.",
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
  'token-bounded-context-assembly': [
    {
      question: 'What is a good token budget for agent memory?',
      answer:
        "Between 600 and 1,200 tokens covers most agent workloads, which is enough for five to eight compiled facts. Statewave's server default is 4,000, and its own reference application runs at 800. Instrument your utilization ratio first, because if you are consistently below 85% of your budget, the budget is not what is limiting your agent.",
    },
    {
      question: 'Is token-bounded assembly the same as context compaction?',
      answer:
        'No. Compaction summarizes history when the window fills, usually with an LLM call, which means the output varies run to run. Bounded assembly selects whole pre-compiled facts by score against a fixed ceiling and returns nothing that does not fit. One compresses what exists; the other decides what is admitted.',
    },
    {
      question: 'Does a 1M-token context window make this unnecessary?',
      answer:
        "No, for two reasons. Model accuracy still depends on where information sits in the context, per Liu et al.'s Lost in the Middle, so a mostly-full window degrades rather than helps. And you are billed for every token on every call, so an unbounded prompt is an unbounded per-turn cost.",
    },
    {
      question: 'How do I know which memories were left out and why?',
      answer:
        "You need an assembly-time record, because reconstructing it later gives you today's memory state rather than the one that was used. With receipt emission enabled, Statewave writes a receipt per context call containing the included memory IDs, an integrity hash, and the policy bundle in force. Emission and HMAC signing are both opt-in, so turn them on before you need the record. Its log_only policy mode records what a rule would have excluded without actually excluding it.",
    },
    {
      question: 'Can several agents share one memory store without contradicting each other?',
      answer:
        "Yes, if conflicts are resolved at compile time rather than at prompt time. Statewave's compiler compares registered single-valued claims directly and otherwise supersedes an older memory when word overlap with a newer one reaches a Jaccard score of 0.6, recording the supersession with links to both source episodes. Agents then read only active memories, so the stale fact never enters any bundle.",
    },
    {
      question: 'Does this work with my model provider?',
      answer:
        'Any of them, if the assembler is a separate service. The assembled context is a plain string that goes into a system prompt, so the layer is provider-agnostic. Statewave routes its own optional LLM compiler through LiteLLM, which covers OpenAI, Anthropic, Azure, Bedrock, Ollama, and around a hundred others.',
    },
  ],
  'idempotent-compilation-and-conflict-resolution': [
    {
      question: 'What is the difference between idempotency and deduplication?',
      answer:
        'Deduplication is one way to achieve idempotency, not a synonym for it. Deduplication suppresses a repeat by checking a marker or a key. Idempotency is the broader property that repeating an operation does not change the result, which you can also get by making the operation derive state rather than append to it. A compile step that recomputes current state from the full event log is idempotent without deduplicating anything.',
    },
    {
      question: 'Should my idempotency key expire?',
      answer:
        "Not if it is derived from the event itself. TTLs exist to stop a marker table from growing without bound, which is a real concern for randomly generated keys. A key derived from the event's logical identity or content hash is a property of the record rather than a side table, so it costs nothing to keep and it still works when a backfill re-reads a two-year-old ticket.",
    },
    {
      question: 'How do I know if two memories are actually in conflict?',
      answer:
        "Statewave's compiler checks registered single-valued claim keys first, which catches a contradiction however it is worded, and falls back to Jaccard word overlap with a default threshold of 0.6 for everything else. Check the results against real data. The failure mode to watch for is false positives on the lexical path, where a temporary state such as travel looks like it contradicts a durable fact such as home location.",
    },
    {
      question: 'Should I delete the older fact once it is superseded?',
      answer:
        'No. Mark it superseded and filter it out at read time. Deleting removes the evidence that a disagreement ever existed, which is the exact record you need when debugging an unexpected output or answering an audit question. Statewave tracks three states per entry: active, superseded, tombstoned.',
    },
    {
      question: 'Can I compile after every message?',
      answer:
        'You can, but do not in production. Compilation is idempotent, which means you can batch it safely: run it after every N episodes or on a schedule. Statewave supports async compilation that returns a job ID you can poll, which keeps the derivation off the request path.',
    },
    {
      question: 'Does this work if two agents write at the same time?',
      answer:
        'Yes, and it is the case the design targets. Both writes land as append-only episodes, so neither is lost. Conflict resolution happens at compile time rather than write time, which means concurrency does not need a lock on the write path. If you want the conflict prevented instead of resolved, have each agent read compiled context before it acts.',
    },
  ],
  'ai-support-agent-session-state': [
    {
      question: 'What is a session-aware AI support agent?',
      answer:
        "A support agent whose retrieval step reads the state of the current ticket, not just the customer's history. It knows which session is active, which are resolved, what has already been tried, and whether the current problem matches a prior one. That state adjusts the ranking of every candidate before the context bundle is assembled.",
    },
    {
      question: 'What is the difference between a session ID and a subject ID?',
      answer:
        'The subject ID identifies the customer and must survive across every conversation, so use a CRM ID, account UUID, or email hash. The session ID identifies one support interaction and is usually your ticket or conversation ID. Using the session ID as the subject is the most common build error, because memory then dies when the conversation ends.',
    },
    {
      question: 'Does session-aware ranking replace semantic search?',
      answer:
        'No, they operate on different objects. Embedding similarity ranks compiled memories, contributing up to 8 points. Session state ranks raw episodes, contributing up to 14. Both appear in the same bundle, which is why the agent gets long-term facts and the live timeline together.',
    },
    {
      question: 'Why does my agent keep re-solving problems it already fixed?',
      answer:
        'Almost always because resolved sessions are being closed without a resolution_summary. A matching closed session with a summary scores +6 against its −5 penalty and surfaces at net +1. Without a summary it scores +4 and stays at net −1, below neutral and outside the token budget.',
    },
    {
      question: 'How do you measure whether session-awareness is working?',
      answer:
        'Run the eight-criteria support workflow benchmark. It scores identity persistence across sessions, preference surfacing, token budget adherence, provenance tracing, idempotent compilation, session-aware ranking of active sessions, repeat-issue detection, and deterministic health scoring. Run it against your own stack before you run it against ours: the criteria are the transferable part, and the harness is open source, so the scoring is inspectable rather than asserted.',
    },
    {
      question: 'Can a session-aware agent hand off to a human mid-ticket?',
      answer:
        "Yes, that is what the handoff pack is for. POST /v1/handoff returns a token-bounded brief with the customer's profile facts, the active issue, the steps already attempted, related history, and the health score with its contributing factors. It also emits a receipt, so the human can see exactly what the agent had in context.",
    },
  ],
  'repeat-issue-detection-customer-support-automation': [
    {
      question: 'What is repeat-issue detection in customer support automation?',
      answer:
        "It is a retrieval mechanism that recognizes when a customer's current problem matches one you already closed, and lifts that closed session back into the agent's context. Without it, resolved sessions are deliberately deprioritized so old tickets do not crowd out live ones, which means the prior fix is hidden at the exact moment it is most useful.",
    },
    {
      question: 'How does Statewave decide two issues are the same?',
      answer:
        'It extracts meaningful keywords from the live session and task text, does the same for each resolved session including its resolution summary, and computes what fraction of the current keywords appear in the prior set. If that fraction reaches 0.30, the prior session is boosted.',
    },
    {
      question: 'Do I need an LLM or embeddings for repeat-issue detection?',
      answer:
        'No. This path is lexical and runs with no model call. Compilation and semantic search can use any of the LiteLLM-supported providers, but repeat detection itself works with the default heuristic compiler and no API key.',
    },
    {
      question: 'Why does my prior fix still not show up?',
      answer:
        "Two common causes. The resolution record has no resolution_summary, which caps the boost at +4.0 against a -5.0 penalty and leaves it net negative. Or the customer described the problem in entirely different words, dropping the overlap below 0.30. Rewriting the summary to include the customer's own phrasing addresses both.",
    },
    {
      question: 'Can I tune the overlap threshold or the boost values?',
      answer:
        'Not today. The weights are constants in server/services/context.py with no per-tenant override, a deliberate choice to keep ranking deterministic and reproducible. You can scope requests by subject, filter /v1/memories/search results by kind, or modify the context assembler in your own self-hosted deployment.',
    },
    {
      question: 'Does resolution tracking affect anything besides retrieval?',
      answer:
        'Yes. The same record feeds the customer health score, SLA resolution-time and breach calculations, and the handoff pack that a human or another agent receives on escalation. One skipped write degrades all four surfaces.',
    },
  ],
  'open-source-alternatives-to-mem0': [
    {
      question: 'Is Mem0 open source?',
      answer:
        "Yes, Mem0's SDK is Apache-2.0. However, Mem0's Platform vs Open Source page lists capabilities that exist only on the hosted Platform, including graph memory, temporal reasoning and webhooks. By our count there are 14 of them (as of September 2026). Mem0 also says its published benchmark scores reflect platform-only optimizations.",
    },
    {
      question: "Does Mem0's open-source version support graph memory?",
      answer:
        "No. The v3 pipeline removed the Neo4j, Memgraph, Kuzu, Apache AGE and Neptune drivers from the OSS SDK. Mem0's migration guide points OSS users who need graph memory to the paid Platform.",
    },
    {
      question: 'Can I migrate from Mem0 to Statewave without rewriting my agent?',
      answer:
        "Mostly, yes. Mem0's user_id becomes a Statewave subject_id, add becomes an episode write, and search becomes a context request. Statewave's docs describe a bulk migration that carries each original Mem0 memory ID in the episode's provenance, so you can trace each memory back to where it came from.",
    },
    {
      question: 'Are LoCoMo and LongMemEval scores comparable across vendors?',
      answer:
        "Only when the benchmark code, models and judge are identical. The same system can score very differently on different setups. Statewave's comparison runs all three backends through one benchmark suite with gpt-4o as answerer and judge, and anyone can rerun it.",
    },
    {
      question: 'Which Mem0 alternative runs fully offline?',
      answer:
        "Statewave's heuristic compiler runs entirely locally with the embedding provider set to none or stub, and no data leaves your network. Supermemory local and LangMem with local models can also run offline, though with the limits described above.",
    },
    {
      question: 'Is Zep still open source?',
      answer:
        'Zep stopped maintaining its self-hosted Community Edition. Its open-source work now goes into Graphiti, a temporal knowledge graph library you run on your own graph database.',
    },
  ],
  'customer-health-score-handoff-context-packs': [
    {
      question: 'What is a good customer health score?',
      answer:
        'In Statewave, 70 or above is healthy, 40 to 69 is watch, and under 40 is at_risk. The band matters more than the exact number, because the factor list explains every point and the webhooks fire on band changes. Other platforms let admins set their own thresholds, so compare bands rather than raw scores across tools.',
    },
    {
      question: "Does Statewave's customer health score use AI or machine learning?",
      answer:
        'No. The score is fixed arithmetic over support signals, with no model call and nothing stored in the scoring path. The same history at the same moment always returns the same score and the same factors, which is what makes it safe to put in an escalation brief.',
    },
    {
      question: 'How often is the customer health score updated?',
      answer:
        'It is computed on demand, each time you call the health endpoint or generate a handoff pack. Because two signals depend on elapsed time, the score can change between calls without new activity. Run a scheduled health request for accounts with open tickets if you need timely alerts.',
    },
    {
      question: 'Can I change the health score weights or thresholds?',
      answer:
        'Not through configuration. The weights, caps, and 70 and 40 band thresholds are constants in health.py, so changing them means running a modified build. The separate /v1/subjects/{subject_id}/sla endpoint does accept custom first-response and resolution thresholds as query parameters.',
    },
    {
      question: 'How is a handoff context pack different from an AI-written conversation summary?',
      answer:
        'A handoff pack is assembled from stored memory and ticket state without calling a model, so it cannot invent a detail that was never recorded. It stays inside a fixed token budget, keeps sections in priority order, and can emit a receipt that records exactly what was delivered. A model-written summary can read more smoothly, but it cannot show you afterward what it left out.',
    },
  ],
  'zep-alternatives': [
    {
      question: 'Is Zep open source?',
      answer:
        'The current Zep managed product is commercial. Graphiti, its temporal graph engine, is open source under Apache-2.0. The former Zep Community Edition is deprecated and unsupported.',
    },
    {
      question: 'What is the closest open-source Zep alternative?',
      answer:
        "Graphiti is the closest engine-level alternative because it implements Zep's temporal graph model. Statewave is closer when the goal is a self-hosted subject-memory service without a graph database.",
    },
    {
      question: 'Is Graphiti a drop-in replacement for Zep Cloud?',
      answer:
        'No. It provides graph construction and retrieval. Your application must supply user and thread management, authentication, scaling, operations, and the product controls around the graph.',
    },
    {
      question: 'How does Zep pricing change with episode size?',
      answer:
        'Every 350 bytes or part consumes one credit. At 15,000 monthly episodes, 300-byte payloads use 15,000 credits, while 3,500-byte payloads use 150,000 credits.',
    },
    {
      question: 'Can Statewave model temporal facts?',
      answer:
        'Statewave memories have validity windows and conflict handling. Statewave extracts entities per memory to improve retrieval, but it does not model relationships between them or support graph traversal. Use Graphiti when graph traversal is a core query pattern.',
    },
  ],
} as const

export const HOWTO_SLUGS: readonly string[] = ['persistent-memory-for-ai-support-agents']
