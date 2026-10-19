import { useEffect, useState } from 'react'

// The page opens under a sheet of white ink that erodes away from the centre. Styles, the
// frame maths and the provenance of the sprite are in the load-reveal block of styles.css.
//
// The order of operations matters more than it looks. The layer goes up as plain white — which
// on a white page is invisible, and is doing nothing except holding the content back — and
// only becomes the sprite once that sprite has actually decoded. So the 227 kB asset is never
// on the critical path: if it is slow, or 404s, or the browser refuses it, the sheet just
// fades and the visitor sees a normal page load instead of a stalled blank one.

const SPRITE = 'experience/ink-reveal.png'
// Keep in step with --reveal-in and the opacity transition in styles.css.
const REVEAL_MS = 750
const FADE_MS = 300
// How long to wait for the sprite before giving up and fading the plain sheet instead.
const PATIENCE_MS = 1200

export default function InkReveal() {
  // Someone who asked for less motion gets no sheet at all, not a sheet that flashes away.
  // Read before the first paint so the layer is never rendered for them.
  const [enabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [inked, setInked] = useState(false)
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return
    const timers: number[] = []
    let cancelled = false
    let started = false

    // Erode, then fade the residual speckle, then drop the layer out of the DOM entirely.
    // Guarded, because the sprite decoding and the patience timer race each other and
    // whichever wins should be the only one to run.
    const run = (withSprite: boolean) => {
      if (cancelled || started) return
      started = true
      if (withSprite) setInked(true)
      // A frame later, so the layer has painted at frame 0 and the transition has something
      // to travel from. Setting both in one commit would jump straight to the end.
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setOpen(true)))
      const hold = withSprite ? REVEAL_MS : 0
      timers.push(window.setTimeout(() => !cancelled && setDone(true), hold))
      timers.push(window.setTimeout(() => !cancelled && setGone(true), hold + FADE_MS))
    }

    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}${SPRITE}`
    if (img.decode) {
      img.decode().then(
        () => run(true),
        () => run(false),
      )
    } else {
      img.onload = () => run(true)
      img.onerror = () => run(false)
    }
    // Whatever the sprite is doing, the page does not stay behind the sheet.
    timers.push(window.setTimeout(() => run(false), PATIENCE_MS))

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [enabled])

  if (gone) return null

  return (
    <div
      className={`ink-reveal${inked ? ' is-inked' : ''}${open ? ' is-open' : ''}${done ? ' is-done' : ''}`}
      style={inked ? { backgroundImage: `url(${import.meta.env.BASE_URL}${SPRITE})` } : undefined}
      aria-hidden="true"
    />
  )
}
