import type { ReactNode } from 'react'

/*
 * A number worth reading at a glance, and the grid that holds a row of them.
 *
 * The rule for what belongs here: **stable facts only** — repository counts,
 * locale counts, founding years, committed targets. This handbook has no
 * refresh job, so a volatile number (commits, deploy counts, "last week's
 * Lighthouse score") would be wrong within days and the page would be lying
 * with more confidence than prose ever could.
 */
export function Stats({ children }: { children: ReactNode }) {
  return <div className="adawy-stats">{children}</div>
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
      <div className="adawy-stat-value">{value}</div>
      <div className="adawy-stat-label">{label}</div>
      {hint ? <div className="adawy-stat-hint">{hint}</div> : null}
    </div>
  )
}
