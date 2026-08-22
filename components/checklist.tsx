'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode
} from 'react'

/*
 * A checklist you can actually tick, with the ticks remembered on the reader's
 * own machine.
 *
 * Why this is interactive rather than a plain markdown task list: the lists it
 * replaces — the day-1 access list, the client launch checklist — are worked
 * through over hours or days, across several sittings. A disabled checkbox
 * makes the reader keep their place somewhere else, and "somewhere else" is
 * where onboarding steps get dropped.
 *
 * State lives in `localStorage` under the `id`, so it is per-reader and never
 * leaves the browser. Nothing here is a record of anything — the board is
 * ([the board](/how-we-work/the-board)). Treat it as a bookmark, not a report.
 *
 * The two components are split because MDX children are constructed by the
 * server: `Checklist` clones each `Task` on the client to hand it its index and
 * its toggle, which is cheaper and less fragile than threading context through
 * an RSC boundary.
 */

const STORAGE_PREFIX = 'adawy-checklist:'

export function Checklist({ id, children }: { id: string; children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<TaskProps>[]
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false))
  // Until the effect below has read storage, the server and client markup must
  // match — so the first paint is always "nothing ticked".
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + id)
      if (!raw) return
      const saved: unknown = JSON.parse(raw)
      if (Array.isArray(saved)) {
        setDone(items.map((_, i) => saved[i] === true))
      }
    } catch {
      // Private mode, a disabled storage quota, or a value someone hand-edited.
      // A checklist that cannot remember is still a usable checklist.
    }
    // The list length is fixed by the page, so this runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toggle = useCallback(
    (index: number) => {
      setDone((prev) => {
        const next = prev.map((value, i) => (i === index ? !value : value))
        try {
          window.localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(next))
        } catch {
          // See above — persistence is a convenience, not a requirement.
        }
        return next
      })
    },
    [id]
  )

  const reset = useCallback(() => {
    setDone(items.map(() => false))
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + id)
    } catch {
      /* ignore */
    }
  }, [id, items.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const completed = done.filter(Boolean).length
  const total = items.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="adawy-checklist" data-complete={completed === total && total > 0}>
      <div className="adawy-checklist-head">
        <div className="adawy-checklist-count">
          <strong>{completed}</strong> of {total} done
        </div>
        {hydrated && completed > 0 ? (
          <button type="button" className="adawy-checklist-reset" onClick={reset}>
            Reset
          </button>
        ) : null}
      </div>

      <div
        className="adawy-checklist-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Checklist progress"
      >
        <div className="adawy-checklist-fill" style={{ width: `${percent}%` }} />
      </div>

      <ul className="adawy-checklist-items">
        {items.map((child, index) =>
          cloneElement(child, {
            key: index,
            index,
            checked: done[index] ?? false,
            onToggle: toggle
          })
        )}
      </ul>
    </div>
  )
}

type TaskProps = {
  children: ReactNode
  /** Injected by `Checklist`; a `Task` used on its own renders read-only. */
  index?: number
  checked?: boolean
  onToggle?: (index: number) => void
}

export function Task({ children, index, checked = false, onToggle }: TaskProps) {
  const interactive = typeof index === 'number' && typeof onToggle === 'function'

  return (
    <li className="adawy-task" data-checked={checked}>
      <label className="adawy-task-label">
        <input
          type="checkbox"
          className="adawy-task-box"
          checked={checked}
          disabled={!interactive}
          onChange={() => interactive && onToggle(index)}
        />
        <span className="adawy-task-text">{children}</span>
      </label>
    </li>
  )
}
