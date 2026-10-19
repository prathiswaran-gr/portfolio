// Tiny Web Audio layer — every sound here is synthesised at runtime from oscillators.
// There are no audio files to fetch, which is why the site ships no /sounds directory and
// why enabling this costs 0 kB of assets.
//
// A "voice" is one oscillator with a pluck envelope: near-instant attack, exponential
// decay. Stack two or three of them and you get a timbre; nothing more complicated is
// needed for UI sounds this short.

type Voice = {
  /** start frequency in Hz */
  freq: number
  /** optional glide target — the pitch bend is what makes a blip read as a chirp */
  endFreq?: number
  type: OscillatorType
  /** peak gain, 0–1. Keep these small: several voices sum. */
  peak: number
  /** seconds */
  duration: number
  /** seconds to wait before this voice starts */
  delay?: number
}

const STORAGE_KEY = 'mt-sound'
const ATTACK = 0.004
const SILENCE = 0.0001
/** Two sounds closer together than this collapse into one — stops fast pointer sweeps
 *  across the skills rows from machine-gunning. Low enough that a chirp doesn't swallow
 *  the click sound if you hover and press in one motion. */
const MIN_GAP_MS = 32

let ctx: AudioContext | null = null
let lastPlay = 0
const listeners = new Set<(on: boolean) => void>()

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Hover sounds only make sense with a real pointer — on touch, pointerenter fires on tap
 *  and would double up with the click sound. */
export function canHover() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

// Default: on, unless the visitor has asked for reduced motion or has muted us before.
let enabled = true

export function isSoundEnabled() {
  return enabled
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* private mode — the in-memory value still holds for this visit */
  }
  if (on) getCtx()?.resume().catch(() => {})
  listeners.forEach((fn) => fn(on))
}

/** Subscribe to mute changes (the toggle UI reads this). Returns an unsubscribe. */
export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getCtx() {
  if (ctx) return ctx
  try {
    ctx = new AudioContext()
  } catch {
    return null
  }
  return ctx
}

/** Browsers keep an AudioContext suspended until the page has been interacted with, so
 *  resume on the first gesture and then stop listening. Call once, from App. */
export function initSound() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    enabled = saved === null ? !prefersReducedMotion() : saved === '1'
  } catch {
    enabled = !prefersReducedMotion()
  }
  listeners.forEach((fn) => fn(enabled))

  const events = ['pointerdown', 'keydown', 'touchstart'] as const
  const unlock = () => {
    const c = getCtx()
    if (c && c.state === 'suspended') c.resume().catch(() => {})
    events.forEach((e) => window.removeEventListener(e, unlock))
  }
  events.forEach((e) => window.addEventListener(e, unlock, { passive: true }))
  return () => events.forEach((e) => window.removeEventListener(e, unlock))
}

function play(voices: Voice[]) {
  if (!enabled) return
  const now = performance.now()
  if (now - lastPlay < MIN_GAP_MS) return
  lastPlay = now

  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})

  const t0 = c.currentTime
  for (const v of voices) {
    const start = t0 + (v.delay ?? 0)
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = v.type
    osc.frequency.setValueAtTime(v.freq, start)
    // exponentialRamp can't touch 0, hence the glide target guard
    if (v.endFreq) osc.frequency.exponentialRampToValueAtTime(v.endFreq, start + v.duration)
    gain.gain.setValueAtTime(SILENCE, start)
    gain.gain.linearRampToValueAtTime(v.peak, start + ATTACK)
    gain.gain.exponentialRampToValueAtTime(SILENCE, start + v.duration)
    osc.connect(gain).connect(c.destination)
    osc.start(start)
    osc.stop(start + v.duration + 0.02)
  }
}

/** Two-syllable bird chirp: a rising note, then a shorter falling one.
 *
 *  Deliberately thin — real birdsong lives around 2–4 kHz with almost no low end, so
 *  there is no sub-octave voice here. Adding one reads as a synth blip, not a bird.
 *  `step` transposes the call, so hovering down a list walks up a scale.
 */
export function chirp(step = 0) {
  const k = 1 + step * 0.05
  play([
    { freq: 1980 * k, endFreq: 3200 * k, type: 'sine', peak: 0.05, duration: 0.045 },
    { freq: 3900 * k, endFreq: 4700 * k, type: 'sine', peak: 0.012, duration: 0.03 },
    { freq: 2700 * k, endFreq: 2100 * k, type: 'sine', peak: 0.034, duration: 0.038, delay: 0.07 },
  ])
}

