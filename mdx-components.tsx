import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout, Cards, FileTree, Steps, Tabs } from 'nextra/components'

/*
 * The theme's own map only overrides HTML elements (a, table, pre, headings…).
 * Nextra's block components are not part of it, so an MDX page referencing
 * <Callout> without importing it compiles to an undefined component. Register
 * them here once instead of asking every page to import what it uses.
 */
const docsComponents = getDocsMDXComponents({
  Callout,
  Cards,
  FileTree,
  Steps,
  Tabs
})

export const useMDXComponents = (components?: Record<string, unknown>) => ({
  ...docsComponents,
  ...components
})
