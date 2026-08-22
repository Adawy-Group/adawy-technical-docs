/*
 * The at-a-glance strip under the breadcrumb on every page: how long the page
 * takes to read, when it last changed, and what it is about.
 *
 * Everything here is derived, never typed by hand:
 *  - reading time comes from `readingTime: true` in next.config.mjs, which
 *    Nextra computes from the compiled MDX at build time;
 *  - the date is the file's last git commit, the same source the theme's
 *    footer "Last updated on" uses (which is why CI checks out with
 *    fetch-depth: 0).
 * Only `tags` is authored, in frontmatter. A hand-written "5 min read" would
 * be wrong one edit later, and nothing in this repo would fail.
 */

type ReadingTime = { text?: string; minutes?: number; words?: number }

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
}

export function PageMeta({
  readingTime,
  timestamp,
  tags
}: {
  readingTime?: ReadingTime
  timestamp?: number
  tags?: string[]
}) {
  const minutes =
    typeof readingTime?.minutes === 'number'
      ? Math.max(1, Math.round(readingTime.minutes))
      : undefined

  // A page with no signals at all renders nothing rather than an empty bar.
  if (!minutes && !timestamp && !tags?.length) return null

  return (
    <div className="adawy-page-meta" aria-label="Page information">
      {minutes ? (
        <span className="adawy-page-meta-item">
          <ClockIcon />
          {minutes} min read
        </span>
      ) : null}

      {timestamp ? (
        <span className="adawy-page-meta-item">
          <HistoryIcon />
          Updated{' '}
          <time dateTime={new Date(timestamp).toISOString()}>
            {/* Fixed locale: this renders once at build time, so it must not
                depend on the build machine's locale. */}
            {new Date(timestamp).toLocaleDateString('en-GB', DATE_FORMAT)}
          </time>
        </span>
      ) : null}

      {tags?.length ? (
        <span className="adawy-page-meta-tags">
          {tags.map((tag) => (
            <span key={tag} className="adawy-page-tag">
              {tag}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  )
}

/* Inline SVG rather than an icon package: two glyphs do not justify a
 * dependency, and these ship inside the already-rendered HTML. */
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="adawy-page-meta-icon">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="adawy-page-meta-icon">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4" />
    </svg>
  )
}