/** Everything clickable, delegated from the document — cheaper and more complete than
 *  hanging an onClick on every control, and it covers markup added later. Fires on
 *  pointerdown so the sound lands with the press, not after it. */
const CLICKABLE = 'a[href], button, [role="button"], summary, label, input[type="checkbox"]'

export function initClickSound() {
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return // left button / primary touch only
    const el = e.target as Element | null
    if (!el?.closest) return
    const hit = el.closest(CLICKABLE)
    if (!hit || hit.hasAttribute('disabled') || hit.getAttribute('aria-disabled') === 'true') return
    tap()
  }
  document.addEventListener('pointerdown', onDown, { passive: true, capture: true })
  return () => document.removeEventListener('pointerdown', onDown, { capture: true })
}

// --- paper -------------------------------------------------------------------------------
// A page turning is broadband noise, not a tone, so it cannot go through play() above — that
// builds oscillators. One short noise buffer is generated once and reused, then shaped per
// turn by a bandpass that opens and closes as the sheet passes the ear. Still no audio files.

let noiseBuf: AudioBuffer | null = null
/** Its own rate limit, so a riffle can run faster than MIN_GAP_MS without being swallowed —
 *  and so paper can never suppress a click sound, or the other way round. */
let lastPaper = 0

function getNoise(c: AudioContext) {
  if (noiseBuf) return noiseBuf
  const len = Math.floor(c.sampleRate * 0.3)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  // Seeded rather than Math.random: every visit should sound the same, and a fixed buffer
  // means the riffle's twelve turns are twelve slices of one consistent texture.
  let seed = 0x2f6e2b1
  for (let i = 0; i < len; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    d[i] = (seed / 0x100000000) * 2 - 1
  }
  noiseBuf = buf
  return buf
}

/** One page turning. `strength` (0–1) is how hard the sheet is moving: it scales the volume,
 *  shortens the swish and pushes the band higher, which is what separates a slow deliberate
 *  turn from a page flicked past during the riffle. */
export function paper(strength = 1) {
  if (!enabled) return
  const now = performance.now()
  if (now - lastPaper < 24) return
  lastPaper = now
  const c = getCtx()
  if (!c) return
  // Suspended until the visitor has actually interacted with the page — scrolling does not
  // count as a gesture, so a first-load riffle is silent by design rather than by accident.
  if (c.state === 'suspended') {
    c.resume().catch(() => {})
    return
  }
  const k = Math.max(0, Math.min(1, strength))
  const t0 = c.currentTime
  const dur = 0.085 + 0.115 * (1 - k)

  const src = c.createBufferSource()
  src.buffer = getNoise(c)
  // Start somewhere different each turn so repeated turns are not identical.
  const off = (lastPaper % 1000) / 1000 * 0.2

  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.65
  bp.frequency.setValueAtTime(1200 + 900 * k, t0)
  bp.frequency.exponentialRampToValueAtTime(3400 + 1600 * k, t0 + dur * 0.42)
  bp.frequency.exponentialRampToValueAtTime(820, t0 + dur)

  const g = c.createGain()
  const peak = 0.028 + 0.03 * k
  g.gain.setValueAtTime(SILENCE, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + 0.014)
  g.gain.exponentialRampToValueAtTime(SILENCE, t0 + dur)

  src.connect(bp).connect(g).connect(c.destination)
  src.start(t0, off, dur + 0.05)
  src.stop(t0 + dur + 0.02)
}

/** The sheet landing flat — a soft low tap under the swish. Only worth it on a turn that
 *  actually settles, which is why the riffle does not use it. */
export function paperLand() {
  play([{ freq: 150, endFreq: 96, type: 'triangle', peak: 0.05, duration: 0.075, delay: 0.02 }])
}

/** Click: a soft wooden knock with a bright tick on top. */
export function tap() {
  play([
    { freq: 300, endFreq: 176, type: 'triangle', peak: 0.1, duration: 0.05 },
    { freq: 880, endFreq: 690, type: 'sine', peak: 0.028, duration: 0.035, delay: 0.008 },
  ])
}
