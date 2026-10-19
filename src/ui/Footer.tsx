import { useRef } from 'react'
import { motion } from 'framer-motion'
import { getSocialIcon } from './SocialIcons'
import { track, useSectionAnalytics } from './analytics'
import { portfolioConfig } from '../portfolio.config'

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('footer', sectionRef)

  const { personal, footer } = portfolioConfig
  const resume = personal.resume
  const resumeHref = resume.url.startsWith('http')
    ? resume.url
    : `${import.meta.env.BASE_URL}${resume.url}`

  return (
    <footer className="footer" ref={sectionRef}>
      <motion.div
        className="section-inner footer-top"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="footer-id">
          <span className="footer-name">{personal.name}</span>
          <span className="footer-role">
            {personal.role} · {personal.location}
          </span>
        </div>
        <div className="footer-links tl-logos">
          {personal.socialLinks.map((l) => {
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
                    location: 'footer',
                    platform: l.id,
                  })
                }
              >
                <Icon />
              </a>
            )
          })}
        </div>
      </motion.div>

      {resume.url && (
        <div className="section-inner footer-resume">
          <a
            className="footer-resume-link"
            href={resumeHref}
            download={resume.downloadName || 'resume.pdf'}
            onClick={() => track('resume_download', { location: 'footer' })}
          >
            <span>{resume.label || 'Download résumé'}</span>
            <span className="footer-resume-arrow" aria-hidden="true">
              ↓
            </span>
          </a>
          {resume.note && <span className="footer-resume-note">{resume.note}</span>}
        </div>
      )}

      <div className="section-inner footer-bottom">
        <span>{footer.closingNote}</span>
        <span>© {footer.copyrightYear}</span>
      </div>
    </footer>
  )
}
