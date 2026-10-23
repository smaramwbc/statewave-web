import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { CREDIBILITY_STATS, useGithubStars } from '../src/lib/credibility-stats'

const snapshot = CREDIBILITY_STATS.github_stars

describe('useGithubStars', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('starts from the committed snapshot', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}))
    const { result } = renderHook(() => useGithubStars())
    expect(result.current).toBe(snapshot)
  })

  it('swaps in the live count', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: true, json: () => Promise.resolve({ stargazers_count: 4242 }) }))
    const { result } = renderHook(() => useGithubStars())
    await waitFor(() => expect(result.current).toBe(4242))
  })

  it('keeps the snapshot on rate limit and offline', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) }))
    const limited = renderHook(() => useGithubStars())
    await new Promise((r) => setTimeout(r, 20))
    expect(limited.result.current).toBe(snapshot)

    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')))
    const offline = renderHook(() => useGithubStars())
    await new Promise((r) => setTimeout(r, 20))
    expect(offline.result.current).toBe(snapshot)
  })
})
