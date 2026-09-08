/**
 * The question heading must be the last element in <summary>, so the
 * answer paragraph is the next thing a crawler reads after it.
 *
 * Answer engines pair a question heading with the text immediately
 * following it. The chevron used to sit between the two, so all 10
 * homepage questions scored as unanswered in the AEO audit. The fix is
 * DOM order (chevron first, `order-2` putting it back on the right), and
 * it is exactly the kind of thing a later markup tidy-up would undo
 * without anyone noticing — the page looks identical either way.
 */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { FaqAccordion } from '../src/components/FaqAccordion'

const ENTRIES = [
  { question: 'What is Statewave?', answer: 'A memory runtime for AI agents.' },
] as const

describe('FaqAccordion question → answer adjacency', () => {
  it('puts the answer text immediately after the question heading', () => {
    const { container } = render(
      <MemoryRouter>
        <FaqAccordion entries={ENTRIES} />
      </MemoryRouter>,
    )

    const heading = container.querySelector('summary h3')
    expect(heading?.textContent).toBe('What is Statewave?')

    // Nothing may follow the heading inside <summary> — the chevron sits
    // ahead of it in the DOM and is placed on the right with `order-2`.
    expect(heading?.nextElementSibling).toBeNull()

    // Walk the document in order from the heading; the first text of any
    // length that follows must be the answer, not chevron/divider markup.
    const walker = container.ownerDocument.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
    )
    let seenHeading = false
    let firstTextAfter: string | null = null
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim() ?? ''
      if (!seenHeading) {
        if (heading?.contains(walker.currentNode)) seenHeading = true
        continue
      }
      if (text.length >= 20) {
        firstTextAfter = text
        break
      }
    }
    expect(firstTextAfter).toBe('A memory runtime for AI agents.')
  })
})
