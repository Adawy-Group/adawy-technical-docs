import type { ReactNode } from 'react'

/*
 * Small inline pill for a status or a classification — "Group", "Client",
 * "Live", "Planned". Server component on purpose: it carries no state, so it
 * must not push a page over a client boundary just to render a label.
 *
 * `tone` is a closed set rather than a colour prop, so the same meaning always
 * gets the same colour across the handbook — a reader learns the palette once.
 */
export type BadgeTone =
  | 'neutral'
  | 'group'
  | 'client'
  | 'internal'
  | 'live'
  | 'building'
  | 'holding'
  | 'planned'
  | 'private'
  | 'public'

export function Badge({
  tone = 'neutral',
  children
}: {
  tone?: BadgeTone
  children: ReactNode
}) {
  return <span className={`adawy-badge adawy-badge-${tone}`}>{children}</span>
}
