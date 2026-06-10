import type { Metadata } from 'next'

/** Production origin for canonicals, OG URLs, and JSON-LD. Never use VERCEL_URL — it is the per-deployment hostname. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adawy-technical-docs.vercel.app'

export const siteName = 'Adawy Group — Software Department Handbook'
export const siteDescription =
  'Technical documentation and onboarding handbook for the Adawy Group software department: what we build, why we build it, and how we work.'
export const publisher = 'Adawy Group'
export const siteKeywords = [
  'Adawy Group',
  'software department',
  'engineering handbook',
  'technical documentation',
  'onboarding',
  'Next.js',
  'multi-tenant platform'
] as const

/** Shared robots directive for meta tags and the X-Robots-Tag response header. */
export const robotsDirective =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export const robotsMetadata: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1
  }
}

export function pagePath(mdxPath?: string[]): string {
  if (!mdxPath?.length) return '/'
  return `/${mdxPath.join('/')}`
}

export function canonicalUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

type PageMetadataInput = {
  title: string
  description?: string | null
  path: string
}

export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const pageDescription = description ?? siteDescription
  const canonical = canonicalUrl(path)
  const ogImage = `${SITE_URL}/og.png`

  return {
    title,
    description: pageDescription,
    alternates: { canonical },
    publisher,
    robots: robotsMetadata,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical,
      siteName,
      title,
      description: pageDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: pageDescription,
      images: [ogImage]
    }
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteName,
    template: '%s | Adawy Docs'
  },
  description: siteDescription,
  applicationName: 'Adawy Software Handbook',
  keywords: [...siteKeywords],
  authors: [{ name: 'Adawy Group Software Department' }],
  creator: publisher,
  publisher,
  alternates: { canonical: SITE_URL },
  robots: robotsMetadata,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: siteName
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/og.png']
  }
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: publisher,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: siteDescription,
  sameAs: ['https://github.com/adawy-group/adawy-technical-docs']
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: SITE_URL,
  description: siteDescription,
  publisher: {
    '@type': 'Organization',
    name: publisher
  }
}
