import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { PROJECTS, type Project } from '../data/projects'
import { paper, paperLand } from './sound'
import { track } from './analytics'

// The projects as a sketchbook you turn by hand — a real page turn, with the leaf curling as
// it sweeps across the gutter, the book leaning toward the cursor, and the shadow under it
// lifting as the page passes.
//
// Ported from Meng To's Sketchbook (threeui.com → MengTo/threeui, public/landing-pages/
// meng-to-sketchbook.html). The geometry, the lighting model and the interaction thresholds
// are his and are kept as authored: N strips, SPAN, BETA, the tt/td angle pair, the per-strip
// |cos| lighting, the 0.42 commit threshold, the 170/26 and 150/24 springs.
//
// ONE substantive change, and it is forced. His pages are watercolour PNGs, so each strip of
// the curl is a slice of one bitmap — `background-size: <book width> auto` with a per-strip
// `background-position-x`. Our pages are live text, which cannot be sliced that way. So every
// face instead CLIPS a book-width copy of the page, offset by exactly the same number his
// background-position uses. Same geometry, same seams (none — consecutive strips hinge on
// their shared edge, so the chain is continuous and only its derivative jumps), but the type
// stays real type: selectable, searchable, and sharp at any zoom.
//
// What is not ported: the brass-and-glass magnifier and its zoom toolbar. It exists to let you
// look closely at brushwork; on a page of text there is nothing under it that reading does not
// already give you, and a brass loupe on a white type-led page would look like it wandered in
// from another website. The rest of the book is here.
//
// Deliberately excluded from the accessibility tree in favour of the plate list in Works.tsx,
// which carries the same content as text — see the guards at the end of styles.css.

const PAGES = PROJECTS.items
const M = PAGES.length

// --- his numbers, unchanged -------------------------------------------------------------
const BETA = 0.6 // peak curl of the arc, radians
const TILT_X = 4.5
const TILT_Y = 7

// --- ours -------------------------------------------------------------------------------
// He uses 18 strips over a bitmap, which costs nothing. Every strip here lays out two real
// copies of a page instead, so this is the one number that had to come down: 14 keeps the
// crease between strips under 5° while halving the layout work at the start of a turn.
const N = 14

// Gutter → outer page edge, as a fraction of book width. His is 0.449, and that number is not
// arbitrary: his page art has the desk printed around the paper, so the sheet only occupies
// 5.1%–94.9% of the image (the same bounds his magnifier clamps itself to). Our sheet IS the
// element and runs full bleed, so a 0.449 leaf would stop 5.1% short of its own edge and leave
// a 55px ribbon of the outgoing page showing beside it for the whole turn. Half of the book is
// half of the book.
const SPAN = 0.5

// The riffle. Two passes over the whole book, which with any page count lands exactly back on
// Plate 01 — (2 * M) % M is 0 — so the book demonstrates itself and then returns to the front.
// The tempo is his: a bell curve over the pass, slow at both ends and quickest in the middle,
// with the motion blur stepping up once it is past 0.55.
const RIFFLE_PASSES = 2
const SPRITE = 'experience/ink-sprite.png'
const no = (i: number) => String(i + 1).padStart(2, '0')

export type BookHandle = { goTo: (i: number) => void }

