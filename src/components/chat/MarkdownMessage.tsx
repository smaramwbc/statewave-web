/**
 * MarkdownMessage — safe Markdown rendering for assistant chat bubbles.
 *
 * Used by MessageBubble to render assistant turns. User turns stay as plain
 * text (rendered as a React string child) so a visitor cannot inject formatting
 * or links into their own messages — the model output is the only Markdown
 * source we trust.
 *
 * Security posture:
 *  - Raw HTML in the model's text is intentionally NOT rendered. react-markdown
 *    parses Markdown into a hast tree and refuses to lift through embedded
 *    <script>, <iframe>, <img onerror>, etc. We never enable rehype-raw and
 *    never use dangerouslySetInnerHTML.
 *  - Anchor hrefs flow through `safeUrl`, which only allows http(s):, mailto:,
 *    tel:, fragments, and same-origin relative paths. Anything else (notably
 *    javascript:, data:, vbscript:) is dropped, leaving the link label as
 *    inert text — the model can't produce a clickable XSS vector.
 *  - GFM is on (tables, strikethrough, task lists, autolinks). Autolinks still
 *    pass through `safeUrl`.
 */

import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Decide whether a Markdown link's href is safe to render as a real anchor.
 *
 * The check runs on the parsed URL string the renderer is about to emit, not
 * on the user's typed text — so things like leading/trailing whitespace and
 * URL-encoded prefixes are already normalized. Returning `null` causes the
 * renderer to drop the href; the link's visible text still renders, just as
 * inert text instead of a clickable target.
 */
export function safeUrl(url: string): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed === '') return null

  // Relative paths and in-page anchors are always safe in this context — the
  // chatbot lives inside our own site, so a `/pricing` or `#faq` link points
  // at us.
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?')
  ) {
    return trimmed
  }

  // For absolute URLs, pull the scheme off the front and allowlist it. We
  // don't try to resolve the URL — schemes like `javascript:` are dangerous
  // regardless of the rest of the string.
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed)
  if (!schemeMatch) {
    // No scheme and not relative — treat as a bare domain (e.g. `example.com`).
    // We can't safely turn this into a real link without guessing the scheme,
    // so drop the href and let the label render as text.
    return null
  }

  const scheme = schemeMatch[1].toLowerCase()
  const ALLOWED = new Set(['http', 'https', 'mailto', 'tel'])
  if (!ALLOWED.has(scheme)) return null
  return trimmed
}

/**
 * True for anchors that point off-site. http(s) links are external; mailto:
 * and tel: aren't really "external" in the new-tab sense, so we leave them
 * with default target behavior.
 */
function isExternalHttpUrl(url: string): boolean {
  return /^https?:/i.test(url)
}

const components: Components = {
  a({ href, children, ...rest }) {
    const safe = typeof href === 'string' ? safeUrl(href) : null
    if (!safe) {
      // Drop the href entirely. A <span> (not <a>) makes it clear to assistive
      // tech that there's nothing to follow here.
      return <span {...rest}>{children}</span>
    }
    const external = isExternalHttpUrl(safe)
    return (
      <a
        {...rest}
        href={safe}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
  // Code blocks come through as <pre><code>...</code></pre>. We style the
  // <pre> as the scroll container; the inner <code> stays unstyled so block
  // and inline code don't fight each other for padding.
  code({ children, className, ...rest }) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
  // Markdown images are intentionally unsupported. Rendering an <img> would
  // (a) trigger an outbound fetch to whatever URL the model emits — a low-effort
  // tracking-pixel/SSRF-from-the-browser vector — and (b) widen the render
  // surface for data: URL payloads. Drop the <img> entirely; if the model
  // wrote alt text, surface it as plain text so the message still reads.
  img({ alt }) {
    return alt ? <span>{alt}</span> : null
  },
}

interface MarkdownMessageProps {
  content: string
  /** Optional extra classes for the wrapper, e.g. for compact mode sizing. */
  className?: string
}

/**
 * Tailwind arbitrary-variant classes that style the rendered Markdown tree.
 * These apply to descendants only, so the wrapper itself remains plain.
 *
 * Spacing is tuned for chat bubbles, not docs prose: paragraphs sit at my-2
 * (not my-4) so a multi-paragraph reply doesn't blow out the bubble height.
 * Lists indent at pl-5 — enough to make the bullet/number obvious without
 * eating into the bubble's already-narrow width on mobile.
 */
const PROSE_CLASSES = [
  // Paragraph rhythm — first/last reset removes leading/trailing margin so
  // the bubble's own padding controls the outer spacing.
  '[&_p]:my-2',
  '[&_p:first-child]:mt-0',
  '[&_p:last-child]:mb-0',
  // Lists
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-0.5',
  '[&_li>p]:my-0',
  // Headings (rare in chat — keep them present but understated)
  '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:my-2',
  '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:my-2',
  '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1.5',
  // Inline emphasis
  '[&_strong]:font-semibold [&_strong]:text-theme-primary',
  '[&_em]:italic',
  '[&_del]:line-through [&_del]:opacity-70',
  // Links — accent color, underlined for affordance, still readable on the
  // accent-tinted bubble background.
  '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2',
  '[&_a]:break-words',
  'hover:[&_a]:text-accent-light focus-visible:[&_a]:text-accent-light',
  // Inline code — subtle chip. Background uses theme-code-bg so it adapts to
  // light/dark without us re-declaring colors per theme here.
  '[&_:not(pre)>code]:rounded',
  '[&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5',
  '[&_:not(pre)>code]:bg-[var(--theme-code-bg)]',
  '[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.92em]',
  '[&_:not(pre)>code]:text-theme-primary',
  // Code blocks — scrollable, never break the bubble width. We wrap inside
  // the <pre> so single very long tokens still scroll instead of escaping.
  '[&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:p-3',
  '[&_pre]:bg-[var(--theme-code-bg)]',
  '[&_pre]:overflow-x-auto',
  '[&_pre]:text-[0.85em] [&_pre]:leading-snug',
  '[&_pre_code]:font-mono [&_pre_code]:text-theme-primary',
  // Blockquotes
  '[&_blockquote]:my-2 [&_blockquote]:pl-3',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-theme-border',
  '[&_blockquote]:text-theme-muted',
  // GFM tables — wrap the table itself in a horizontal scroll so wide tables
  // don't push the bubble out.
  '[&_table]:my-2 [&_table]:w-full [&_table]:text-left [&_table]:border-collapse [&_table]:block [&_table]:overflow-x-auto',
  '[&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold [&_th]:border-b [&_th]:border-theme-border',
  '[&_td]:px-2 [&_td]:py-1 [&_td]:border-b [&_td]:border-theme-border/60',
  // Horizontal rule
  '[&_hr]:my-3 [&_hr]:border-theme-border',
].join(' ')

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  // Wrapper carries the prose-shaped descendant styles. We keep the
  // ReactMarkdown call default-safe: no rehype-raw, no allowDangerousHtml.
  return (
    <div className={className ? `${PROSE_CLASSES} ${className}` : PROSE_CLASSES}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => safeUrl(url) ?? ''}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
