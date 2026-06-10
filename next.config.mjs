import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nextra from 'nextra'

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
  }
})
