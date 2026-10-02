/**
 * JSON-LD structured data generators for Abishekh Joshi's portfolio.
 *
 * All generators return plain objects that are safe to JSON.stringify() and
 * inject as <script type="application/ld+json"> in the document head.
 *
 * Rules:
 *   - Only include a property when the actual value exists.
 *   - Never fabricate data.
 *   - Safely serialise via JSON.stringify (no raw user-input concatenation).
 */

const SITE_URL = 'https://abishekhjoshi.com.np'
const SITE_NAME = 'Abishekh Joshi'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

// ─── Person ──────────────────────────────────────────────────────────────────

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Abishekh Joshi',
    url: SITE_URL,
    image: OG_IMAGE,
    // All three roles listed — schema.org accepts an array for jobTitle
    jobTitle: [
      'Photographer',
      'Video Editor',
      'Web Designer & Developer',
    ],
    description:
      'Visual storyteller based in Kathmandu, Nepal. Specialising in photography (portrait, concert, landscape, culture), video editing for music artists and brands, and end-to-end web design and development.',
    email: 'mailto:joshiabishek987@gmail.com',
    telephone: '+977-9815025634',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kathmandu',
      addressCountry: 'NP',
    },
    sameAs: [
      'https://www.instagram.com/abishek_joshi_/',
      'https://www.linkedin.com/in/abishekh-joshi-41135a2a0/',
      'https://www.facebook.com/abishek.joshi.79',
      'https://www.tiktok.com/@abishekjoshi59',
    ],
    knowsAbout: [
      'Photography',
      'Portrait Photography',
      'Concert Photography',
      'Landscape Photography',
      'Cultural Photography',
      'Wedding Photography',
      'Video Editing',
      'Music Video Production',
      'Colour Grading',
      'UX/UI Design',
      'Web Design',
      'Web Development',
      'React',
      'Brand Identity',
    ],
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'Photographer',
        occupationLocation: { '@type': 'City', name: 'Kathmandu' },
        description: 'Portrait, concert, landscape, cultural, street, and wedding photography across Nepal.',
      },
      {
        '@type': 'Occupation',
        name: 'Video Editor',
        occupationLocation: { '@type': 'City', name: 'Kathmandu' },
        description: 'Cinematic editing, colour grading, and motion work for music artists and brands.',
      },
      {
        '@type': 'Occupation',
        name: 'Web Designer and Developer',
        occupationLocation: { '@type': 'City', name: 'Kathmandu' },
        description: 'End-to-end design and development of portfolio, brand, and business websites.',
      },
    ],
  }
}

// ─── WebSite (enables Google Sitelinks search box eligibility) ───────────────

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Portfolio of Abishekh Joshi — photographer and UX/UI designer based in Kathmandu, Nepal.',
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: 'Abishekh Joshi',
    },
  }
}

// ─── WebPage (homepage) ──────────────────────────────────────────────────────

export function buildWebPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Abishekh Joshi — Photographer & UX/UI Designer, Kathmandu',
    description:
      'Visual storyteller, photographer, and UX/UI designer based in Kathmandu, Nepal.',
    url: `${SITE_URL}/`,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', url: SITE_URL },
    about: {
      '@type': 'Person',
      name: 'Abishekh Joshi',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
      ],
    },
    dateModified: new Date().toISOString().split('T')[0],
  }
}

// ─── CreativeWork — Photography portfolio ────────────────────────────────────

export function buildPortfolioSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Photography Portfolio — Abishekh Joshi',
    description:
      'A collection of portrait, landscape, concert, culture, street, and wedding photography captured in Nepal.',
    url: `${SITE_URL}/#photography`,
    author: {
      '@type': 'Person',
      name: 'Abishekh Joshi',
      url: SITE_URL,
    },
    inLanguage: 'en',
    keywords:
      'photography, Nepal, Kathmandu, portrait, landscape, concert, culture, street, wedding',
  }
}

// ─── Utility: inject all schemas into <head> ─────────────────────────────────

/**
 * Creates or replaces a <script type="application/ld+json"> tag in <head>
 * identified by the given `id`.  Safe: uses JSON.stringify, never innerHTML
 * with raw user input.
 */
export function injectJsonLd(id: string, data: object): void {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  // JSON.stringify ensures no executable code is injected
  el.textContent = JSON.stringify(data, null, 0)
}

/** Removes a previously-injected JSON-LD block. */
export function removeJsonLd(id: string): void {
  document.getElementById(id)?.remove()
}
