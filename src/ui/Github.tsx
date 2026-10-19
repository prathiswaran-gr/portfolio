import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { track, useSectionAnalytics } from './analytics'

// GitHub contribution calendar, rendered in the site's own palette rather than embedded as
// GitHub's image.
//
// Where the data comes from: the contribution graph is NOT in GitHub's public REST API — it's
// only exposed through the authenticated GraphQL API, and a static site can't hold a token.
// So this reads a public CORS-enabled proxy over that API. That makes it the one third-party
// runtime call in the project; if it's ever down or slow the section simply doesn't render
// (see `failed`), so a dead dependency can never leave a broken card on the page.
//
// If you'd rather not depend on it at all, the alternative is to fetch this JSON at build
// time and commit the snapshot — same rendering code, no runtime call, but the graph only
// refreshes when you rebuild.

// Only the year total is shown by default. `active days` and `longest streak` are computed
// below and ready to render, but this account's public year is 12 active days / a 2-day
// streak — numbers that draw a recruiter's eye to exactly the wrong thing. Flip this to true
import { portfolioConfig } from '../portfolio.config'

const SHOW_DETAIL_STATS = portfolioConfig.github.showDetailStats
const USER = portfolioConfig.github.username
const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`
const PROFILE = `https://github.com/${USER}`

interface Day {
  date: string
  count: number
  level: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Longest run of consecutive days with at least one contribution. */
function longestStreak(days: Day[]): number {
  let best = 0
  let run = 0
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0
    if (run > best) best = run
  }
  return best
}

function label(d: Day): string {
  const [y, m, day] = d.date.split('-')
  const n = d.count
  return `${n} contribution${n === 1 ? '' : 's'} on ${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`
}

export default function Github() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState<Day[] | null>(null)
  const [failed, setFailed] = useState(false)
  useSectionAnalytics('github', sectionRef)

  useEffect(() => {
    let cancelled = false
    // Give up rather than hang if the proxy is slow — the section is a nice-to-have.
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)

    fetch(ENDPOINT, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (cancelled) return
        const list: Day[] = Array.isArray(json?.contributions) ? json.contributions : []
        if (list.length === 0) setFailed(true)
        else setDays(list)
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [])

  const view = useMemo(() => {
    if (!days) return null
    // Pad the first column so the grid starts on the right weekday (GitHub weeks run Sun–Sat).
    const pad = new Date(days[0].date + 'T00:00:00').getDay()
    const cells: (Day | null)[] = [...Array(pad).fill(null), ...days]
    const weeks: (Day | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

    // One month label per column, emitted only where the month changes. A calendar year can
    // begin mid-week (this feed starts on Aug 31), so use the month occupying most of a week;
    // otherwise Aug and Sep would both be placed at column zero and overlap.
    let prev = ''
    const months = weeks.map((w) => {
      const counts = new Map<string, number>()
      for (const day of w) {
        if (!day) continue
        const key = day.date.slice(0, 7)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      const month = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
      if (!month || month === prev) return ''
      prev = month
      return MONTHS[Number(month.slice(5, 7)) - 1]
    })

    const total = days.reduce((n, d) => n + d.count, 0)
    const active = days.filter((d) => d.count > 0).length
    return { weeks, months, total, active, streak: longestStreak(days) }
  }, [days])

  useLayoutEffect(() => {
    if (!view) return
    const el = scrollRef.current
    if (!el) return

    const scrollToLatest = () => {
      el.scrollLeft = el.scrollWidth - el.clientWidth
    }

    scrollToLatest()
    const raf = requestAnimationFrame(scrollToLatest)
    const ro = new ResizeObserver(scrollToLatest)
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [view])

  if (failed) return null

  return (
    <section className="github" aria-label="GitHub contributions" ref={sectionRef}>
      <motion.div
        className="section-inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="sec-head">
          <span className="sec-no">{portfolioConfig.github.sectionNo || '06'}</span>
          <h2 className="sec-title">{portfolioConfig.github.title}</h2>
          <a
            className="sec-tagline gh-link"
            href={PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('social_click', { location: 'github_section', platform: 'github' })}
          >
            @{USER} ↗
          </a>
        </header>

        <p className="sec-sub">
          {portfolioConfig.github.sub}
        </p>

        {view && (
          <div className="gh-card">
            <div className="gh-scroll" ref={scrollRef}>
              <div className="gh-months" aria-hidden="true">
                {view.months.map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
              <div
                className="gh-grid"
                role="img"
                aria-label={`${view.total} contributions in the last year`}
              >
                {view.weeks.map((week, wi) => (
                  <div className="gh-week" key={wi}>
                    {week.map((d, di) =>
                      d ? (
                        <span
                          key={di}
                          className="gh-day"
                          data-level={d.level}
                          title={label(d)}
                        />
                      ) : (
                        <span key={di} className="gh-day is-empty" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="gh-foot">
              <div className="gh-stats">
                <span>
                  <strong>{view.total}</strong> contributions in the last year
                </span>
                {SHOW_DETAIL_STATS && (
                  <>
                    <span>
                      <strong>{view.active}</strong> active days
                    </span>
                    <span>
                      <strong>{view.streak}</strong> day streak
                    </span>
                  </>
                )}
              </div>
              <div className="gh-legend" aria-hidden="true">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((l) => (
                  <span key={l} className="gh-day" data-level={l} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}
