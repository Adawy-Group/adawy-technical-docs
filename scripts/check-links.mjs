/*
 * Fails the build on a broken internal link, a broken #anchor, a page that
 * is missing from its folder's _meta.ts, or a page missing required
 * frontmatter.
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
 *
 * Passing `--external` additionally requests every off-site URL. That is NOT
 * part of the PR gate on purpose: it needs the network, and a third party
 * being briefly down would then fail a pull request that changed nothing. It
 * runs on a schedule instead (.github/workflows/external-links.yml), where a
 * failure means "go and look", not "your branch is broken".
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

// 3. Frontmatter. `title` names the page, `description` is both its meta
//    description and what the site's own search shows under the result, and
//    `tags` render as the pills in the header strip. All three build green
//    when missing, which is how one page went a month without a description.
const FRONTMATTER_FIELDS = ["title", "description", "tags"]

for (const file of mdxFiles) {
  const src = fs.readFileSync(file, "utf8")
  const block = src.match(/^---\n([\s\S]*?)\n---/)
  if (!block) {
    problems.push(`${file}: no frontmatter block`)
    continue
  }
  // Read the keys off the top level of the block rather than with a regex per
  // field: a key is a line starting in column 0, and a value that is only
  // whitespace is the same defect as no key at all.
  const present = new Set(
    block[1]
      .split("\n")
      .filter((line) => line === line.trimStart() && line.includes(":"))
      .filter((line) => line.slice(line.indexOf(":") + 1).trim() !== "")
      .map((line) => line.slice(0, line.indexOf(":")).trim())
  )

  for (const field of FRONTMATTER_FIELDS) {
    if (!present.has(field)) {
      problems.push(`${file}: frontmatter is missing "${field}"`)
    }
  }
}

// 4. External links. Only with `--external` — see the header for why.
const EXTERNAL_PATTERN = /https?:\/\/[^\s)\]"'<>]+/g

/*
 * localhost is skipped: `http://localhost:3000` is an instruction to the
 * reader, not a destination, and nothing in CI is serving it. Requesting it
 * would fail on every single run, which is how a check teaches people to
 * ignore it.
 */
const SKIP_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"])

function externalLinks() {
  const found = new Map() // url -> Set of files citing it
  for (const file of mdxFiles) {
    const src = withoutCode(fs.readFileSync(file, "utf8"))
    for (const m of src.matchAll(EXTERNAL_PATTERN)) {
      // Trailing punctuation belongs to the sentence, not to the URL.
      const url = m[0].replace(/[.,;:]+$/, "")
      let host
      try {
        host = new URL(url).hostname
      } catch {
        problems.push(`${file}: ${url} - not a parsable URL`)
        continue
      }
      if (SKIP_HOSTS.has(host)) continue
      if (!found.has(url)) found.set(url, new Set())
      found.get(url).add(file)
    }
  }
  return found
}

/*
 * HEAD first: a docs page is not worth downloading to learn that it exists.
 * Some hosts answer HEAD with 403/405 while serving GET fine, so those retry
 * rather than get reported as dead.
 */
async function reachable(url) {
  const request = (method) =>
    fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "adawy-technical-docs-link-checker" }
    })

  let res = await request("HEAD")
  if (res.status === 403 || res.status === 405 || res.status === 501) {
    res = await request("GET")
  }
  return res.ok ? null : `HTTP ${res.status}`
}

if (process.argv.includes("--external")) {
  const links = externalLinks()
  const urls = [...links.keys()]
  console.log(`Checking ${urls.length} external link(s)...`)

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        return [url, await reachable(url)]
      } catch (error) {
        return [url, error.name === "TimeoutError" ? "timed out" : error.message]
      }
    })
  )

  for (const [url, failure] of results) {
    if (!failure) continue
    for (const file of links.get(url)) problems.push(`${file}: ${url} - ${failure}`)
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error("")
  process.exit(1)
}

console.log(
  `OK — ${routes.size} pages: frontmatter complete, and every internal link, anchor and _meta.ts entry resolves.`
)
