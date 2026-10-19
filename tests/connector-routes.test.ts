/**
 * The /connectors/<slug> routes in lib/seo-meta are a hand-kept list (so the
 * SEO module doesn't pull every connector's content into the main bundle).
 * This keeps that list in step with src/content/connectors: a connector file
 * without a route would never be prerendered or reach the sitemap, and a
 * route without a file would prerender a 404.
 */
import { describe, expect, it } from 'vitest'
import { CONNECTORS, GROUPS } from '../src/content/connectors'
import { CONNECTOR_ROUTES, PAGE_META, PUBLIC_ROUTES } from '../src/lib/seo-meta'

const slugs = CONNECTOR_ROUTES.map((route) => route.slice('/connectors/'.length))

describe('connector routes', () => {
  it('has one route per connector content file', () => {
    expect([...slugs].sort()).toEqual(Object.keys(CONNECTORS).sort())
  })

  it('lists them in the index page order', () => {
    expect(slugs).toEqual(GROUPS.flatMap((g) => g.slugs))
  })

  it('labels each breadcrumb with the connector name', () => {
    for (const route of CONNECTOR_ROUTES) {
      const slug = route.slice('/connectors/'.length)
      expect(PAGE_META[route].breadcrumbLabel).toBe(CONNECTORS[slug].name)
    }
  })

  it('makes every connector page public', () => {
    for (const route of CONNECTOR_ROUTES) expect(PUBLIC_ROUTES).toContain(route)
  })
})
