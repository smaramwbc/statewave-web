/**
 * The homepage hero chat must never show an error or a long spinner: a slow
 * or failed live reply gives way to the recorded conversation.
 */
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../src/lib/widget-context-api'

const chat = {
  statewaveMessages: [] as ChatMessage[],
  isLoading: false,
  sendMessage: vi.fn(),
  clearChat: vi.fn(),
  enterSupportChannel: vi.fn(),
}
vi.mock('../src/lib/widget-context-api', () => ({ useChatWidget: () => chat }))

const { HeroChat } = await import('../src/components/home/HeroChat')

const user = (content: string): ChatMessage => ({ role: 'user', content, timestamp: 1 })
const RECORDED_NOTE = 'A recorded answer from Statewave Support.'

describe('HeroChat fallback', () => {
  beforeEach(() => {
    chat.statewaveMessages = []
    chat.isLoading = false
  })
  afterEach(() => vi.useRealTimers())

  it('shows a live reply as-is', () => {
    chat.statewaveMessages = [user('hi'), { role: 'assistant', content: 'live answer', timestamp: 2 }]
    render(<HeroChat />)
    expect(screen.getByText('live answer')).toBeTruthy()
    expect(screen.queryByText(RECORDED_NOTE)).toBeNull()
  })

  it.each([
    ['network failure', { error: true, content: 'Connection lost. Tap Retry to send again.' }],
    ['non-2xx reply', { failed: true, content: 'Demo cap reached. Click "Reset demo memory".' }],
  ])('swaps a %s for the recorded conversation', (_, bad) => {
    chat.statewaveMessages = [user('hi'), { role: 'assistant', timestamp: 2, ...bad }]
    render(<HeroChat />)
    expect(screen.getByText(RECORDED_NOTE)).toBeTruthy()
    expect(screen.queryByText(bad.content)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
  })

  it('drops the typing indicator for the recorded conversation after 8s', () => {
    vi.useFakeTimers()
    chat.statewaveMessages = [user('hi')]
    chat.isLoading = true
    render(<HeroChat />)
    expect(screen.getByLabelText('Statewave Support is typing')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(8000) })
    expect(screen.queryByLabelText('Statewave Support is typing')).toBeNull()
    expect(screen.getByText(RECORDED_NOTE)).toBeTruthy()
  })
})
