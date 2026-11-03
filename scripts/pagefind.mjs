/*
 * Build the Pagefind search index from the prerendered pages.
 *
 * Where Next writes those pages depends on who runs the build. A plain
 * `next build` writes them to .next/server/app. On Vercel, Next 16.4 builds
 * through Vercel's adapter and writes them to
 * .next/server/route-cache/APP_PAGE/<hash of the route>/$ instead, and an index
 * of an empty folder fails the deploy. So find the folder holding the home
 * page, wherever it is, and index that.
 */
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import * as pagefind from "pagefind"

const routeCache = ".next/server/route-cache/APP_PAGE"
const candidates = [
  ".next/server/app",
  ...(existsSync(routeCache) ? readdirSync(routeCache).map((hash) => join(routeCache, hash, "$")) : []),
]
const site = candidates.find((dir) => existsSync(join(dir, "index.html")))
if (!site) throw new Error(`No prerendered home page in: ${candidates.join(", ")}`)

const { index } = await pagefind.createIndex()
const { errors, page_count } = await index.addDirectory({ path: site })
if (errors.length || !page_count) throw new Error(`Pagefind indexed ${page_count} pages from ${site}: ${errors.join("; ")}`)
await index.writeFiles({ outputPath: "public/_pagefind" })
await pagefind.close()
console.log(`[pagefind] indexed ${page_count} pages from ${site}`)
