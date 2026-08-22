# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Adawy Group software department handbook — a [Nextra 4](https://nextra.site)
docs site (Next.js 16, React 19). It is a **content repository**: nearly every
change is an MDX page under `content/`, not application code.

Package manager is **npm** (`package-lock.json`). `adawy-platform` is the pnpm
repo in this org — check which one you are in before installing.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # also runs pagefind postbuild → public/_pagefind
npm run check-links  # node scripts/check-links.mjs
npm start            # serve the production build
```

There are **no lint or test scripts** and no test suite. The full verification
loop is exactly what CI (`.github/workflows/verify.yml`) runs, in this order:

```bash
node scripts/check-links.mjs   # runs first — needs no build output
npm run build                  # the real gate: a page can render in dev and fail to prerender
```

## Architecture

- `app/[[...mdxPath]]/page.tsx` — one catch-all route renders every page via
  Nextra's `importPage`. There are no per-page route files.
- `content/**` — the page tree. Folder structure *is* the URL structure and the
  sidebar; `index.mdx` becomes the section root.
- `content/<section>/_meta.ts` — sidebar order and display titles. **A page not
  listed here is invisible in the sidebar** (`check-links.mjs` fails on it).
- `mdx-components.tsx` — `Callout`, `Cards`, `FileTree`, `Steps`, `Tabs`,
  `Bleed` (Nextra) plus this site's own `Badge`, `Stats`/`Stat` and
  `Checklist`/`Task` are registered globally, so MDX pages use them without
  importing. A new component used in MDX must be added here or it compiles to
  `undefined`. Keep new components **server** components unless they genuinely
  need state — `components/checklist.tsx` is the only `"use client"` one.
- `components/page-meta.tsx` — the header strip (reading time · last change ·
  tags), rendered for every page from `app/[[...mdxPath]]/page.tsx`. Reading
  time comes from `readingTime: true` in `next.config.mjs`; the date is the
  file's git timestamp. **Never hand-write either into a page.**
- `lib/seo.ts` — all metadata, canonicals and JSON-LD. `SITE_URL` comes from
  `NEXT_PUBLIC_SITE_URL`; never use `VERCEL_URL` (per-deployment hostname).

## Content conventions

`content/repositories/adawy-technical-docs.mdx` is the fuller, reader-facing
version of this section — update it alongside any change here.

- Frontmatter carries `title`, `description` (it feeds the meta description and
  the search index) and `tags` — two or three, from the vocabulary already in
  use, rendered as pills in the header strip.
- **Every rule states its *Why*.** House style, not decoration — a rule without
  a reason is a candidate for deletion.
- **Cross-section links must be absolute** (`/standards/coding`). A relative
  link silently skips validation and can 404 in production with a green build.
  `check-links.mjs` validates absolute Markdown links, absolute `href` props
  (so `Cards.Card` links are covered), same-page `#anchor` links, and every
  page's presence in its `_meta.ts`. It ignores anything inside backticks or a
  fenced block.
- Keep `_meta.ts` in the flat `export default { key: 'Title' }` shape at two-space
  indent — the checker parses these files textually with a regex, not by
  importing them, so unusual formatting produces false failures.
- `Callout` type by what the reader loses by skipping: none = tip, `info` =
  context preventing a misreading, `important` = must do or CI fails, `warning` =
  costly trap, `error` = silent/expensive failure. Blockquotes are for actual
  quotations, not asides.
- Mermaid renders from ` ```mermaid ` fences.
- **Numbers in content must be stable** — repo counts, locale counts, founding
  years, committed targets. Never commit counts, deploy counts or a recent
  Lighthouse score: nothing refreshes them and no check fails when they rot.
- **Adawy** Pack (a Group brand) and **Alad**awy Pack (a client) are different
  companies one letter apart. Verify which one a page means before editing it.
- The org has **eight** repositories: `adawy-platform` and `adawy-group-links`
  (Group), `aladawy-pack`, `aladawy-shop`, `jumeira`, `zad-alhkoul` and
  `baron-menu` (client), and this handbook. `adawy-group-links` is Group-owned
  but standalone, which fits neither world — the handbook states that as an
  open question and must not invent a rationale for it.

## Traps

- The `overrides.zod` pin (`4.1.12`) in `package.json` is load-bearing. Without
  it a newer zod is hoisted and every page fails to build with
  `Invalid input: expected nonoptional, received undefined → at children`.
- A page can render in `npm run dev` and still fail `next build`. Open the failing
  route in dev — it shows the real prerender error the production build hides.
- Search is empty in `npm run dev` — Pagefind indexes during `postbuild` only.

## Git

Branch from `main` as `feat/`, `fix/`, `content/` or `chore/<short-description>`.
One PR per unit of work; Vercel posts a preview URL, merging to `main` deploys to
production. Commits in imperative mood.
