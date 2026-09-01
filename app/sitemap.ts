import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/seo'
const CONTENT_DIR = path.join(process.cwd(), 'content')

function collectPages(dir: string, prefix = ''): { route: string; file: string }[] {
  const pages: { route: string; file: string }[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...collectPages(full, `${prefix}/${entry.name}`))
    } else if (entry.name.endsWith('.mdx')) {
      const slug = entry.name.replace(/\.mdx$/, '')
      pages.push({
        route: slug === 'index' ? prefix || '/' : `${prefix}/${slug}`,
        file: path.relative(process.cwd(), full).split(path.sep).join('/')
      })
    }
  }
  return pages
}

/*
 * Last-commit date per content file, from one `git log` rather than one call
 * per page.
 *
 * `new Date()` was here before, which told every crawler that all 52 pages
 * changed on every deploy — the same lie `components/page-meta.tsx` exists to
 * avoid, and the reason `scripts/unshallow.mjs` runs before the build. A
 * sitemap that marks everything fresh on every deploy is a sitemap whose
 * `lastmod` a crawler learns to ignore.
 *
 * Output is newest-first, so the first time a path appears is its last change.
 * On a shallow clone or with no git at all this returns an empty map and the
 * field is omitted — no date beats a wrong one.
 */
function lastModifiedByFile(): Map<string, Date> {
  const dates = new Map<string, Date>()
  let log: string
  try {
    log = execFileSync('git', ['log', '--format=%cI', '--name-only', '--', 'content'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024
    })
  } catch {
    return dates
  }

  let current: Date | undefined
  for (const line of log.split('\n')) {
    const value = line.trim()
    if (value === '') continue
    if (value.startsWith('content/')) {
      if (current && !dates.has(value)) dates.set(value, current)
    } else {
      const parsed = new Date(value)
      current = Number.isNaN(parsed.getTime()) ? undefined : parsed
    }
  }
  return dates
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dates = lastModifiedByFile()

  return collectPages(CONTENT_DIR).map(({ route, file }) => {
    const lastModified = dates.get(file)
    return {
      url: `${SITE_URL}${route === '/' ? '' : route}`,
      // `changeFrequency` is deliberately absent: it was a hard-coded "weekly"
      // that nothing here measured, and Google ignores the field anyway.
      ...(lastModified ? { lastModified } : {}),
      priority: route === '/' ? 1 : 0.7
    }
  })
}
