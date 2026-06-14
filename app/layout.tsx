import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { JsonLd } from '../components/json-ld'
import { organizationJsonLd, rootMetadata, websiteJsonLd } from '../lib/seo'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = rootMetadata

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
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
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
