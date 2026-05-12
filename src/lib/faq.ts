/* Shared FAQ entries.
 *
 * Used by HomePage to render the visible FAQ section and by the SEO layer to
 * emit FAQPage JSON-LD. Keeping a single source of truth avoids drift between
 * what users see and what AI / search crawlers index.
 *
 * Honesty rule: every answer here must be technically accurate. No marketing
 * claims that the docs / repo wouldn't back up. If a capability is planned but
 * not shipped, don't list it as supported.
 *
 * Each entry may carry a `links` array. The links are presentation-only —
 * they're rendered as a "Learn more" row under the visible answer but are
 * deliberately omitted from the FAQPage JSON-LD (which only needs the
 * question text and the plain answer text).
 */

import type { FaqEntry } from './seo-meta'

export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: 'What is Statewave?',
    answer:
      'Statewave is an open-source memory runtime for AI agents. It records raw events as immutable episodes, compiles them into typed semantic and episodic memories with provenance, and returns ranked, token-bounded context bundles that LLM applications can drop straight into a prompt.',
    links: [
      { label: 'How it works', href: '/product' },
      {
        label: 'Source on GitHub',
        href: 'https://github.com/smaramwbc/statewave',
      },
    ],
  },
  {
    question: 'What is AI memory infrastructure?',
    answer:
      'An AI memory runtime — sometimes called memory infrastructure — is the persistence layer between an LLM application and the long history of users, projects, and decisions it interacts with. Instead of bolting a vector database to a chat history, a memory runtime stores structured memories with confidence scores, validity windows, and provenance, then assembles them into deterministic context bundles for each new question.',
    links: [
      { label: 'Why Statewave', href: '/why' },
      { label: 'How it works', href: '/product' },
    ],
  },
  {
    question: 'How does Statewave give AI agents persistent memory?',
    answer:
      'Your application sends raw events (conversations, tool calls, decisions) to Statewave as episodes scoped to a subject — a user, account, agent, or project. A pluggable compiler turns those episodes into typed memories. When the agent needs to answer a new question, it asks Statewave for context; Statewave ranks the relevant memories and episodes by recency, similarity, kind priority, and temporal validity, then returns a ranked, token-bounded bundle ready for the LLM.',
    links: [
      { label: 'Walk-through diagram', href: '/product#how-it-works' },
      {
        label: 'Getting started (10 minutes)',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md',
      },
    ],
  },
  {
    question: 'How is Statewave different from a vector database?',
    answer:
      'A vector database stores embeddings and returns nearest neighbours. Statewave is a memory runtime that uses a vector store (pgvector) underneath, but adds typed semantic and episodic memories, deterministic ranking with explainable signals, idempotent compilation, provenance back to source episodes, temporal validity windows, conflict resolution, and a token-bounded context-assembly step. It also persists raw episodes append-only so memory can be recompiled.',
    links: [
      { label: 'Comparison vs RAG and prompt stuffing', href: '/why#vs-alternatives' },
      {
        label: 'Ranking and retrieval',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/ranking.md',
      },
    ],
  },
  {
    question: "What's the difference between episodic and semantic memory in Statewave?",
    answer:
      'Episodic memories capture what happened — append-only event records of a conversation, tool call, or decision at a specific time. Semantic memories are typed facts compiled from episodes — profile facts, preferences, procedures, and episode summaries — with confidence scores and validity windows. Statewave returns both in the same context bundle so the agent has long-term knowledge and the recent timeline.',
    links: [
      { label: 'Domain model (episodes, memories, bundles)', href: '/product#domain-model' },
      {
        label: 'Architecture overview',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md',
      },
    ],
  },
  {
    question: 'Can Statewave be self-hosted?',
    answer:
      'Yes. Statewave is designed to be self-hosted. The storage layer is Postgres-only with the pgvector extension. A Docker Compose setup runs the full stack locally in two minutes; production deployments target Fly.io, Railway, or any container platform. There is no managed Statewave cloud — episodes and compiled memories stay in your infrastructure.',
    links: [
      {
        label: 'Deployment guide',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md',
      },
      { label: 'Privacy and data flow', href: '/product#privacy' },
    ],
  },
  {
    question: 'Is Statewave open source? What about commercial use?',
    answer:
      'Yes. The Statewave server is dual-licensed: AGPLv3 for open-source and community use, plus a separate Statewave Commercial License for proprietary, SaaS, embedded, hosted, or enterprise use that conflicts with AGPL §13. A startup-friendly commercial tier is available for early-stage companies, and an enterprise tier covers SLA, indemnity, support, and procurement. The Python and TypeScript SDKs and this marketing site are Apache-2.0. Contact licensing@statewave.ai for commercial terms.',
    links: [
      {
        label: 'Licensing overview (open source + commercial)',
        href: 'https://github.com/smaramwbc/statewave/blob/main/LICENSING.md',
      },
      {
        label: 'Statewave Commercial License',
        href: 'https://github.com/smaramwbc/statewave/blob/main/COMMERCIAL-LICENSE.md',
      },
      {
        label: 'Email licensing@statewave.ai',
        href: 'mailto:licensing@statewave.ai',
      },
    ],
  },
  {
    question: 'Which LLM providers and frameworks does Statewave work with?',
    answer:
      'Statewave is framework-neutral. Compilation goes through LiteLLM, which supports 100+ providers including OpenAI, Anthropic, Azure OpenAI, AWS Bedrock, Google Vertex, Mistral, Groq, Together, and locally hosted models via Ollama or vLLM. The retrieval and context-assembly layer is provider-agnostic — your agent calls Statewave for context, then calls whatever LLM it likes. Python and TypeScript SDKs make integration with custom agents, copilots, and assistant frameworks straightforward.',
    links: [
      {
        label: 'Compiler modes — heuristic vs LLM',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/compiler-modes.md',
      },
      {
        label: 'Python SDK',
        href: 'https://github.com/smaramwbc/statewave-py',
      },
      {
        label: 'TypeScript SDK',
        href: 'https://github.com/smaramwbc/statewave-ts',
      },
    ],
  },
  {
    question: 'Can I use Statewave with Copilot, MCP servers, or LangChain-style agents?',
    answer:
      'Yes — anywhere your agent can make an HTTP call, it can call Statewave. The REST API and SDKs return ranked context bundles ready to splice into a system prompt, a tool result, or a retrieval-augmented chain. There is nothing framework-specific to install on the agent side; you decide where the context goes in your prompt.',
    links: [
      {
        label: 'REST API v1 contract',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md',
      },
      {
        label: 'End-to-end examples',
        href: 'https://github.com/smaramwbc/statewave-examples',
      },
    ],
  },
  {
    question: 'What does Statewave run on?',
    answer:
      'Statewave runs as a Python service backed by Postgres with the pgvector extension. The default deployment is a single container plus a Postgres instance, orchestrated via Docker Compose. OpenTelemetry instrumentation is optional. Embeddings can be hosted (OpenAI, Cohere) or fully local (Ollama, sentence-transformers); the heuristic compiler runs entirely without an LLM if you want a fully local pipeline.',
    links: [
      {
        label: 'Deployment guide',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md',
      },
      {
        label: 'Hardware and scaling',
        href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/hardware-and-scaling.md',
      },
    ],
  },
] as const
