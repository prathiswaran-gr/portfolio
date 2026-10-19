import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getSocialIcon } from './SocialIcons'
import { track, useSectionAnalytics } from './analytics'
import { portfolioConfig, type ResumeEntry, type ResumeGroup } from '../portfolio.config'

const SPRITE = 'experience/ink-sprite.png'
const EDGE = 'experience/ink-frame.png'

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading = group.link ? (
    <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
      {group.heading}
    </a>
  ) : (
    <span>{group.heading}</span>
  )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {group.logoImg && (
          <span className="tl-group-logo">
            <img src={group.logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = getSocialIcon(l.id)
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry }: { entry: ResumeEntry }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!entry.ink || import.meta.env.DEV) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([rec]) => el.classList.toggle('ink-pinned', rec.isIntersecting),
      { rootMargin: '-32% 0px -32% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [entry.ink])

  const on = (e: React.PointerEvent<HTMLDivElement>) =>
    e.pointerType === 'mouse' && ref.current?.classList.add('ink-on')
  const off = () => ref.current?.classList.remove('ink-on')

  return (
    <motion.div
      ref={ref}
      className={`tl-entry${entry.ink ? ' has-ink' : ''}`}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      onPointerEnter={entry.ink ? on : undefined}
      onPointerLeave={entry.ink ? off : undefined}
    >
      {entry.ink && (
        <div className="tl-ink" aria-hidden="true">
          <div className="tl-ink-plate">
            <div
              className="tl-ink-photo"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${entry.ink})` }}
            />
            <div
              className="tl-ink-edge"
              style={{
                maskImage: `url(${import.meta.env.BASE_URL}${EDGE})`,
                WebkitMaskImage: `url(${import.meta.env.BASE_URL}${EDGE})`,
              }}
            />
            <div
              className="tl-ink-wipe"
              style={{
                maskImage: `url(${import.meta.env.BASE_URL}${SPRITE})`,
                WebkitMaskImage: `url(${import.meta.env.BASE_URL}${SPRITE})`,
              }}
            />
          </div>
        </div>
      )}
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <div className="tl-main">
          <motion.div className="tl-head" variants={itemV}>
            {entry.logo && (
              <span className="tl-logo-chip">
                <img src={entry.logo.src} alt={entry.logo.alt} loading="lazy" />
              </span>
            )}
            <h3 className="tl-place">{entry.place}</h3>
          </motion.div>
          {entry.role && (
            <motion.div className="tl-role" variants={itemV}>
              {entry.role}
            </motion.div>
          )}
          {entry.points && (
            <motion.ul className="tl-points" variants={itemV}>
              {entry.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </motion.ul>
          )}
          {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
        </div>
      </div>
    </motion.div>
  )
}

export default function Resume() {
  const data = portfolioConfig.experience
  const socialLinks = portfolioConfig.personal.socialLinks
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('resume', sectionRef)

  return (
    <section className="resume" ref={sectionRef}>
      <div className="section-inner">
        <motion.header
          className="sec-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="sec-no">{data.sectionNo || '01'}</span>
          <h2 className="sec-title">{data.title}</h2>
          <span className="sec-tagline">{data.tagline}</span>
        </motion.header>
        {/* Contact row */}
        <motion.div
          className="resume-contact tl-logos"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
        >
          {socialLinks.map((l) => {
            const Icon = getSocialIcon(l.id)
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
                onClick={() =>
                  track(l.id === 'email' ? 'contact_intent' : 'social_click', {
                    location: 'resume',
                    platform: l.id,
                  })
                }
              >
                <Icon />
              </a>
            )
          })}
        </motion.div>
        <div className="timeline">
          {data.entries.map((e, i) => (
            <Entry key={i} entry={e} />
          ))}
        </div>
      </div>
    </section>
  )
}
