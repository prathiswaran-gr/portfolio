import { useEffect, useRef } from 'react'

// "Light under the page": an aurora that rises from the bottom edge when you scroll hard
// toward the end of the document, and from the top edge when you scroll hard back to the
// start. Both sink away on their own once you stop.
//
// Each edge behaves like a peak meter with a slow release — the level jumps straight to
// whatever your current scroll speed asks for, then decays exponentially. That's what makes a
// hard flick throw up a tall mountain while a gentle scroll barely lifts it, and it's also
// what hides the whole thing a couple of seconds after you go still.
//
// Two things gate each edge, multiplied together:
//   speed — scroll velocity in px/s, in that edge's direction only
//   near  — how close that end of the document is; zero until you're within `range`
// So flicking hard in the middle of the page does nothing. Each edge only answers near itself.
//
// Positioned fixed to the viewport rather than parked inside the footer: the metaphor is
// light leaking in from beyond the screen, and it sits at z-index 5 — above the white page
// background, below the content at z-index 10 — so the type stays crisp on top of it.

const AURORA = {
  /** How far from each end of the document that edge starts responding, in px. */
  range: 1100,
  /** Scroll speed (px/s) that throws up a full-height mountain. Lower = easier to trigger. */
  vmax: 1600,
  /** Fraction of the peak that survives each second once you stop. Lower = snappier fade. */
  release: 0.12,
  /** Resting level when idle at an end. 0 hides it completely; try 0.15 for a permanent low
   *  glow at the extremes of the page. */
  baseline: 0,
  /** Height the layer collapses to at zero energy, as a fraction of its full height. */
  floor: 0.18,
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

export default function Aurora() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bottom = bottomRef.current
    const top = topRef.current
    if (!bottom || !top) return

    // Reduced motion: show nothing rather than animate a large moving field.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let eBottom = 0
    let eTop = 0
    let lastY = window.scrollY
    let last = performance.now()
    let raf = 0

    const apply = (el: HTMLDivElement, e: number) => {
      el.style.opacity = e.toFixed(3)
      el.style.transform = `scaleY(${(AURORA.floor + (1 - AURORA.floor) * e).toFixed(3)})`
    }

    // Peak-and-release: rise instantly to the target, fall slowly.
    const step = (energy: number, speed: number, near: number, dt: number) => {
      const target = clamp(speed / AURORA.vmax, 0, 1) * near
      return Math.max(energy * Math.pow(AURORA.release, dt), Math.max(target, AURORA.baseline * near))
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1) // cap so a background tab can't spike it
      last = now
      if (dt <= 0) return

      const y = window.scrollY
      const dy = y - lastY
      lastY = y

      const doc = document.documentElement
      const nearBottom = 1 - clamp((doc.scrollHeight - (y + window.innerHeight)) / AURORA.range, 0, 1)
      const nearTop = 1 - clamp(y / AURORA.range, 0, 1)

      eBottom = step(eBottom, Math.max(0, dy) / dt, nearBottom, dt)
      eTop = step(eTop, Math.max(0, -dy) / dt, nearTop, dt)

      // Written straight to style — no React state, this runs every frame.
      apply(bottom, eBottom)
      apply(top, eTop)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <div className="aurora" ref={bottomRef} aria-hidden="true">
        <div className="aurora-layer" />
      </div>
      <div className="aurora is-top" ref={topRef} aria-hidden="true">
        <div className="aurora-layer" />
      </div>
    </>
  )
}
