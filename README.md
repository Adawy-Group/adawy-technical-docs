# Adawy Group — Software Department Handbook

Technical documentation and onboarding handbook for the Adawy Group software
department: what we build, why we build it, and how we work.

Built with [Nextra 4](https://nextra.site) (Next.js docs framework).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Contributing

All content lives in `content/` as MDX files. Sidebar order and titles are
controlled by the `_meta.ts` file in each folder.

1. Edit or add a page in `content/`
2. Open a pull request — Vercel posts a preview URL on the PR
3. Merge to `main` → auto-deploys to production

Pages marked 🚧 are stubs awaiting content — filling one in is a great first PR.
