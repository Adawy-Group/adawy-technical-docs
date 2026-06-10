import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nextra from 'nextra'

const robotsDirective =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: false
  }
})

export default withNextra({
  reactStrictMode: true,
  // Pin the workspace root: a stray lockfile in the home directory otherwise
  // makes Next.js infer the wrong root and warn on every build.
  turbopack: {
    root: __dirname
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: robotsDirective
          }
        ]
      }
    ]
  }
})
