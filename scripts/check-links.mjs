/*
 * Fails the build on a broken internal link, a broken #anchor, or a page that
 * is missing from its folder's _meta.ts.
 *
 * Nextra resolves links at render time, so a typo in `](/standards/codeing)`
 * builds green and 404s in production. A page absent from _meta.ts builds
 * green too and is simply invisible in the sidebar. Both were found by hand
 * before this existed.
 *
 * Two link syntaxes are checked, because the pages use both: Markdown
 * `](/route)` and the `href="/route"` prop on JSX components such as
 * <Cards.Card>. A card link is invisible to the Markdown matcher, so without
 * the second pattern a section index built from cards would be the least
 * validated page on the site rather than the most.
 */
import fs from "node:fs"
import path from "node:path"

const CONTENT = "content"

const mdxFiles = []
const metaFiles = []
;(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (entry.name === "_meta.ts") metaFiles.push(p)
    else if (entry.name.endsWith(".mdx")) mdxFiles.push(p)
  }
})(CONTENT)

/** content/standards/coding.mdx → /standards/coding ; …/index.mdx → /standards */
function toRoute(file) {
  const rel = path.relative(CONTENT, file).split(path.sep).join("/")
  let route = "/" + rel.replace(/\.mdx$/, "")
  if (route.endsWith("/index")) route = route.slice(0, -"/index".length)
  return route === "" ? "/" : route
}

/**
 * Mirrors the GitHub-style slug Nextra generates for heading anchors.
 *
 * Each whitespace character becomes its own hyphen — runs are NOT collapsed.
 * "Linting & formatting" loses the ampersand and keeps both spaces, so the
 * real anchor is `linting--formatting` with two hyphens. Collapsing here would
 * reject that valid link and accept the single-hyphen one that 404s.
 */
function slugify(heading) {
  return heading
    .trim()
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-")
}

const routes = new Set(mdxFiles.map(toRoute))

/**
 * Strips fenced blocks and inline code spans.
 *
 * Prose about links is not a link: the page documenting this script quotes the
 * patterns it matches, and a code sample may contain a path that does not
 * resolve on purpose. Both are inside backticks, and neither is something a
 * reader can click.
 */
function withoutCode(src) {
  return src.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "")
}

const anchors = new Map()
for (const file of mdxFiles) {
  const headings = new Set()
  const src = fs.readFileSync(file, "utf8")
  // Skip fenced code blocks so a `# comment` inside bash is not read as a heading.
  for (const m of src.replace(/^```[\s\S]*?^```/gm, "").matchAll(/^#{1,6}\s+(.+)$/gm)) {
    headings.add(slugify(m[1]))
  }
  anchors.set(toRoute(file), headings)
}

const problems = []

// 1. Internal links and their anchors, in both Markdown and JSX syntax.
const LINK_PATTERNS = [
  /\]\((\/[^)\s]*)\)/g, //        [text](/route#anchor)
  /href="(\/[^"\s]*)"/g //        <Cards.Card href="/route" />
]

// Same-page anchors: [text](#heading). They carry no route, so they are
// resolved against the file they appear in. The long slugs the ADR page links
// between are exactly the kind that rot on an unrelated heading edit.
const SAME_PAGE_PATTERN = /\]\((#[^)\s]+)\)/g

for (const file of mdxFiles) {
  const src = withoutCode(fs.readFileSync(file, "utf8"))
  const own = toRoute(file)

  for (const pattern of LINK_PATTERNS) {
    for (const m of src.matchAll(pattern)) {
      const [target, hash] = m[1].split("#")
      const route = target === "" ? "/" : target
      if (!routes.has(route)) {
        problems.push(`${file}: link to ${m[1]} — no such page`)
      } else if (hash && !anchors.get(route).has(hash)) {
        problems.push(`${file}: link to ${m[1]} — no such heading on that page`)
      }
    }
  }

  for (const m of src.matchAll(SAME_PAGE_PATTERN)) {
    const hash = m[1].slice(1)
    if (!anchors.get(own).has(hash)) {
      problems.push(`${file}: link to ${m[1]} — no such heading on this page`)
    }
  }
}

// 2. Every page appears in its folder's _meta.ts, and every _meta.ts key is a
//    real page. A page missing from _meta.ts is invisible in the sidebar.
for (const metaFile of metaFiles) {
  const dir = path.dirname(metaFile)
  // Read the keys textually rather than importing: these are .ts files, and
  // importing them would tie this script to Node's type-stripping support.
  const body = fs.readFileSync(metaFile, "utf8").replace(/^export default \{/, "")
  const keys = new Set([...body.matchAll(/^\s{2}'?"?([\w-]+)'?"?\s*:/gm)].map((m) => m[1]))

  const pages = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => e.name.replace(/\.mdx$/, ""))

  const subsections = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)

  for (const name of [...pages, ...subsections]) {
    if (!keys.has(name)) {
      problems.push(`${metaFile}: missing key "${name}" — it will not appear in the sidebar`)
    }
  }
  for (const key of keys) {
    if (!pages.includes(key) && !subsections.includes(key)) {
      problems.push(`${metaFile}: key "${key}" has no matching page or folder`)
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error("")
  process.exit(1)
}

console.log(`OK — ${routes.size} pages, every internal link, anchor and _meta.ts entry resolves.`)
