// @vitest-environment happy-dom
/**
 * Tests for the MarkdownMessage component used to render assistant chat
 * turns. The component is the only path that turns model output into HTML,
 * so the assertions here pin both functional rendering and the safety
 * envelope (allowed schemes, raw HTML stripped, etc).
 *
 * They also exercise MessageBubble end-to-end to confirm assistant turns
 * route through MarkdownMessage while user turns stay plain text — the
 * "model output is the only Markdown source we trust" invariant.
 */

import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ThemeProvider } from '../src/lib/theme'
import {
  MarkdownMessage,
  safeUrl,
} from '../src/components/chat/MarkdownMessage'
import { MessageBubble } from '../src/components/ChatWidget'
import type { ChatMessage } from '../src/lib/widget-context'

// vitest globals are not enabled, so RTL's auto-cleanup doesn't fire.
afterEach(() => cleanup())

function withTheme(node: React.ReactElement) {
  return <ThemeProvider>{node}</ThemeProvider>
}

describe('safeUrl', () => {
  it('allows http and https URLs', () => {
    expect(safeUrl('https://statewave.ai/docs')).toBe('https://statewave.ai/docs')
    expect(safeUrl('http://example.com')).toBe('http://example.com')
  })

  it('allows mailto: and tel: schemes', () => {
    expect(safeUrl('mailto:hello@statewave.ai')).toBe('mailto:hello@statewave.ai')
    expect(safeUrl('tel:+15551234567')).toBe('tel:+15551234567')
  })

  it('allows relative paths and in-page anchors', () => {
    expect(safeUrl('/pricing')).toBe('/pricing')
    expect(safeUrl('#faq')).toBe('#faq')
    expect(safeUrl('?ref=chat')).toBe('?ref=chat')
  })

  it('rejects javascript:, data:, and vbscript: schemes regardless of casing', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull()
    expect(safeUrl('JavaScript:alert(1)')).toBeNull()
    expect(safeUrl('  javascript:alert(1)')).toBeNull()
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(safeUrl('vbscript:msgbox(1)')).toBeNull()
  })

  it('rejects empty / whitespace / non-string inputs', () => {
    expect(safeUrl('')).toBeNull()
    expect(safeUrl('   ')).toBeNull()
    // @ts-expect-error — explicitly testing non-string defense
    expect(safeUrl(undefined)).toBeNull()
  })

  it('rejects bare domains without a scheme (no implicit http://)', () => {
    expect(safeUrl('example.com/foo')).toBeNull()
  })
})

