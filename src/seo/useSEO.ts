/**
 * useSEO — React hook for managing document <head> metadata.
 *
 * This is a CSR (client-side rendering) portfolio with no SSR.
 * All metadata is injected/updated via the DOM after mount.
 *
 * For a single-page site the primary SEO metadata lives in index.html
 * (already set). This hook handles:
 *   1. Runtime <title> / <meta> updates if you ever add section-specific pages.
 *   2. Injecting JSON-LD structured data on mount.
 *   3. Cleanup on unmount to avoid stale tags if routing is ever added.
 *
 * Usage:
 *   useSEO({
 *     title: 'Abishekh Joshi — Photographer',
 *     description: '...',
 *     canonicalUrl: 'https://abishekhjoshi.com.np/',
 *     schemas: [personSchema, webSiteSchema],
 *   })
 */

import { useEffect } from 'react'
import { injectJsonLd, removeJsonLd } from './schema'

export interface SEOConfig {
  /** <title> tag value */
  title?: string
  /** <meta name="description"> */
  description?: string
  /** <link rel="canonical"> */
  canonicalUrl?: string
  /** <meta name="robots"> — defaults to 'index, follow' */
  robots?: string
  /** og:title override — falls back to title */
  ogTitle?: string
  /** og:description override — falls back to description */
  ogDescription?: string
  /** og:image absolute URL */
  ogImage?: string
  /** og:type — defaults to 'website' */
  ogType?: string
  /** twitter:card — defaults to 'summary_large_image' */
  twitterCard?: string
  /**
   * Array of JSON-LD schema objects to inject.
   * Each entry needs a stable `_id` property so the hook can update/remove it.
   */
  schemas?: Array<{ _id: string; [key: string]: unknown }>
}

// ─── Low-level head helpers ──────────────────────────────────────────────────

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSEO(config: SEOConfig): void {
  useEffect(() => {
    const schemaIds: string[] = []

    // Title
    if (config.title) {
      document.title = config.title
    }

    // Description
    if (config.description) {
      setMeta('description', config.description)
    }

    // Robots
    if (config.robots) {
      setMeta('robots', config.robots)
    }

    // Canonical
    if (config.canonicalUrl) {
      setCanonical(config.canonicalUrl)
    }

    // Open Graph
    if (config.title || config.ogTitle) {
      setMeta('og:title', config.ogTitle ?? config.title ?? '', 'property')
    }
    if (config.description || config.ogDescription) {
      setMeta('og:description', config.ogDescription ?? config.description ?? '', 'property')
    }
    if (config.ogImage) {
      setMeta('og:image', config.ogImage, 'property')
    }
    if (config.ogType) {
      setMeta('og:type', config.ogType, 'property')
    }
    if (config.canonicalUrl) {
      setMeta('og:url', config.canonicalUrl, 'property')
    }

    // Twitter / X
    if (config.twitterCard) {
      setMeta('twitter:card', config.twitterCard)
    }
    if (config.title || config.ogTitle) {
      setMeta('twitter:title', config.ogTitle ?? config.title ?? '')
    }
    if (config.description || config.ogDescription) {
      setMeta('twitter:description', config.ogDescription ?? config.description ?? '')
    }
    if (config.ogImage) {
      setMeta('twitter:image', config.ogImage)
    }

    // JSON-LD schemas
    if (config.schemas) {
      for (const schema of config.schemas) {
        const { _id, ...data } = schema
        injectJsonLd(_id, data)
        schemaIds.push(_id)
      }
    }

    // Cleanup: only remove schemas on unmount (meta tags are reused globally)
    return () => {
      for (const id of schemaIds) {
        removeJsonLd(id)
      }
    }
    // Intentionally shallow: config object reference drives re-runs.
    // Consumers should memoize config or pass stable references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.title,
    config.description,
    config.canonicalUrl,
    config.robots,
    config.ogTitle,
    config.ogDescription,
    config.ogImage,
    config.ogType,
    config.twitterCard,
    // schemas array: use JSON string for stable comparison without deep-equal lib
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(config.schemas),
  ])
}
