import fs from 'node:fs'
import path from 'node:path'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://adawy-technical-docs.vercel.app'
const CONTENT_DIR = path.join(process.cwd(), 'content')

function collectRoutes(dir: string, prefix = ''): string[] {
  const routes: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.name.endsWith('.mdx')) {
      const slug = entry.name.replace(/\.mdx$/, '')
      routes.push(slug === 'index' ? prefix || '/' : `${prefix}/${slug}`)
    }
  }
  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  return collectRoutes(CONTENT_DIR).map(route => ({
    url: `${BASE_URL}${route === '/' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7
  }))
}
