import type { ReactNode } from 'react'

/*
 * A number worth reading at a glance, and the grid that holds a row of them.
 *
 * The rule for what belongs here: **stable facts only** — repository counts,
 * locale counts, founding years, committed targets. This handbook has no
 * refresh job, so a volatile number (commits, deploy counts, "last week's
 * Lighthouse score") would be wrong within days and the page would be lying
 * with more confidence than prose ever could.
 *
 * Marked up as a description list — each tile is a label/value pair. The label
 * comes first in the source, as `<dt>` must, so assistive tech reads
 * "repositories: 12"; CSS lifts the value above it visually.
 */
export function Stats({ children }: { children: ReactNode }) {
  return <dl className="adawy-stats">{children}</dl>
}

export function Stat({
  value,
  label,
  hint
}: {
  value: ReactNode
  label: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="adawy-stat">
      <dt className="adawy-stat-label">{label}</dt>
      <dd className="adawy-stat-value">{value}</dd>
      {hint ? <dd className="adawy-stat-hint">{hint}</dd> : null}
    </div>
  )
}
