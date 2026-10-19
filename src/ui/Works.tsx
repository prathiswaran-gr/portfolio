import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PROJECTS, type Project } from '../data/projects'
import { canHover, chirp } from './sound'
import Sketchbook, { type BookHandle } from './Sketchbook'
import { track, useSectionAnalytics } from './analytics'

// The book needs room, a real pointer, and permission to move. Exactly this query gates it in
// styles.css too, so what React mounts and what CSS paints can never disagree.
const BOOK_Q =
  '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

// Projects as a plate book: a numbered index — the contents page — and then the plates
// themselves. The structure is borrowed from Meng To's Sketchbook, which pairs a `Plates`
// list of `NN / title / place` rows with the pages it points at.
//
// What is deliberately NOT borrowed is everything else about it: no warm paper, no serif, and
// above all no 3D book with three layers of cast shadow and a draggable magnifying glass.
// That page is beautiful and belongs to a site built on depth; this one is white, hairlines,
// mono labels and one accent, and it already owns a paper language of its own — the ink
// sprite, the torn edge, the grain. So the leaf is drawn in that language rather than in the
// reference's, and the page-turn becomes the ink it already prints with.
//
// Everything stays inline. A book you flip through would photograph better and would hide
// four projects out of five behind a click, which is the one thing this section has always
// refused to do; scrolling is the page-turn.
//
// Content lives in data/projects.ts.

// The résumé plates' own art, reused: the 40-frame ink sprite and the torn border.
const SPRITE = 'experience/ink-sprite.png'
const EDGE = 'experience/ink-frame.png'

const EASE = [0.22, 1, 0.36, 1]
const rowV = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

// The page turn. The leaf is hinged on its stitched spine (transform-origin sits on the left
// edge in styles.css, and .pl-plates carries the perspective), so it swings down flat onto the
// stack as you reach it rather than fading up like every other row on the site. That is the
// one motion the reference is really about, and it costs a rotation — no canvas, no 3D scene,
// and nothing hidden behind a click to pay for it.
//
// The blend-mode caveat in the timeline block does not bite here: an animated transform does
// isolate a descendant's mix-blend-mode, but the plate's own background is white and multiply
// against white is the identity, so an inked `shot` composites the same either way.
// Positive, so the leaf's far edge tips AWAY and the turn pulls it inward — it lands like a
// page dropping onto the stack. Negative would tip it toward the viewer, and the projection
// says that throws the far edge ~130px past the measure at 13°: further than the 60px gutter,
// so `overflow-x: hidden` on the page would slice the leaf's edge off for the whole turn.
const leafV = {
  hidden: { opacity: 0, rotateY: 13, y: 10 },
  show: { opacity: 1, rotateY: 0, y: 0, transition: { duration: 0.9, ease: EASE } },
}

const plateId = (i: number) => `plate-${String(i + 1).padStart(2, '0')}`
const plateNo = (i: number) => String(i + 1).padStart(2, '0')

