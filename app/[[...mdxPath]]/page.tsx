import type { Metadata } from 'next'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
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
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
