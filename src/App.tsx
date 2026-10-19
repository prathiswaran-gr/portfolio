import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Education from './ui/Education'
import Skills from './ui/Skills'
import SoundToggle from './ui/SoundToggle'
import ThemeToggle from './ui/ThemeToggle'
import { initClickSound, initSound } from './ui/sound'
import { initTheme } from './ui/theme'
import { useDynamicSEO } from './ui/useDynamicSEO'
import Works from './ui/Works'
import Writing from './ui/Writing'
import Github from './ui/Github'
import RecruiterCard from './ui/RecruiterCard'
import Footer from './ui/Footer'
import Cursor from './ui/Cursor'
import Aurora from './ui/Aurora'
import DevTools from './ui/DevTools'
import InkReveal from './ui/InkReveal'
import { useSectionAnalytics } from './ui/analytics'
import { portfolioConfig } from './portfolio.config'

function StatNumber({
  value,
  suffix = '',
  delay = 0,
}: {
  value: number
  suffix?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(value)
      return
    }

    let raf = 0
    const start = performance.now() + delay
    const duration = 1200
    const tick = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(tick)
        return
      }
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [delay, inView, value])

  const final = `${value}${suffix}`
  return (
    <span ref={ref} className="stat-num" aria-label={final}>
      {shown}
      {suffix}
    </span>
  )
}

function Stats() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('stats', sectionRef)
  const stats = portfolioConfig.stats

  if (!stats || stats.length === 0) return null

  return (
    <section className="stats" aria-label="At a glance" ref={sectionRef}>
      {stats.map(({ value, suffix, label }, i) => (
        <motion.div
          key={i}
          className="stat"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
        >
          <StatNumber value={value} suffix={suffix} delay={i * 90} />
          <span className="stat-label">{label}</span>
        </motion.div>
      ))}
    </section>
  )
}

function Hero({ cueOpacity }: { cueOpacity: MotionValue<number> }) {
  const { personal } = portfolioConfig
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('hero', sectionRef)

  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const fade: [number, number] = [0, vh * 0.5]
  const blur = useTransform(scrollY, fade, ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollY, fade, [1, 0])
  const titleY = useTransform(scrollY, [0, vh], [0, -96])
  const bodyY = useTransform(scrollY, [0, vh], [0, -52])
  const titleSpacing = useTransform(scrollY, [0, vh], ['-0.03em', '0.06em'])

  const base = import.meta.env.BASE_URL
  const avatarUrl = personal.avatar.startsWith('http')
    ? personal.avatar
    : `${base}${personal.avatar}`

  return (
    <section className="hero" ref={sectionRef}>
      <motion.div className="about" style={{ filter: blur, opacity }}>
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {personal.headline}
          </motion.h1>
          {personal.heroParagraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
          {personal.now && (
            <motion.p className="about-now" style={{ y: bodyY }}>
              <span className="about-now-label">
                <span className="now-blink" aria-hidden="true" />
                now
              </span>{' '}
              {personal.now}
            </motion.p>
          )}
        </div>

        {personal.avatar && (
          <div className="hero-photo" role="img" aria-label={personal.name}>
            <div className="hero-photo-plate">
              <div
                className="hero-photo-img"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              />
              <div
                className="hero-photo-edge"
                style={{
                  maskImage: `url(${base}experience/ink-frame.png)`,
                  WebkitMaskImage: `url(${base}experience/ink-frame.png)`,
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">SCROLL</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

export default function App() {
  const { scrollY } = useScroll()
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  // Initialize theme and dynamic SEO
  useEffect(() => initTheme(), [])
  useDynamicSEO()

  // Audio gestures
  useEffect(() => initSound(), [])
  useEffect(() => initClickSound(), [])

  const { personal, recruiter } = portfolioConfig
  const { heroMarks, heroMeta } = personal

  return (
    <>
      {/* Hero chrome: hairline frame + corner marks + corner metadata */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">{heroMarks.tl}</span>
        <span className="hero-mark tr">{heroMarks.tr}</span>
        <span className="hero-mark bl">{heroMarks.bl}</span>
        <span className="hero-mark br">{heroMarks.br}</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">{heroMeta.leftName}</span>
          <span>{heroMeta.leftRole}</span>
        </div>
        <div className="hero-meta hm-bl">{heroMeta.bottomLeft}</div>
        <div className="hero-meta hm-right">{heroMeta.bottomRight}</div>
      </motion.div>

      {/* Floating controls: sound toggle & dark/light theme toggle */}
      <div className="floating-controls">
        <SoundToggle />
        <ThemeToggle />
      </div>

      {/* Recruiter quick view: fixed trigger + hire-fit card */}
      {recruiter.enabled && <RecruiterCard />}

      {/* Light under the page — rises with scroll velocity */}
      <Aurora />

      {/* Custom accent cursor */}
      <Cursor />

      {/* Full-screen organic film grain */}
      <NoiseOverlay />

      {/* Splash ink reveal mask */}
      <InkReveal />

      {/* Dev-only controls */}
      {import.meta.env.DEV && <DevTools />}

      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <Resume />
        <Education />
        <Skills />
        <Stats />
        <Works />
        <Writing />
        <Github />
        <Footer />
      </main>
    </>
  )
}
