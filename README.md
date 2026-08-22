# Adawy Group — Software Department Handbook

Technical documentation and onboarding handbook for the Adawy Group software
department: what we build, why we build it, and how we work.

Built with [Nextra 4](https://nextra.site) (Next.js docs framework).

## Development

```bash
npm install
npm run dev                    # http://localhost:3000

node scripts/check-links.mjs   # CI runs this first — it needs no build output
npm run build                  # the real gate on content
```

This repo uses **npm**. Every other repo in the org uses pnpm.

## Contributing

All content lives in `content/` as MDX. Folder structure is the URL structure
and the sidebar; the `_meta.ts` in each folder controls order and titles.

1. Add or edit a page in `content/`, with `title`, `description` and `tags` in
   its frontmatter.
2. Add its filename key to that folder's `_meta.ts` — a page missing from it is
   invisible in the sidebar, and `check-links.mjs` fails the build.
3. Run both gates above.
4. Open a pull request — Vercel posts a preview URL. Merging to `main` deploys.

Conventions, the components available in MDX, and the known traps are
documented on the site itself, at
[`/repositories/adawy-technical-docs`](https://adawy-technical-docs.vercel.app/repositories/adawy-technical-docs).

**Every rule states its why.** A rule without a reason is a candidate for
deletion — that is the house style, and it applies to this file too.
