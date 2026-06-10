import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

const siteName = 'Adawy Group — Software Department Handbook'
const siteDescription =
  'Technical documentation and onboarding handbook for the Adawy Group software department: what we build, why we build it, and how we work.'

export const metadata: Metadata = {
  metadataBase: new URL('https://adawy-technical-docs.vercel.app'),
  title: {
    default: siteName,
    template: '%s | Adawy Docs'
  },
  description: siteDescription,
  applicationName: 'Adawy Software Handbook',
  keywords: [
    'Adawy Group',
    'software department',
    'engineering handbook',
    'technical documentation',
    'onboarding',
    'Next.js',
    'multi-tenant platform'
  ],
  authors: [{ name: 'Adawy Group Software Department' }],
  creator: 'Adawy Group',
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Adawy Group — Software Department Handbook'
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

const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
        {/* White-on-transparent brand mark: inverted to black in light mode via CSS */}
        <img src="/logo.png" alt="Adawy Group" width={28} height={28} className="adawy-logo" />
        Adawy <span style={{ fontWeight: 400 }}>Software Handbook</span>
      </span>
    }
    projectLink="https://github.com/adawy-group/adawy-technical-docs"
  />
)

const footer = (
  <Footer>{new Date().getFullYear()} © Adawy Group — Software Department</Footer>
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <style>{`.adawy-logo{filter:invert(1)}html.dark .adawy-logo{filter:none}`}</style>
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/adawy-group/adawy-technical-docs/tree/main"
          footer={footer}
          search={<Search placeholder="Search the handbook…" />}
          editLink="Edit this page on GitHub"
          feedback={{ content: 'Questions? Open an issue' }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
