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
