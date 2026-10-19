import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { isSoundEnabled, onSoundChange, setSoundEnabled, tap } from './sound'

// Fixed mute control, bottom-left. It fades in once you leave the hero — during the hero
// the same corner belongs to the page chrome, and nothing has made a sound yet anyway.
export default function SoundToggle() {
  const [on, setOn] = useState(isSoundEnabled)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [120, 320], [0, 1])
  const pointerEvents = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'))

  useEffect(() => onSoundChange(setOn), [])

  return (
    <motion.button
      className="sound-toggle"
      style={{ opacity, pointerEvents }}
      onClick={() => {
        const next = !on
        setSoundEnabled(next)
        // Unmuting is silent on its own — the delegated click sound was suppressed while
        // muted, so confirm audibly that sound is back.
        if (next) tap()
      }}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
    >
      <span className={`sound-dot${on ? ' is-on' : ''}`} aria-hidden="true" />
      sound
    </motion.button>
  )
}
