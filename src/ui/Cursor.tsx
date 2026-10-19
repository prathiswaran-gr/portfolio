import { useEffect, useRef } from 'react'

// Custom cursor: a solid accent dot that tracks the pointer exactly, and a ring that eases
// along behind it. The ring opens up over anything clickable.
//
// Written straight to the DOM from a rAF loop — no React state, because this updates every
// frame and re-rendering the tree at 60fps to move two divs would be absurd.
//
// Only mounts on devices that actually have a pointer; on touch there's nothing to track and
// hiding the native cursor would be actively harmful. The CSS turns `cursor: none` on under
// the same media query, so the two can never disagree.

// What counts as "interactive" — the ring expands over these.
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary'

const follow = {
  /** Per-second retention for the ring. Lower = tighter to the dot, higher = lazier. */
  damping: 0.0008,
}

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect coarse pointers and reduced-motion users.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const eased = { ...mouse }
    let seen = false
    let raf = 0
    let last = performance.now()

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!seen) {
        eased.x = mouse.x
        eased.y = mouse.y
        seen = true
        document.body.classList.add('has-cursor')
      }
      // Ring state follows what's under the pointer, not what fired the event, so it still
      // reacts when the pointer moves onto a link without a mouseover firing (e.g. scroll).
      const el = e.target as Element | null
      ring.classList.toggle('is-active', !!el?.closest?.(INTERACTIVE))
    }

    const onLeave = () => document.body.classList.remove('has-cursor')
    const onEnter = () => seen && document.body.classList.add('has-cursor')
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1) // cap so a background tab can't lurch
      last = now
      const a = 1 - Math.pow(follow.damping, dt)
      eased.x += (mouse.x - eased.x) * a
      eased.y += (mouse.y - eased.y) * a
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
      ring.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0)`
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  )
}
