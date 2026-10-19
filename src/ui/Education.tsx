import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useSectionAnalytics } from './analytics'
import { portfolioConfig } from '../portfolio.config'

const SPRITE = 'experience/ink-sprite.png'
const EDGE = 'experience/ink-frame.png'

const DISSOLVE_MS = 1400
const DWELL_MS = 2200

const GALLERY = portfolioConfig.education.gallery || []

function Gallery() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const still = useReducedMotion()
  const [seen, setSeen] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [entered, setEntered] = useState(false)
  const [i, setI] = useState(0)
  const base = import.meta.env.BASE_URL

  useEffect(() => {
    if (!inView || seen || GALLERY.length === 0) return
    let cancelled = false
    const load = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      })

    Promise.all([load(`${base}${SPRITE}`), load(`${base}${GALLERY[0]}`)]).then(() => {
      if (!cancelled) setSeen(true)
    })

    return () => {
      cancelled = true
    }
  }, [base, inView, seen])

  useEffect(() => {
    if (seen && still) setEntered(true)
  }, [seen, still])

  useEffect(() => {
    if (!seen || still || revealing || entered) return
    const raf = requestAnimationFrame(() => setRevealing(true))
    return () => cancelAnimationFrame(raf)
  }, [entered, revealing, seen, still])

  useEffect(() => {
    if (!revealing || entered) return
    const id = window.setTimeout(() => setEntered(true), DISSOLVE_MS + 120)
    return () => clearTimeout(id)
  }, [entered, revealing])

  useEffect(() => {
    if (!inView || still || !entered || GALLERY.length <= 1) return
    const id = window.setInterval(
      () => setI((v) => (v + 1) % GALLERY.length),
      DISSOLVE_MS + DWELL_MS,
    )
    return () => clearInterval(id)
  }, [entered, inView, still])

  if (GALLERY.length === 0) return null

  const under = entered ? GALLERY[(i + 1) % GALLERY.length] : null

  return (
    <div
      className="edu-gallery"
      ref={ref}
      role="img"
      aria-label={`Campus and academic life at ${portfolioConfig.education.place}`}
    >
      <div className="edu-gal-plate">
        {seen && (
          <div className={`edu-gal-stack${revealing ? ' is-revealing' : ''}`}>
            {under && (
              <div
                className="edu-gal-img"
                style={{ backgroundImage: `url(${base}${under})` }}
              />
            )}
            <div
              key={i}
              className={`edu-gal-img${!still && entered ? ' is-dissolving' : ''}`}
              style={{
                backgroundImage: `url(${base}${GALLERY[i]})`,
                ...(entered
                  ? {
                      maskImage: `url(${base}${SPRITE})`,
                      WebkitMaskImage: `url(${base}${SPRITE})`,
                    }
                  : {}),
              }}
            />
            {!entered && (
              <div
                className="edu-gal-wipe"
                style={{
                  maskImage: `url(${base}${SPRITE})`,
                  WebkitMaskImage: `url(${base}${SPRITE})`,
                }}
                onTransitionEnd={(e) => {
                  if (e.propertyName === '--ink-frame') setEntered(true)
                }}
              />
            )}
          </div>
        )}
        <div
          className="edu-gal-edge"
          style={{
            maskImage: `url(${base}${EDGE})`,
            WebkitMaskImage: `url(${base}${EDGE})`,
          }}
        />
      </div>
    </div>
  )
}

const EASE = [0.22, 1, 0.36, 1]
const rowV = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export default function Education() {
  const d = portfolioConfig.education
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('education', sectionRef)

  return (
    <section className="education" ref={sectionRef}>
      <motion.div
        className="section-inner"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.header className="sec-head" variants={rowV}>
          <span className="sec-no">{d.sectionNo || '02'}</span>
          <h2 className="sec-title">{d.title}</h2>
          <span className="sec-tagline">{d.tagline}</span>
        </motion.header>

        <motion.div className="edu-record" variants={rowV}>
          <div>
            <h3 className="edu-degree">{d.degree}</h3>
            <div className="edu-place">{d.place}</div>
            <div className="edu-period">{d.period}</div>
          </div>
          {d.cgpa && (
            <div className="edu-grade">
              <span className="edu-grade-num">{d.cgpa}</span>
              <span className="edu-grade-unit">/{d.cgpaMax || '10'}</span>
              <span className="edu-grade-label">cgpa</span>
            </div>
          )}
        </motion.div>

        {d.coursework && d.coursework.length > 0 && (
          <div className="sk-list">
            <motion.div className="sk-row" variants={rowV}>
              <div className="sk-label">Coursework</div>
              <ul className="sk-items">
                {d.coursework.map((c) => (
                  <li className="sk-item" key={c}>
                    {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        <div className="edu-lower">
          {d.notes && d.notes.length > 0 && (
            <motion.ul className="tl-points edu-points" variants={rowV}>
              {d.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </motion.ul>
          )}
          {d.gallery && d.gallery.length > 0 && (
            <motion.div variants={rowV}>
              <Gallery />
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
