import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Bleed, Callout, Cards, FileTree, Steps, Tabs } from 'nextra/components'
import { Badge } from './components/badge'
import { Checklist, Task } from './components/checklist'
import { Stat, Stats } from './components/stat'

/*
 * The theme's own map only overrides HTML elements (a, table, pre, headings…).
 * Nextra's block components are not part of it, so an MDX page referencing
 * <Callout> without importing it compiles to an undefined component. Register
 * them here once instead of asking every page to import what it uses.
 *
 * The same applies to this repo's own components in `components/` — anything
 * added there must be added here too, or it silently renders as nothing.
 */
const docsComponents = getDocsMDXComponents({
  Badge,
  Bleed,
  Callout,
  Cards,
  Checklist,
  FileTree,
  Stat,
  Stats,
  Steps,
  Tabs,
  Task
})

export const useMDXComponents = (components?: Record<string, unknown>) => ({
  ...docsComponents,
  ...components
})