describe('MarkdownMessage rendering', () => {
  it('renders a Markdown link as a clickable anchor', () => {
    render(
      withTheme(
        <MarkdownMessage content="See [Statewave docs](https://statewave.ai/docs) for more." />,
      ),
    )
    const link = screen.getByRole('link', { name: /statewave docs/i })
    expect(link.getAttribute('href')).toBe('https://statewave.ai/docs')
  })

  it('marks external http(s) links target=_blank with rel=noopener noreferrer', () => {
    render(
      withTheme(
        <MarkdownMessage content="[external](https://example.com/page)" />,
      ),
    )
    const link = screen.getByRole('link', { name: 'external' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('does not set target=_blank on mailto: or relative links', () => {
    render(
      withTheme(
        <MarkdownMessage content="[email me](mailto:hi@statewave.ai) or visit [pricing](/pricing)" />,
      ),
    )
    const email = screen.getByRole('link', { name: /email me/i })
    expect(email.getAttribute('href')).toBe('mailto:hi@statewave.ai')
    expect(email.getAttribute('target')).toBeNull()

    const pricing = screen.getByRole('link', { name: /pricing/i })
    expect(pricing.getAttribute('href')).toBe('/pricing')
    expect(pricing.getAttribute('target')).toBeNull()
  })

  it('does not render a clickable href for a javascript: link', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content="[click me](javascript:alert(1))" />,
      ),
    )
    // No <a> for the unsafe link — neither queryByRole nor a tag scan should
    // surface one. The visible text "click me" still renders so the user
    // sees what the model said.
    expect(screen.queryByRole('link', { name: /click me/i })).toBeNull()
    const anchors = container.querySelectorAll('a[href]')
    anchors.forEach((a) => {
      expect(a.getAttribute('href')).not.toMatch(/^javascript:/i)
    })
    expect(container.textContent).toContain('click me')
  })

  it('does not render a clickable href for a data: link', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content="[bad](data:text/html,<script>alert(1)</script>)" />,
      ),
    )
    expect(screen.queryByRole('link', { name: /bad/i })).toBeNull()
    const anchors = container.querySelectorAll('a[href^="data:"]')
    expect(anchors).toHaveLength(0)
  })

  it('renders a bullet list as <ul><li>', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content={'- alpha\n- beta\n- gamma'} />,
      ),
    )
    const ul = container.querySelector('ul')
    expect(ul).not.toBeNull()
    expect(ul!.querySelectorAll('li')).toHaveLength(3)
  })

  it('renders an ordered list as <ol><li>', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content={'1. one\n2. two\n3. three'} />,
      ),
    )
    const ol = container.querySelector('ol')
    expect(ol).not.toBeNull()
    expect(ol!.querySelectorAll('li')).toHaveLength(3)
  })

  it('renders inline code as a <code> element', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content={'Use `npm install` to start.'} />,
      ),
    )
    const code = container.querySelector('code')
    expect(code).not.toBeNull()
    expect(code!.textContent).toBe('npm install')
    // Inline code is not nested inside a <pre>.
    expect(code!.closest('pre')).toBeNull()
  })

  it('renders a fenced code block as <pre><code>', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content={'```ts\nconst x: number = 1\n```'} />,
      ),
    )
    const pre = container.querySelector('pre')
    expect(pre).not.toBeNull()
    const code = pre!.querySelector('code')
    expect(code).not.toBeNull()
    expect(code!.textContent).toContain('const x: number = 1')
  })

  it('renders bold and italic spans', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content="This is **bold** and this is *italic*." />,
      ),
    )
    expect(container.querySelector('strong')?.textContent).toBe('bold')
    expect(container.querySelector('em')?.textContent).toBe('italic')
  })

  it('renders a GFM strikethrough as <del>', () => {
    const { container } = render(
      withTheme(<MarkdownMessage content="~~old~~ new" />),
    )
    expect(container.querySelector('del')?.textContent).toBe('old')
  })

  it('renders a GFM table inside a scrollable wrapper', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage
          content={'| col |\n| --- |\n| val |'}
        />,
      ),
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(table!.querySelectorAll('th')).toHaveLength(1)
    expect(table!.querySelectorAll('td')).toHaveLength(1)
  })

  it('does not render raw HTML from the model output', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage
          content={'before <script>window.__pwn=1</script> <img src=x onerror=alert(1)> after'}
        />,
      ),
    )
    // Raw HTML must be stripped — no <script>, no <img> created from the
    // model's text. The harmful payload is left as visible text instead.
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('does not render an <img> for Markdown image syntax', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content="![pixel](https://example.com/pixel.png)" />,
      ),
    )
    // No <img> ever — images are intentionally dropped to avoid outbound
    // fetches from the model's chosen URL.
    expect(container.querySelector('img')).toBeNull()
    // And no clickable link was created from the image either.
    expect(container.querySelector('a[href*="pixel.png"]')).toBeNull()
  })

  it('renders the image alt text as plain text when present', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage content="Before ![Statewave logo](https://example.com/logo.png) after." />,
      ),
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('Statewave logo')
    expect(container.textContent).toContain('Before')
    expect(container.textContent).toContain('after.')
  })

  it('renders nothing for a Markdown image with empty alt text', () => {
    const { container } = render(
      withTheme(<MarkdownMessage content="![](https://example.com/x.png)" />),
    )
    expect(container.querySelector('img')).toBeNull()
    // No leftover URL or filename in the visible text either.
    expect(container.textContent).not.toContain('example.com')
    expect(container.textContent).not.toContain('x.png')
  })

  it('does not render an image for a data: URL image source', () => {
    const { container } = render(
      withTheme(
        <MarkdownMessage
          content={'![pwn](data:image/svg+xml;base64,PHN2Zy8+)'}
        />,
      ),
    )
    expect(container.querySelector('img')).toBeNull()
    // The href/src must not leak through anywhere as a usable URL.
    expect(container.innerHTML).not.toContain('data:image')
  })

  it('still renders normal Markdown links alongside dropped images', () => {
    render(
      withTheme(
        <MarkdownMessage
          content="![logo](https://example.com/logo.png) See [docs](https://statewave.ai/docs)."
        />,
      ),
    )
    const link = screen.getByRole('link', { name: /docs/i })
    expect(link.getAttribute('href')).toBe('https://statewave.ai/docs')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('survives a very long single-line code block without throwing', () => {
    const huge = 'x'.repeat(20_000)
    expect(() =>
      render(
        withTheme(
          <MarkdownMessage content={'```\n' + huge + '\n```'} />,
        ),
      ),
    ).not.toThrow()
  })
})

describe('MessageBubble Markdown integration', () => {
  function bubble(message: ChatMessage, side: 'stateless' | 'statewave' = 'statewave') {
    return render(
      withTheme(
        <MessageBubble message={message} side={side} isDark={true} compact={false} />,
      ),
    )
  }

  it('renders an assistant Markdown link as a clickable anchor', () => {
    bubble({
      role: 'assistant',
      content: 'Read the [Statewave docs](https://statewave.ai/docs).',
      timestamp: 0,
    })
    const link = screen.getByRole('link', { name: /statewave docs/i })
    expect(link.getAttribute('href')).toBe('https://statewave.ai/docs')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('does NOT interpret user message Markdown — link syntax stays as text', () => {
    const { container } = bubble({
      role: 'user',
      content: 'Check out [evil](javascript:alert(1)) please',
      timestamp: 0,
    })
    // No anchor of any kind for a user turn. The bracket syntax renders
    // verbatim in the bubble.
    expect(container.querySelector('a')).toBeNull()
    expect(container.textContent).toContain('[evil](javascript:alert(1))')
  })
})
