# Copilot / AI agent instructions for `statewave-web`

These conventions should be followed when generating or modifying code in this
repository. They reflect deliberate UI/UX decisions, not stylistic preferences.

---

## Heading anchors (mandatory for all section titles)

Every `<h1>` / `<h2>` / `<h3>` that introduces a navigable section of a page
**must** be rendered with the `<Heading>` component
([`src/components/Heading.tsx`](../src/components/Heading.tsx)) — never as a
raw `<h2>` tag.

```tsx
import { Heading } from '../components/Heading'

// Correct
<Heading id="core-loop" className="text-2xl font-bold text-theme-primary mb-12">
  The core loop
</Heading>

// Incorrect — no anchor affordance, no shareable link
<h2 className="text-2xl font-bold text-theme-primary mb-12">The core loop</h2>
```

### Why
Visitors should be able to deep-link any section of the marketing site. The
component renders a permanently visible `#` icon next to the title; clicking
it copies an absolute URL with the section hash to the clipboard. Without it,
sharing a specific subsection means screenshotting or asking a teammate to
scroll.

### Rules
1. **Always pass an explicit `id`.** Slug-style: lowercase, dashes, no stop
   words. Stable across copy edits — once shipped, the id is part of the URL
   contract. Examples: `core-loop`, `privacy`, `who-this-is-for`,
   `vs-alternatives`.
2. **One id per page.** Don't reuse an id between two `<Heading>` instances
   or between a `<Heading>` and a `<Section id=...>` — duplicate ids are
   invalid HTML and break browser anchor resolution.
3. **Default `level` is 2.** Pass `level={1 | 3 | 4}` when needed. Page-title
   `<h1>` doesn't need `<Heading>` (a hero title is rarely deep-linked).
4. **Inherit existing typography** via `className` — pass the same Tailwind
   classes the original `<h2>` used. The component does not impose a font
   size or weight; it only adds the anchor button.
5. **`scroll-mt-20` is built in** so anchor jumps land below the fixed
   navbar. Do not add scroll offsets to the className.

### When NOT to use `<Heading>`
- Inside the chat widget, or any other floating / modal UI where the URL
  hash isn't meaningful.
- For decorative typography that isn't an actual section header
  (e.g. a hero subline styled like an h2 but not introducing a section).

---

## Cursor affordances (handled globally)

`src/index.css` declares site-wide cursor rules:

- `<button>`, `<a href>`, `[role="button"]`, `<summary>`, `<label for=…>`,
  checkboxes, radios → `cursor: pointer`
- Disabled / `aria-disabled="true"` controls → `cursor: not-allowed`

You don't need to add per-element `cursor-pointer` Tailwind utilities —
they're redundant with the global rule. Only override when the element
should *not* feel clickable (e.g. a static badge styled like a chip).

---

## Demo CTA tracking

Any page-level "Try the demo" / "Live Demo" CTA must register itself with
`useTrackDemoCta(ref)` (see [`src/lib/widget-context.tsx`](../src/lib/widget-context.tsx)).
The floating chat-launcher hides itself while a tracked CTA is in the
viewport so visitors don't see the same affordance twice.

```tsx
import { useTrackDemoCta } from '../lib/widget-context'

const ctaRef = useRef<HTMLButtonElement>(null)
useTrackDemoCta(ctaRef)
return <button ref={ctaRef} onClick={openWidget}>Try the demo</button>
```

---

## Confirmation dialogs

Never use `window.confirm()` or `window.alert()` for destructive actions —
they break the visual frame. Use a themed in-widget modal instead
(see the reset-memory dialog in
[`src/components/ChatWidget.tsx`](../src/components/ChatWidget.tsx) for the
canonical pattern).

---

## External docs links

When a feature or claim has matching documentation in
`statewave-docs`, link to it directly with `target="_blank"
rel="noopener noreferrer"`. Don't paraphrase doc content into the page when
a link will do — the docs are the source of truth.

Common destinations:

- Compiler modes → `architecture/compiler-modes.md`
- Privacy & data flow → `architecture/privacy-and-data-flow.md`
- Ranking → `architecture/ranking.md`
- Hardware & scaling → `deployment/hardware-and-scaling.md`
- API reference → `api/v1-contract.md`
- Getting started → `getting-started.md`
- Python SDK → repo `smaramwbc/statewave-py`
- TypeScript SDK → repo `smaramwbc/statewave-ts`

---

## Language: English-only, with one exception

The entire marketing site is in **English**. Every page, every section, every
card, every CTA, every microcopy string. Do not localize, translate, or add
non-English copy anywhere — even when the user's request is ambiguous about
language scope.

### The single exception: the manifesto on `/why`

The "Why we built Statewave" manifesto in
[`src/pages/WhyPage.tsx`](../src/pages/WhyPage.tsx) (rendered by
`ManifestoHero`) is the **only** translatable surface on the site. It has its
own translations table in
[`src/lib/manifesto-i18n.ts`](../src/lib/manifesto-i18n.ts) and a dedicated
language picker.

Rules for the manifesto:

- All strings live in `MANIFESTO_TRANSLATIONS` keyed by language code.
- The picker auto-detects `navigator.language` on first load and persists the
  user's choice to `localStorage` under `statewave:manifesto-lang`.
- The brand name **Statewave** is never translated. Other proper nouns stay
  in their natural rendering for each language.
- Translations are poetic, not literal. If a phrase doesn't carry in the
  target language, rewrite it so it does — the throughline ("only memories
  matter") must land emotionally in every locale, not just be grammatically
  correct.

If a future request asks to translate any other part of the site, push back
and confirm — that's a deliberate scope expansion, not a default.

<!-- statewave:begin (managed by `statewave-connectors mcp init`) -->
**Statewave memory** — MCP server `statewave`, subject `repo:smaramwbc.statewave-web`.
Before answering questions about this project, call `statewave_get_context` (that subject, `query` = the ask) and ground your answer in it.
When the user states a durable fact or decision, call `statewave_ingest_episode` then `statewave_compile_subject` (same subject). Never invent Statewave results.
<!-- statewave:end -->
