import { useRef } from 'react'
import { motion } from 'framer-motion'
import { WRITING } from '../data/writing'
import { track, useSectionAnalytics } from './analytics'

const EASE = [0.22, 1, 0.36, 1]
const rowV = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

// Writing: the pieces about Android internals. External posts open on Medium;
// posts with a `slug` (future) would render on-site from src/content/blog/.
export default function Writing() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionAnalytics('writing', sectionRef)

  return (
    <section className="writing" ref={sectionRef}>
      <motion.div
        className="section-inner"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-8% 0px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        <motion.header className="sec-head" variants={rowV}>
          <span className="sec-no">{WRITING.sectionNo || '05'}</span>
          <h2 className="sec-title">{WRITING.title}</h2>
          <span className="sec-tagline">{WRITING.tagline || 'Android internals'}</span>
        </motion.header>
        <motion.p className="sec-sub" variants={rowV}>
          {WRITING.sub}
        </motion.p>

        {/* Plain wrapper: framer variants pass through it, so each row stays a stagger
            child of the section container above. */}
        <div className="post-list">
          {WRITING.posts.map((post, i) => (
            <motion.a
              key={i}
              className="post-row"
              variants={rowV}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track('writing_open', {
                  title: post.title,
                  source: post.source,
                })
              }
            >
              <span className="post-date">{post.date}</span>
              <span className="post-main">
                <span className="post-title">{post.title}</span>
                <span className="post-summary">{post.summary}</span>
                {post.tags && (
                  <span className="post-tags">
                    {post.tags.map((t, j) => (
                      <span key={j} className="post-tag">
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <span className="post-cta" aria-hidden="true">
                Read on {post.source || 'the web'} ↗
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