function Plate({
  p,
  i,
  onEl,
  variants,
}: {
  p: Project
  i: number
  onEl: (el: HTMLElement | null) => void
  variants: typeof rowV
}) {
  // The ink stamp fires once, when the plate arrives. Tracked here rather than by the parent's
  // observer below because the two want different bands: this one wants "on screen", that one
  // wants "in the middle of the screen".
  const [stamped, setStamped] = useState(false)
  const base = import.meta.env.BASE_URL
  const no = plateNo(i)

  return (
    <motion.article
      className={`pl-plate${stamped ? ' is-stamped' : ''}`}
      id={plateId(i)}
      ref={onEl}
      variants={variants}
      viewport={{ once: true, margin: '-15% 0px' }}
      onViewportEnter={() => setStamped(true)}
    >
      {/* The plate caption, as a printed plate carries it: number left, date right. */}
      <div className="pl-rail">
        <span className="pl-rail-no">Plate {no}</span>
        <span className="pl-rail-year">{p.year}</span>
      </div>

      <div className="pl-body">
        <div className="pl-main">
          <h3 className="pj-name">{p.name}</h3>
          {p.award && <span className="pj-award">{p.award}</span>}
          <p className="pj-blurb">{p.blurb}</p>
          <p className="pj-body">{p.body}</p>

          <ul className="pj-stack" aria-label="Stack">
            {p.stack.map((s) => (
              <li className="pj-tag" key={s}>
                {s}
              </li>
            ))}
          </ul>

          <div className="pj-links">
            {p.live && (
              <a
                className="pj-link is-live"
                href={p.live.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('project_open', {
                    project: p.name,
                    destination: 'live',
                    label: p.live?.label,
                  })
                }
              >
                {p.live.label} <span aria-hidden="true">↗</span>
              </a>
            )}
            {p.link ? (
              <a
                className="pj-link"
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('project_open', {
                    project: p.name,
                    destination: 'source',
                  })
                }
              >
                View source <span aria-hidden="true">↗</span>
              </a>
            ) : (
              /* Only when there is nowhere else to go — an entry with a store listing already
                 offers something to click, and the note beside it reads as an apology for a
                 gap that isn't there. */
              !p.live && <span className="pj-link is-private">Private repository</span>
            )}
          </div>
        </div>

        {/* The fold between the two pages of the leaf. Purely drawn — see styles.css. */}
        <div className="pl-gutter" aria-hidden="true" />

        {/* The art slot. An inked screenshot when the entry has one; otherwise the plate
            number, stamped through the ink sprite. Decorative either way — the rail above
            already says which plate this is, in text. */}
        <div className="pl-art" aria-hidden="true">
          {p.shot ? (
            <div className="pl-shot">
              <div
                className="pl-shot-photo"
                style={{ backgroundImage: `url(${base}${p.shot})` }}
              />
              <div
                className="pl-shot-edge"
                style={{
                  maskImage: `url(${base}${EDGE})`,
                  WebkitMaskImage: `url(${base}${EDGE})`,
                }}
              />
            </div>
          ) : (
            <span
              className="pl-num"
              style={{
                maskImage: `url(${base}${SPRITE})`,
                WebkitMaskImage: `url(${base}${SPRITE})`,
              }}
            >
              {no}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function Works() {
  const data = PROJECTS
  const items = data.items
  // A page turn is a bigger movement than the site's usual fade-up, so it is the one entrance
  // here that asks first. Reduced motion gets the plain row.
  const still = useReducedMotion()
  const plateEls = useRef<(HTMLElement | null)[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const book = useRef<BookHandle>(null)
  const [bookOn, setBookOn] = useState(false)
  useSectionAnalytics('works', sectionRef)

  useEffect(() => {
    const q = window.matchMedia(BOOK_Q)
    const upd = () => setBookOn(q.matches)
    upd()
    q.addEventListener('change', upd)
    return () => q.removeEventListener('change', upd)
  }, [])

  // Where the index gets "this one" from. With the book up the index drives it and the book
  // reports back, which is the reference's own arrangement. Without the book the plates are
  // the section, so it runs the other way: whichever plate is crossing the middle of the
  // viewport is the one marked.
  useEffect(() => {
    if (bookOn) return
    const els = plateEls.current.filter((el): el is HTMLElement => !!el)
    if (!els.length || typeof IntersectionObserver === 'undefined') return
    const on = new Array(els.length).fill(false)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = els.indexOf(e.target as HTMLElement)
          if (i >= 0) on[i] = e.isIntersecting
        }
        const first = on.indexOf(true)
        // Nothing in the band means we are in the gap between two plates. Leave the last one
        // marked rather than clearing it, so the index never blinks empty mid-scroll.
        if (first >= 0) setActive(first)
      },
      // A band across the middle of the viewport, not the whole of it: with the whole
      // viewport three plates qualify at once and the mark means nothing.
      { rootMargin: '-40% 0px -40% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [bookOn])

  return (
    <section className="works" ref={sectionRef}>
      <motion.div
        className="section-inner"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.header className="sec-head" variants={rowV}>
          <span className="sec-no">{data.sectionNo || '04'}</span>
          <h2 className="sec-title">{data.title}</h2>
          <span className="sec-tagline">{data.tagline}</span>
        </motion.header>
        <motion.p className="sec-sub" variants={rowV}>
          {data.sub}
        </motion.p>

        {/* The contents page. Plain anchors — html carries scroll-behavior: smooth, so the
            jump costs no JS and still works with it off. */}
        <motion.nav className="pl-index" variants={rowV} aria-label="Plates">
          <p className="pl-index-label">Plates</p>
          <ol className="pl-index-list">
            {items.map((p, i) => (
              <li key={p.name}>
                <a
                  className={`pl-row${i === active ? ' is-current' : ''}`}
                  href={`#${plateId(i)}`}
                  aria-current={i === active ? 'true' : undefined}
                  // One chirp per row, transposed by index — as the old project rows did.
                  onPointerEnter={() => canHover() && chirp(i)}
                  onClick={(e) => {
                    track('project_index_click', {
                      project: p.name,
                      mode: bookOn ? 'book' : 'anchor',
                    })
                    // With the book up the row turns to that plate instead of scrolling to a
                    // list that is not on screen. The href stays for the case where it is.
                    if (!bookOn) return
                    e.preventDefault()
                    book.current?.goTo(i)
                  }}
                >
                  <span className="pl-row-no">{plateNo(i)}</span>
                  <span className="pl-row-name">{p.name}</span>
                  <span className="pl-row-year">{p.year}</span>
                  <span className="pl-row-lead">{p.stack[0]}</span>
                  <span className="pl-row-go" aria-hidden="true">
                    ›
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </motion.nav>

        {/* The book, when there is room for it. */}
        {bookOn && <Sketchbook ref={book} onPage={setActive} />}

        {/* And the same projects as plates: the section itself on a narrow screen, under a
            coarse pointer, or when less motion was asked for — and, on a desktop where the
            book has taken over, still in the DOM unpainted so a screen reader gets every
            word of it. Same arrangement as the Skills graph and its list. */}
        <div className="pl-plates">
          {items.map((p, i) => (
            <Plate
              key={p.name}
              p={p}
              i={i}
              variants={still ? rowV : leafV}
              onEl={(el) => {
                plateEls.current[i] = el
              }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
