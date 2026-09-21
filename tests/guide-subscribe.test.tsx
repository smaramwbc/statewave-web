/**
 * The Statewave Guide subscribe form rides on /api/launch-signup, the same
 * hardened endpoint as /launch. What has to hold on the client side: a bad
 * address never reaches the network, a good one is posted with the fields
 * the endpoint expects plus the `source` that lets Guide readers be
 * segmented later, and the failure an unconfigured endpoint returns (503)
 * reads as something a person can act on.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { GuideSubscribe } from '../src/components/GuideSubscribe'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function mount() {
  render(
    <MemoryRouter>
      <GuideSubscribe />
    </MemoryRouter>,
  )
  const input = screen.getByLabelText('Email address')
  const button = screen.getByRole('button', { name: 'Subscribe' })
  return { input, button }
}

describe('GuideSubscribe', () => {
  it('rejects a malformed address without calling the endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { input, button } = mount()
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('posts to the shared signup endpoint with the Guide source', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    const { input, button } = mount()
    fireEvent.change(input, { target: { value: 'reader@example.com' } })
    fireEvent.click(button)

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/launch-signup')
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({
      email: 'reader@example.com',
      hp_company_url: '',
      source: 'statewave-guide',
    })
    expect(await screen.findByRole('status')).toHaveTextContent(/subscribed/i)
  })

  it('explains an unconfigured endpoint instead of failing silently', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 503 }))
    const { input, button } = mount()
    fireEvent.change(input, { target: { value: 'reader@example.com' } })
    fireEvent.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent(/aren.t available right now/i)
  })
})
