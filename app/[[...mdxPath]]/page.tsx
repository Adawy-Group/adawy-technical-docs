import type { Metadata } from 'next'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { PageMeta } from '../../components/page-meta'
import { buildPageMetadata, pagePath } from '../../lib/seo'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  const path = pagePath(params.mdxPath)
  const title = typeof metadata.title === 'string' ? metadata.title : 'Adawy Docs'

  return buildPageMetadata({
    title,
    description: metadata.description,
    path
  })
}

type PageProps = {
  params: Promise<{ mdxPath?: string[] }>
}

const Wrapper = getMDXComponents().wrapper as React.ComponentType<{
  toc: unknown
  metadata: unknown
  sourceCode: string
  children: React.ReactNode
}>

export default async function Page(props: PageProps) {
  const params = await props.params
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath)

  // Rendered here rather than per page: reading time and the git timestamp are
  // derived, so every page gets the strip for free and none of them can carry a
  // stale hand-written version of it.
  const meta = metadata as {
    readingTime?: { text?: string; minutes?: number; words?: number }
    timestamp?: number
    tags?: string[]
  }

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <PageMeta
        readingTime={meta.readingTime}
        timestamp={meta.timestamp}
        tags={meta.tags}
      />
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
