/**
 * One quick-suggestion chip rendered above the chat input.
 *
 * `text` is what the visitor sees and what gets sent on click. `anchors`
 * are short fact tokens (IDs, dates, names, numbers) that the chip is
 * expected to make the agent recall — every anchor MUST appear in the
 * corresponding demo pack's memories+episodes text. The alignment is
 * pinned by tests/chip-fact-alignment.test.ts against the snapshot at
 * tests/fixtures/demo-pack-text.json (regenerate with
 * `node scripts/snapshot-demo-pack-text.mjs` whenever the packs in the
 * statewave repo move).
 */
export interface Suggestion {
  text: string
  anchors: readonly string[]
}

/**
 * Multi-round suggestion chips, keyed by persona id. Each persona has
 * three rounds × three chips — the widget cycles to the next round when
 * the visitor clicks one. Lives at module scope (not inside the
 * component) so the test can import + audit it without rendering.
 *
 * Demo personas (`support-agent`, `coding-assistant`, …) anchor against
 * their respective `demo-<id>` starter pack. The docs-shared persona
 * (`statewave-support`) anchors against `statewave-support-agent`.
 */
export const SUGGESTIONS: Record<
  string,
  ReadonlyArray<ReadonlyArray<Suggestion>>
> = {
  // Northwind Logistics / Maya Hassan
  'support-agent': [
    [
      { text: "Did the SAML cert rotation clear ticket #4821?",
        anchors: ['#4821', 'SAML'] },
      { text: "Is the routing-fleet subject still on the per-region split after #4937?",
        anchors: ['routing-fleet', '#4937', 'per-region'] },
      { text: "Has Henri Laurent been added as a decision-maker on Northwind?",
        anchors: ['Henri Laurent', 'Northwind'] },
    ],
    [
      { text: "What's Northwind's current account tier and renewal date?",
        anchors: ['Team plan', '2026-09-15'] },
      { text: "Did the VAT FR12345678901 update flow through to invoices?",
        anchors: ['FR12345678901', 'VAT'] },
      { text: "Remind me — are we still paging EU on-call directly for high-sev tickets?",
        anchors: ['EU on-call', 'high-sev'] },
    ],
    [
      { text: "What's the timeline on the per-event-type webhook filters request?",
        anchors: ['per-event-type', 'webhook filters'] },
      { text: "Confirm the backfill settings: 200 episodes/call, 4-wide?",
        anchors: ['200 episodes/call', '4-wide'] },
      { text: "Has the customs-clearance use case been logged as a follow-up?",
        anchors: ['customs clearance'] },
    ],
  ],
  // Stratus / Priya
  'coding-assistant': [
    [
      { text: "Did PR #412 close out the auth-middleware refactor?",
        anchors: ['PR #412', 'auth-middleware'] },
      { text: "What was the fix for issue #219's intermittent 500s on the pricing endpoint?",
        anchors: ['#219', 'pricing'] },
      { text: "Is FLAG_DASHBOARD_V2 still at 25% in production?",
        anchors: ['FLAG_DASHBOARD_V2', '25%'] },
    ],
    [
      { text: "Remind me of the review checklist before style nits.",
        anchors: ['review checklist'] },
      { text: "Are we still Tailwind-only — no CSS-in-JS, no styled-components?",
        anchors: ['Tailwind', 'CSS-in-JS'] },
      { text: "Why did ADR-007 land on Postgres + SQLModel for the pricing service?",
        anchors: ['ADR-007', 'Postgres', 'SQLModel'] },
    ],
    [
      { text: "Was the 100-concurrent invariant test in PR #389 the session-pool race fix?",
        anchors: ['PR #389', '100-concurrent'] },
      { text: "Did Olu's first PR — the ADR index — get approved?",
        anchors: ['Olu', 'ADR'] },
      { text: "Is `@stratus/types` ready for the FE + TS SDK after pnpm install?",
        anchors: ['@stratus/types', 'pnpm'] },
    ],
  ],
  'sales-copilot': [
    [
      { text: "What's the status of the Acme Corp expansion deal?",
        anchors: ['Acme'] },
      { text: "Did Cirrus's 60-day PoC with 200 robots kick off?",
        anchors: ['Cirrus', '200 robots', '60-day'] },
      { text: "Is BetaTech's order form still due 2026-05-10?",
        anchors: ['BetaTech', '2026-05-10'] },
    ],
    [
      { text: "Did Acme's expansion close at +$24k ARR with the 15% discount?",
        anchors: ['$24k', '15%'] },
      { text: "What did David Kim ask for — SLA-breach demo + Linear handoff?",
        anchors: ['David Kim', 'SLA-breach', 'Linear'] },
      { text: "Has Delta Health's BAA been counter-signed before PoC kickoff?",
        anchors: ['Delta Health', 'BAA'] },
    ],
    [
      { text: "When's Sarah Chen's next 30-min Tuesday slot?",
        anchors: ['Sarah Chen', 'Tuesday'] },
      { text: "Remind me of our wedge vs Mem0 on Cirrus — deterministic ranking?",
        anchors: ['Mem0', 'deterministic ranking'] },
      { text: "Recap the Q close: $94k ARR breakdown.",
        anchors: ['$94k'] },
    ],
  ],
  // nimbus-api / Riya Patel
  'devops-agent': [
    [
      { text: "Was INC-2026-03-09 fully resolved with PgBouncer + pool=50?",
        anchors: ['INC-2026-03-09', 'PgBouncer'] },
      { text: "Are we still tracking 99.99% against the 99.95% monthly SLA?",
        anchors: ['99.99%', '99.95%'] },
      { text: "Did the lhr scale-up from 1→2 machines on 2026-05-08 hold?",
        anchors: ['lhr', '2026-05-08'] },
    ],
    [
      { text: "Show me the rollback runbook — `fly deploy --image-label <previous>`?",
        anchors: ['image-label', 'fly deploy'] },
      { text: "What did PR #312 cap llm_in_flight at?",
        anchors: ['PR #312', 'llm_in_flight'] },
      { text: "When's the next 90-day secret rotation — 2026-06-12?",
        anchors: ['2026-06-12', '90-day'] },
    ],
    [
      { text: "How long did the last DR drill take? Riya led it.",
        anchors: ['DR drill', 'Riya'] },
      { text: "Did PR #327 add the bluegreen strategy for high-risk migrations?",
        anchors: ['PR #327', 'bluegreen'] },
      { text: "Is Datadog still our pick over Grafana Cloud until the 2027 bill review?",
        anchors: ['Datadog', 'Grafana Cloud', '2027'] },
    ],
  ],
  'research-assistant': [
    [
      { text: "Recap the April 28 experiment: 0.81 vs 0.34 vs 0.62.",
        anchors: ['0.81', '0.34', '0.62'] },
      { text: "Is Section 3 locked since Mei agreed on 2026-04-15?",
        anchors: ['Section 3', 'Mei', '2026-04-15'] },
      { text: "When's the NeurIPS abstract due — 2026-08-15?",
        anchors: ['NeurIPS', '2026-08-15'] },
    ],
    [
      { text: "Compiler-density: LLM 2× density, 1.7× recall vs heuristic — confirm?",
        anchors: ['compiler-density', '1.7×'] },
      { text: "Did Voigt 2026 (temporal validity) make the reading queue?",
        anchors: ['Voigt 2026', 'temporal validity'] },
      { text: "Was Provenance-Bound Retrieval accepted as an ICLR 2026 poster?",
        anchors: ['ICLR 2026', 'Provenance-Bound', 'poster'] },
    ],
    [
      { text: "Cite Park 2024 — Generative Agents, retrieval-time grading?",
        anchors: ['Park 2024', 'Generative Agents'] },
      { text: "Format reminder: Zotero + BibTeX, no Mendeley/Notion?",
        anchors: ['Zotero', 'BibTeX', 'Mendeley'] },
      { text: "Morning reading block still 2× 90m before 11:00 PT?",
        anchors: ['11:00 PT', '90m'] },
    ],
  ],
  // Docs-grounded persona — anchors are facts/tokens that live in the
  // statewave-support-agent pack (the docs subject), not in a per-user
  // memory. The Ask Support entry routes straight here, so prompts are
  // framed as a Statewave user landing on the docs.
  'statewave-support': [
    [
      { text: "How do I get started with Statewave?",
        anchors: ['Statewave', 'Docker'] },
      { text: "How does Statewave memory compile from raw episodes?",
        anchors: ['compilation', 'episodes'] },
      { text: "Which SDK should I install — Python or TypeScript?",
        anchors: ['pip install statewave', 'npm install @statewavedev/sdk'] },
    ],
    [
      { text: "Can I self-host Statewave?",
        anchors: ['self-hosted'] },
      { text: "How is Statewave different from Mem0?",
        anchors: ['Mem0'] },
      { text: "What license is the core server under?",
        anchors: ['AGPL-3.0'] },
    ],
    [
      { text: "What data leaves the box during heuristic compilation?",
        anchors: ['data egress', 'heuristic'] },
      { text: "Can I use an email as a subject ID?",
        anchors: ['emails', 'subject IDs'] },
      { text: "How do I split a too-coarse subject?",
        anchors: ['split', 'too-coarse'] },
    ],
  ],
}