// One spread: the plate number on the verso, the writing on the recto, the fold between them.
//
// `interactive` marks the page at rest — the only copy of a spread whose links do anything. The
// halves and the fourteen strips of a curl are throwaway duplicates of the same markup, and
// duplicate anchors that could be clicked mid-turn would be a trap.
function Spread({ i, interactive = false }: { i: number; interactive?: boolean }) {
  const p: Project = PAGES[i]
  const base = import.meta.env.BASE_URL

  // Real anchors, above the page-turn targets, and they swallow the pointerdown so a click on
  // a link is never also the start of a drag. Out of the tab order on purpose: the book is
  // aria-hidden, and a focusable control inside that is unreachable for a screen reader — the
  // plate list is what keyboard and AT users get, and it un-hides itself on focus.
  const link = (cls: string, href: string | undefined, label: string) => {
    const text = `${label} ↗`
    if (!interactive || !href) return <span className={cls}>{text}</span>
    return (
      <a
        className={cls}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() =>
          track('project_open', {
            project: p.name,
            destination: label === 'View source' ? 'source' : 'live',
            label,
            surface: 'sketchbook',
          })
        }
      >
        {text}
      </a>
    )
  }

  return (
    <div className="sbk-spread">
      <div className="sbk-page verso">
        <div className="sbk-rail">
          <span>Plate {no(i)}</span>
          <span>{p.year}</span>
        </div>
        <span
          className="sbk-num"
          style={{
            maskImage: `url(${base}${SPRITE})`,
            WebkitMaskImage: `url(${base}${SPRITE})`,
          }}
        >
          {no(i)}
        </span>
        <ul className="sbk-stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="sbk-fold" />

      <div className="sbk-page recto">
        <h3 className="sbk-name">{p.name}</h3>
        {p.award && <span className="sbk-award">{p.award}</span>}
        <p className="sbk-blurb">{p.blurb}</p>
        <p className="sbk-body">{p.body}</p>
        <span className="sbk-links">
          {p.live && link('sbk-link is-live', p.live.url, p.live.label)}
          {p.link
            ? link('sbk-link', p.link, 'View source')
            : /* Only worth saying when there is nowhere else to go. An entry with a store
                 listing already offers something to click, and "Private repository" beside it
                 reads as an apology for a gap that isn't there. */
              !p.live && <span className="sbk-link is-private">Private repository</span>}
        </span>
      </div>
    </div>
  )
}

// A half of the book: 50% wide with the overflow clipped, holding a spread at 200% of itself
// (= one book width) so the correct half shows through. His trick, unchanged.
function Half({ pos, i }: { pos: 'left' | 'right'; i: number }) {
  return (
    <div className={`sbk-half ${pos}`}>
      <div className={`sbk-pagebox ${pos}`}>
        <Spread i={i} />
      </div>
      <div className={`sbk-gutter-shade ${pos}`} />
    </div>
  )
}

// The strip chain. Built once per turn: the offsets are pure geometry, so nothing here is
// touched again while the leaf animates — only the CSS variables the loop writes.
function buildCurl(
  dir: 'next' | 'prev',
  from: number,
  to: number,
  refs: (HTMLDivElement | null)[],
) {
  let node: React.ReactNode = null
  for (let i = N - 1; i >= 0; i--) {
    const gut = 'calc(var(--bw) * 0.5)'
    const sw = `calc(var(--bw) * ${SPAN} / ${N})`
    const A = `calc(-1 * (${gut} + ${i} * ${sw}))` // faces the from-page
    const B = `calc(${i + 1} * ${sw} - ${gut})` // faces the to-page
    const front = dir === 'next' ? A : B
    const back = dir === 'next' ? B : A
    const child = node
    node = (
      <div
        className={`sbk-strip${i === N - 1 ? ' is-edge' : ''}`}
        key={i}
        style={{ ['--i' as string]: i }}
        ref={(el) => {
          refs[i] = el
        }}
      >
        <div className="sbk-face front">
          <div className="sbk-pagebox" style={{ left: front }}>
            <Spread i={from} />
          </div>
          <div className="sh" />
          <div className="gl" />
        </div>
        <div className="sbk-face back">
          <div className="sbk-pagebox" style={{ left: back }}>
            <Spread i={to} />
          </div>
          <div className="sh" />
          <div className="gl" />
        </div>
        {child}
      </div>
    )
  }
  return node
}

type Turn = { dir: 'next' | 'prev'; from: number; to: number }
type Spring =
  | { kind: 'spring'; v: number; target: number; k: number; c: number; done?: () => void }
  | { kind: 'tween'; from: number; target: number; dur: number; e: number; done?: () => void }

