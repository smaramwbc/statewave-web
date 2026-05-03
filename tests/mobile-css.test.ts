/**
 * Light static check on the global CSS sheet.
 *
 * happy-dom does not parse @layer or env() rules well enough to assert on
 * computed style, so we verify the source declarations are present. That
 * is enough to catch a regression where someone deletes the mobile-only
 * utilities or the body scroll-lock hook.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cssPath = resolve(__dirname, '../src/index.css')
const css = readFileSync(cssPath, 'utf-8')

describe('global stylesheet — mobile contract', () => {
  it('exposes safe-area utilities for notched devices', () => {
    expect(css).toMatch(/\.pt-safe\s*\{[^}]*env\(safe-area-inset-top\)/)
    expect(css).toMatch(/\.pb-safe\s*\{[^}]*env\(safe-area-inset-bottom\)/)
    expect(css).toMatch(/\.pl-safe\s*\{[^}]*env\(safe-area-inset-left\)/)
    expect(css).toMatch(/\.pr-safe\s*\{[^}]*env\(safe-area-inset-right\)/)
  })

  it('exposes the .tap-target utility at the WCAG 44px floor', () => {
    expect(css).toMatch(/\.tap-target\s*\{[^}]*min-height:\s*44px/)
    expect(css).toMatch(/\.tap-target\s*\{[^}]*min-width:\s*44px/)
  })

  it('declares the body scroll-lock hook used by the mobile drawer', () => {
    expect(css).toMatch(/data-scroll-lock="true"/)
    expect(css).toMatch(/overflow:\s*hidden/)
  })

  it('respects prefers-reduced-motion at the document root', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  })
})
