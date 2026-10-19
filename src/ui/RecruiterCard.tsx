import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SOCIAL_ICONS, getSocialIcon } from './SocialIcons'
import { portfolioConfig } from '../portfolio.config'

const EASE = [0.22, 1, 0.36, 1]

export default function RecruiterCard() {
  const { personal, recruiter } = portfolioConfig
  const fits = recruiter.fits

  const [open, setOpen] = useState(false)
  const [fit, setFit] = useState(fits[0] || { id: 'default', label: 'Overview', points: [] })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!recruiter.enabled || fits.length === 0) return null

  const resume = personal.resume
  const resumeHref = resume.url.startsWith('http')
    ? resume.url
    : `${import.meta.env.BASE_URL}${resume.url}`

  const emailHref = personal.email.startsWith('mailto:')
    ? personal.email
    : `mailto:${personal.email}`

  const githubLink = personal.socialLinks.find((l) => l.id.toLowerCase() === 'github')?.href
  const linkedinLink = personal.socialLinks.find((l) => l.id.toLowerCase() === 'linkedin')?.href

  const GithubIcon = SOCIAL_ICONS.github
  const LinkedinIcon = SOCIAL_ICONS.linkedin

  return (
    <>
      <button className="rq-trigger" onClick={() => setOpen(true)}>
        recruiter view
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="rq-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="rq-card"
              role="dialog"
              aria-label="Recruiter quick view"
              initial={{ opacity: 0, scale: 0.985, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="rq-close" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>

              <div className="rq-head">
                <span className="rq-eyebrow">Recruiter quick view</span>
                <h3 className="rq-name">{personal.name}</h3>
                <p className="rq-tagline">
                  {personal.role} · {personal.location}
                </p>
              </div>

              <div className="rq-chips" role="tablist" aria-label="Role fit areas">
                {fits.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={fit.id === f.id}
                    className={`rq-chip${fit.id === f.id ? ' is-active' : ''}`}
                    onClick={() => setFit(f)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="rq-panel" role="tabpanel">
                <ul className="rq-points">
                  {fit.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="rq-actions">
                {resume.url && (
                  <a
                    className="rq-btn is-primary"
                    href={resumeHref}
                    download={resume.downloadName}
                  >
                    <span>{resume.label || 'Download résumé'}</span>
                    <span aria-hidden="true">↓</span>
                  </a>
                )}
                <a className="rq-btn" href={emailHref}>
                  <span>Get in touch</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>

              <div className="rq-foot">
                <span>Direct links:</span>
                {githubLink && (
                  <a href={githubLink} target="_blank" rel="noopener noreferrer">
                    <GithubIcon style={{ width: 14, height: 14 }} /> GitHub
                  </a>
                )}
                {linkedinLink && (
                  <a href={linkedinLink} target="_blank" rel="noopener noreferrer">
                    <LinkedinIcon style={{ width: 14, height: 14 }} /> LinkedIn
                  </a>
                )}
                {personal.socialLinks
                  .filter((l) => !['github', 'linkedin', 'email', 'mail'].includes(l.id.toLowerCase()))
                  .map((l) => {
                    const Icon = getSocialIcon(l.id)
                    return (
                      <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer">
                        <Icon style={{ width: 14, height: 14 }} /> {l.label}
                      </a>
                    )
                  })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