const Sketchbook = forwardRef<BookHandle, { onPage?: (i: number) => void }>(function Sketchbook(
  { onPage },
  handle,
) {
  const [idx, setIdx] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  // The page number is also kept in a ref. The riffle chains twelve turns through callbacks,
  // and a startTurn that read `idx` out of its closure would use the number from before the
  // chain started for every one of them.
  const idxRef = useRef(0)

  const d3 = useRef<HTMLDivElement>(null)
  const book = useRef<HTMLDivElement>(null)
  const capOut = useRef<HTMLSpanElement>(null)
  const capIn = useRef<HTMLSpanElement>(null)
  const strips = useRef<(HTMLDivElement | null)[]>([])

  // t, the spring and the view live in refs: they change every frame, and a re-render per
  // frame would rebuild fourteen strips' worth of DOM sixty times a second.
  const tRef = useRef(0)
  const turnRef = useRef<Turn | null>(null)
  const spring = useRef<Spring | null>(null)
  const raf = useRef<number | null>(null)
  const last = useRef(0)
  const view = useRef({ rx: 0, ry: 0, z: 1, trx: 0, try_: 0 })
  const viewActive = useRef(false)
  const drag = useRef<{
    dir: 'next' | 'prev'
    x0: number
    w: number
    moved: number
    vel: number
    tPrev: number
  } | null>(null)
  const [hinted, setHinted] = useState(false)
  const riffle = useRef<{ durs: number[]; bells: number[]; at: number } | null>(null)
  const [riffling, setRiffling] = useState(false)
  const [hard, setHard] = useState(false)

  const setPage = useCallback((i: number) => {
    idxRef.current = i
    setIdx(i)
  }, [])

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // ---- the lighting pass, run every frame of a turn ------------------------------------
  const applyTurn = useCallback((t: number) => {
    const el = d3.current
    if (!el) return
    const th = Math.PI * t // how far the leaf has swung
    const beta = BETA * Math.sin(Math.PI * t) // flat at both ends
    const D = 180 / Math.PI
    const tt = th + beta
    const td = (2 * beta) / N
    el.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg')
    el.style.setProperty('--td', (td * D).toFixed(3) + 'deg')
    el.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3))
    // The old title is gone before the new one arrives, so they never overlap mid-drag.
    if (capOut.current && capIn.current) {
      const clamp = (v: number) => Math.max(0, Math.min(1, v))
      capOut.current.style.opacity = clamp(1 - (t - 0.1) / 0.28).toFixed(3)
      capIn.current.style.opacity = clamp((t - 0.56) / 0.3).toFixed(3)
    }
    for (let i = 0; i < strips.current.length; i++) {
      const s = strips.current[i]
      if (!s) continue
      const l1 = Math.abs(Math.cos(tt - i * td)) // facing, at this strip's near edge
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td)) // ...and at its far edge
      s.style.setProperty('--lit', l1.toFixed(3))
      s.style.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3))
      s.style.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3))
    }
  }, [])

  const applyView = useCallback(() => {
    const el = d3.current
    if (!el) return
    const v = view.current
    el.style.setProperty('--rx', v.rx.toFixed(2) + 'deg')
    el.style.setProperty('--ry', v.ry.toFixed(2) + 'deg')
  }, [])

  const tick = useCallback(
    (now: number) => {
      raf.current = null
      const dt = Math.min(0.032, (now - last.current) / 1000 || 0.016)
      last.current = now
      const s = spring.current
      if (s && turnRef.current) {
        if (s.kind === 'tween') {
          s.e += dt
          const k = Math.min(1, s.e / s.dur)
          tRef.current = s.from + (s.target - s.from) * k
          applyTurn(tRef.current)
          if (k >= 1) {
            spring.current = null
            s.done?.()
          }
        } else {
          const x = tRef.current - s.target
          s.v += (-s.k * x - s.c * s.v) * dt
          tRef.current += s.v * dt
          if (Math.abs(tRef.current - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
            tRef.current = s.target
            spring.current = null
            applyTurn(tRef.current)
            s.done?.()
          } else applyTurn(tRef.current)
        }
      }
      // the view's own easing, toward whatever the pointer last asked for
      const e = 0.14
      let moved = false
      const v = view.current
      for (const [k, t] of [
        ['rx', 'trx'],
        ['ry', 'try_'],
      ] as const) {
        const d = v[t] - v[k]
        if (Math.abs(d) > 0.0006) {
          v[k] += d * e
          moved = true
        } else v[k] = v[t]
      }
      if (moved) applyView()
      viewActive.current = moved
      if ((spring.current || moved) && raf.current === null) {
        raf.current = requestAnimationFrame(tick)
      }
    },
    [applyTurn, applyView],
  )

  const kick = useCallback(() => {
    if (raf.current === null) {
      last.current = performance.now()
      raf.current = requestAnimationFrame(tick)
    }
  }, [tick])

  const setTilt = useCallback(
    (rx: number, ry: number) => {
      const v = view.current
      v.trx = Math.max(-TILT_X, Math.min(TILT_X, rx))
      v.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry))
      viewActive.current = true
      kick()
    },
    [kick],
  )

  // The book leans toward the cursor — no dragging, and never far.
  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || drag.current) return
      const r = book.current?.getBoundingClientRect()
      if (!r || !r.width) return
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.62)))
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)))
      setTilt(-ny * TILT_X, nx * TILT_Y)
    }
    const off = () => setTilt(0, 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', off)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', off)
    }
  }, [reduced, setTilt])

  // --bw is the book's own width in px; every strip offset is a fraction of it.
  useEffect(() => {
    const el = book.current
    const host = d3.current
    if (!el || !host) return
    const layout = () => host.style.setProperty('--bw', el.clientWidth + 'px')
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])


  useEffect(() => {
    onPage?.(idx)
  }, [idx, onPage])

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    },
    [],
  )

  const startTurn = useCallback(
    (dir: 'next' | 'prev', t: number) => {
      spring.current = null
      // Settle anything still in flight, then leave from wherever that put us.
      const from = turnRef.current ? turnRef.current.to : idxRef.current
      const next: Turn = {
        dir,
        from,
        to: dir === 'next' ? (from + 1) % M : (from - 1 + M) % M,
      }
      tRef.current = t
      turnRef.current = next
      setPage(from)
      setTurn(next)
    },
    [setPage],
  )

  const finish = useCallback(() => {
    const t = turnRef.current
    if (t) setPage(t.to)
    turnRef.current = null
    tRef.current = 0
    setTurn(null)
    // The sheet coming to rest. Not during a riffle — twelve landings in under two seconds is
    // a drum roll, and the swish per page already carries it.
    if (!riffle.current) paperLand()
  }, [setPage])

  const commit = useCallback(() => {
    if (!turnRef.current) return
    if (reduced) {
      finish()
      return
    }
    paper(0.9)
    spring.current = { kind: 'spring', v: 0, target: 1, k: 170, c: 26, done: finish }
    kick()
  }, [finish, kick, reduced])

  const cancel = useCallback(() => {
    if (!turnRef.current) return
    // Softer: the page is falling back, not going over.
    paper(0.3)
    spring.current = {
      kind: 'spring',
      v: 0,
      target: 0,
      k: 150,
      c: 24,
      done: () => {
        turnRef.current = null
        tRef.current = 0
        setTurn(null)
      },
    }
    kick()
  }, [kick])

  // A turn's DOM has just been committed, so the leaf can be lit at its starting angle — and,
  // if a riffle is running, this is where the next page in the chain is set going. Doing it
  // here rather than in a callback is what guarantees the strips exist before the tween starts.
  useEffect(() => {
    turnRef.current = turn
    if (!turn) {
      d3.current?.style.setProperty('--shade', '0')
      return
    }
    applyTurn(tRef.current)
    const r = riffle.current
    if (!r) return
    const bell = r.bells[r.at]
    setHard(bell > 0.55)
    paper(0.45 + 0.5 * bell)
    spring.current = {
      kind: 'tween',
      from: 0,
      target: 1,
      dur: r.durs[r.at],
      e: 0,
      done: () => {
        finish()
        // Bail if the riffle was cut short while this tween was in flight.
        if (riffle.current !== r) return
        r.at += 1
        if (r.at < r.durs.length) {
          requestAnimationFrame(() => startTurn('next', 0))
        } else {
          riffle.current = null
          setRiffling(false)
          setHard(false)
          // The one landing the riffle does get: it marks the end of the demonstration.
          paperLand()
        }
      },
    }
    kick()
  }, [turn, applyTurn, finish, kick, startTurn])

  // Riffle on arrival: the book shows what it is by doing it, then comes back to Plate 01.
  const endRiffle = useCallback(() => {
    if (!riffle.current) return
    riffle.current = null
    setRiffling(false)
    setHard(false)
  }, [])

  useEffect(() => {
    if (reduced) return
    const el = book.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        if (riffle.current) return
        const steps = RIFFLE_PASSES * M
        const bells: number[] = []
        const durs: number[] = []
        for (let r = 0; r < steps; r++) {
          const bell = Math.sin(Math.PI * (r / (steps - 1)))
          bells.push(bell)
          durs.push(0.26 - 0.19 * bell)
        }
        riffle.current = { durs, bells, at: 0 }
        setRiffling(true)
        startTurn('next', 0)
      },
      // Enough of the book on screen that the riffle is not happening off the bottom edge.
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, startTurn])

  const step = useCallback(
    (dir: 'next' | 'prev') => {
      track('sketchbook_interaction', { action: 'step', direction: dir })
      setHinted(true)
      endRiffle() // a deliberate turn takes over from the demonstration
      startTurn(dir, 0)
      // The strips must exist before the spring starts pushing them.
      requestAnimationFrame(() => commit())
    },
    [commit, endRiffle, startTurn],
  )

  useImperativeHandle(
    handle,
    () => ({
      goTo: (i: number) => {
        endRiffle()
        const at = idxRef.current
        if (i === at && !turnRef.current) return
        track('sketchbook_interaction', {
          action: 'go_to',
          project: PAGES[i].name,
          index: i + 1,
        })
        const fwd = (i - at + M) % M
        const back = (at - i + M) % M
        if (Math.min(fwd, back) === 1) {
          step(fwd === 1 ? 'next' : 'prev')
          return
        }
        setHinted(true)
        turnRef.current = null
        tRef.current = 0
        setTurn(null)
        setPage(i)
      },
    }),
    [endRiffle, setPage, step],
  )

  // ---- pointer: drag a page across the gutter ------------------------------------------
  const onDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    const zone = (e.target as HTMLElement).closest('.sbk-zone')
    e.currentTarget.setPointerCapture(e.pointerId)
    setHinted(true)
    if (!zone) return
    if (riffle.current) return // hands off while it is riffling; the arrows can interrupt it
    e.preventDefault() // no text selection, no drag ghost
    const r = book.current?.getBoundingClientRect()
    if (!r) return
    const dir = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev'
    startTurn(dir, 0)
    drag.current = {
      dir,
      x0: e.clientX,
      w: r.width,
      moved: 0,
      vel: 0,
      tPrev: performance.now(),
    }
  }

  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current
    if (!d || !turnRef.current) return
    const dx = e.clientX - d.x0
    d.moved = Math.max(d.moved, Math.abs(dx))
    const raw = (d.dir === 'next' ? -dx : dx) / (d.w * 0.62)
    const t = Math.max(0, Math.min(1, raw))
    const now = performance.now()
    d.vel = (t - tRef.current) / Math.max(0.001, (now - d.tPrev) / 1000)
    d.tPrev = now
    tRef.current = t
    applyTurn(t)
  }

  const onUp = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    if (!turnRef.current) return
    if (d.moved < 6) {
      track('sketchbook_interaction', { action: 'tap_turn', direction: d.dir })
      commit() // a tap, not a drag
      return
    }
    if (tRef.current > 0.42 || d.vel > 1.1) {
      track('sketchbook_interaction', { action: 'drag_turn', direction: d.dir })
      commit()
    } else {
      track('sketchbook_interaction', { action: 'drag_cancel', direction: d.dir })
      cancel()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      // Only when the book is actually on screen — the arrow keys belong to the page otherwise.
      const r = book.current?.getBoundingClientRect()
      if (!r || r.bottom < 0 || r.top > window.innerHeight) return
      e.preventDefault()
      step(e.key === 'ArrowRight' ? 'next' : 'prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const cur = turn ? turn.from : idx
  const nxt = turn ? turn.to : idx

  return (
    <div
      className={`sbk-wrap${riffling ? ' is-riffle' : ''}${hard ? ' is-hard' : ''}`}
      aria-hidden="true"
    >
      {/* Horizontal-only blur, so a page flicked past smears along its travel rather than
          going soft in every direction. CSS blur() cannot do one axis, hence the filters —
          and they are applied to the flat pages only, never to the curl, because a filter
          flattens the 3D of everything inside it. */}
      <svg className="sbk-defs" aria-hidden="true">
        <filter id="sbk-mb1">
          <feGaussianBlur stdDeviation="5 0" />
        </filter>
        <filter id="sbk-mb2">
          <feGaussianBlur stdDeviation="14 0" />
        </filter>
      </svg>
      <div className="sbk-stage">
        <button className="sbk-arrow left" onClick={() => step('prev')} tabIndex={-1}>
          <svg viewBox="0 0 14 44" width="14" height="44" fill="none">
            <polyline
              points="11,3 3,22 11,41"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="sbk-3d"
          ref={d3}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="sbk-tilt">
            <div className="sbk-cast ambient" />
            <div className="sbk-cast contact" />
            <div className="sbk-cast hair" />

            {/* The case. Boards overhanging the text block — the "square" of a hardback — with
                the spine showing at head and tail, and the board's own edge below. Then the
                page block: three sheets, each a little smaller than the last, so the stack
                shows as a taper at the fore-edges rather than as one line. All of it is drawn
                flat in hairlines rather than extruded in Z: the tilt only runs to 4.5°, which
                over any believable board thickness is about a pixel of parallax — real depth
                here would cost the risk and show nothing. */}
            <div className="sbk-cover" />
            <div className="sbk-leaves l3" />
            <div className="sbk-leaves l2" />
            <div className="sbk-leaves l1" />

            <div className="sbk-book" ref={book}>
              {!turn ? (
                <div className="sbk-full">
                  <Spread i={idx} interactive />
                </div>
              ) : (
                <>
                  <Half pos="left" i={turn.dir === 'next' ? turn.from : turn.to} />
                  <Half pos="right" i={turn.dir === 'next' ? turn.to : turn.from} />
                  <div
                    className={`sbk-curl ${turn.dir}`}
                    // The strips take their width from these, so the count and the span live
                    // in one place — here — rather than once in TS and again in the CSS.
                    style={{ ['--n' as string]: N, ['--span' as string]: SPAN }}
                  >
                    {buildCurl(turn.dir, turn.from, turn.to, strips.current)}
                  </div>
                </>
              )}
              <button className="sbk-zone prev" tabIndex={-1} />
              <button className="sbk-zone next" tabIndex={-1} />
            </div>
          </div>
        </div>

        <button className="sbk-arrow right" onClick={() => step('next')} tabIndex={-1}>
          <svg viewBox="0 0 14 44" width="14" height="44" fill="none">
            <polyline
              points="3,3 11,22 3,41"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className="sbk-captions">
        <span className="sbk-caption" ref={capOut}>
          {PAGES[cur].name}
        </span>
        {turn && (
          <span className="sbk-caption" ref={capIn} style={{ opacity: 0 }}>
            {PAGES[nxt].name}
          </span>
        )}
      </p>

      <p className={`sbk-hint${hinted ? ' gone' : ''}`}>Drag the page to turn · or ← →</p>
    </div>
  )
})

export default Sketchbook
