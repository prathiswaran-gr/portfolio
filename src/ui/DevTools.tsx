import { Fragment, useEffect, useState } from 'react'

// Dev-only control panel for the experience ink reveal, so its timing and placement can be
// tuned in the browser instead of through edit-save-reload cycles.
//
// It is mounted behind `import.meta.env.DEV` in App.tsx, which Vite replaces with `false` in a
// production build — the whole module then tree-shakes away, so it costs the shipped bundle
// nothing. That is also why everything here is self-contained: the panel's own CSS is injected
// at runtime rather than living in styles.css, and no other component imports anything from
// this file. Deleting it leaves no trace beyond the two lines in App.tsx.
//
// How the knobs reach the effect: styles.css reads each one as `var(--ink-x, <shipped value>)`,
// so writing them on :root overrides the stylesheet and clearing them restores it exactly.
// The reveal modes add `.ink-pinned` to the entries — a separate class from the `.ink-on` that
// hover toggles, so a stray pointerleave can't unpin a held-open reveal.

type Mode = 'hover' | 'inview' | 'always' | 'off'

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'hover', label: 'hover', hint: 'Pointer only — the scroll reveal off' },
  { id: 'inview', label: 'in view', hint: 'As shipped: reveals as each entry scrolls into the middle of the viewport' },
  { id: 'always', label: 'always', hint: 'All three held open' },
  { id: 'off', label: 'off', hint: 'Plate hidden entirely' },
]

// Defaults ARE the shipped values, so opening the panel changes nothing until you move
// something. Keep them in step with the fallbacks in styles.css when tuning is promoted — the
// one knowing exception is homeGap, whose 48px is representative of the shipped
// clamp(24px, 3.5vw, 64px) rather than equal to it (see HOME_KNOBS).
const DEFAULTS = {
  mode: 'inview' as Mode,
  inMs: 1400,
  outMs: 800,
  start: 10,
  width: 30,
  push: 104,
  photo: 72,
  home: 'on' as 'on' | 'off',
  homeWidth: 26,
  homeGap: 48,
  homePush: 120,
  homePhoto: 70,
  color: 'on' as 'on' | 'off',
  contrast: 100,
  bright: 120,
}
type State = typeof DEFAULTS
type Knob = Exclude<keyof State, 'mode' | 'home' | 'color'>
type KnobSpec = { id: Knob; label: string; min: number; max: number; step: number; unit: string }

const KNOBS: KnobSpec[] = [
  { id: 'inMs', label: 'reveal', min: 200, max: 4000, step: 50, unit: 'ms' },
  { id: 'outMs', label: 'flood back', min: 100, max: 2000, step: 50, unit: 'ms' },
  { id: 'start', label: 'start frame', min: 0, max: 38, step: 1, unit: '/39' },
  { id: 'width', label: 'plate width', min: 12, max: 60, step: 1, unit: '%' },
  { id: 'push', label: 'gutter push', min: 0, max: 240, step: 4, unit: 'px' },
  { id: 'photo', label: 'photo', min: 10, max: 100, step: 2, unit: '%' },
]

const HOME_KNOBS: KnobSpec[] = [
  { id: 'homeWidth', label: 'width', min: 12, max: 44, step: 1, unit: 'vw' },
  // The grid gap — the whole of the air between the copy column and the portrait. Shipped as
  // clamp(24px, 3.5vw, 64px), so this slider's default is representative rather than identical.
  { id: 'homeGap', label: 'gap', min: 0, max: 160, step: 4, unit: 'px' },
  // Hangs the portrait past the measure into the page gutter; ships at 120px. What it takes
  // from the gutter, the copy column gets back. Capped by the gutter itself, so past a point
  // it stops having an effect at narrower windows.
  { id: 'homePush', label: 'bleed', min: 0, max: 260, step: 4, unit: 'px' },
  { id: 'homePhoto', label: 'photo', min: 20, max: 100, step: 2, unit: '%' },
]

// The print treatment is shared, so these move both the portrait and the plates at once.
const PRINT_KNOBS: KnobSpec[] = [
  // How hard light backgrounds blow out to paper white. Low values leave a photograph.
  { id: 'contrast', label: 'ink', min: 100, max: 260, step: 5, unit: '%' },
  { id: 'bright', label: 'lift', min: 80, max: 170, step: 5, unit: '%' },
]

// The custom properties written to :root, keyed the same way the stylesheet reads them.
function vars(s: State): Record<string, string> {
  return {
    '--ink-in': `${s.inMs}ms`,
    '--ink-out': `${s.outMs}ms`,
    '--ink-start': String(s.start),
    // The full clamp with only the middle term swapped, so the default value is identical to
    // the stylesheet's at every viewport rather than just the common ones.
    '--ink-width': `clamp(200px, ${s.width}%, 340px)`,
    '--ink-push': `${s.push}px`,
    '--ink-photo': String(s.photo / 100),
    '--home-width': `${s.homeWidth}vw`,
    '--home-gap': `${s.homeGap}px`,
    '--home-push': `${s.homePush}px`,
    '--home-photo': String(s.homePhoto / 100),
    // Shared by both surfaces. grayscale(0) is the shipped full colour, grayscale(1) is ink.
    '--photo-gray': s.color === 'on' ? '0' : '1',
    '--photo-bright': String(s.bright / 100),
    '--photo-contrast': String(s.contrast / 100),
  }
}

const STORE = 'devtools:ink'

function load(): State {
  try {
    const raw = localStorage.getItem(STORE)
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<State>) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

const CSS = `
.devtools {
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  width: min(620px, calc(100vw - 28px));
  padding: 10px 12px 11px;
  border: 1px solid #2f3238;
  border-radius: 5px;
  background: rgba(14, 15, 17, 0.94);
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  color: #d8dbe0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  line-height: 1.5;
  letter-spacing: 0.02em;
}
.devtools, .devtools * { cursor: auto !important; }
.devtools button, .devtools input { cursor: pointer !important; }
.devtools-head { display: flex; align-items: center; gap: 8px; }
.devtools-title { color: #8b9099; letter-spacing: 0.18em; text-transform: uppercase; }
.devtools-dot { color: #3ddc84; }
.devtools-note { margin-left: auto; color: #6f747d; }
.devtools-x {
  border: 1px solid #2f3238; border-radius: 3px; background: none; color: #8b9099;
  padding: 2px 7px; font: inherit;
}
.devtools-x:hover { border-color: #4a4f57; color: #d8dbe0; }
.devtools-modes { display: flex; gap: 5px; margin: 9px 0 10px; }
.devtools-mode {
  flex: 1; padding: 5px 4px; border: 1px solid #2f3238; border-radius: 3px;
  background: none; color: #8b9099; font: inherit; letter-spacing: 0.08em;
}
.devtools-mode:hover { border-color: #4a4f57; color: #d8dbe0; }
.devtools-mode.is-on { border-color: #3ddc84; background: rgba(61, 220, 132, 0.14); color: #7df0ae; }
.devtools-grid { display: grid; grid-template-columns: 76px 1fr 62px; gap: 4px 10px; align-items: center; }
.devtools-grid label { color: #8b9099; }
.devtools-val { text-align: right; color: #d8dbe0; font-variant-numeric: tabular-nums; }
.devtools-grid input[type='range'] { width: 100%; height: 14px; accent-color: #3ddc84; }
.devtools-foot { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
.devtools-hint { margin-left: auto; color: #575c64; }
.devtools-pill {
  position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 300;
  padding: 5px 12px; border: 1px solid #2f3238; border-radius: 3px;
  background: rgba(14, 15, 17, 0.94); color: #8b9099;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; cursor: auto !important;
}
.devtools-pill:hover { border-color: #3ddc84; color: #7df0ae; }
.devtools-modes-2 .devtools-mode { flex: 0 0 88px; }
.devtools-rule { height: 1px; margin: 11px 0 9px; background: #24262b; }
/* Dev-only modes, so their rules live here rather than in the shipped stylesheet. */
body[data-ink='off'] .tl-ink { display: none !important; }
body[data-home='off'] .hero-photo { display: none !important; }
`

export default function DevTools() {
  // Collapsed to the pill on load, so it stays out of the way of the page (and of the load
  // reveal) until you actually want it.
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>(load)
  const [copied, setCopied] = useState(false)
  const { mode } = state
  // Both are hidden at some sizes, and by different guards — say so rather than letting
  // someone tune knobs against something that isn't on screen. The reveal also goes when
  // there's no hover or the visitor asked for less motion; the portrait is width-only.
  const [hidden, setHidden] = useState(false)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.dataset.devtools = 'ink'
    el.textContent = CSS
    document.head.append(el)
    return () => el.remove()
  }, [])

  useEffect(() => {
    const ink = window.matchMedia(
      '(max-width: 900px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)',
    )
    const hero = window.matchMedia('(max-width: 900px)')
    const sync = () => {
      setHidden(ink.matches)
      setNarrow(hero.matches)
    }
    sync()
    ink.addEventListener('change', sync)
    hero.addEventListener('change', sync)
    return () => {
      ink.removeEventListener('change', sync)
      hero.removeEventListener('change', sync)
    }
  }, [])

  // Write the knobs to :root; clear them on unmount so the stylesheet's own values come back.
  useEffect(() => {
    const root = document.documentElement
    const v = vars(state)
    for (const [k, val] of Object.entries(v)) root.style.setProperty(k, val)
    try {
      localStorage.setItem(STORE, JSON.stringify(state))
    } catch {
      /* private window — tuning still works, it just won't survive a reload */
    }
    return () => {
      for (const k of Object.keys(v)) root.style.removeProperty(k)
    }
  }, [state])

  // Pin the reveal open for the modes that hold it. `always` pins every entry; `inview` pins
  // whichever entry is in the middle band of the viewport, unpinning it on the way out.
  useEffect(() => {
    const entries = Array.from(document.querySelectorAll<HTMLElement>('.tl-entry.has-ink'))
    const unpin = () => entries.forEach((e) => e.classList.remove('ink-pinned'))
    document.body.dataset.ink = mode
    if (mode === 'always') entries.forEach((e) => e.classList.add('ink-pinned'))
    let io: IntersectionObserver | undefined
    if (mode === 'inview') {
      io = new IntersectionObserver(
        (recs) => recs.forEach((r) => r.target.classList.toggle('ink-pinned', r.isIntersecting)),
        { rootMargin: '-32% 0px -32% 0px' },
      )
      entries.forEach((e) => io?.observe(e))
    }
    return () => {
      io?.disconnect()
      unpin()
      delete document.body.dataset.ink
    }
  }, [mode])

  useEffect(() => {
    document.body.dataset.home = state.home
    return () => {
      delete document.body.dataset.home
    }
  }, [state.home])

  // Backtick toggles the panel out of the way without reaching for the mouse.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== '`' || e.metaKey || e.ctrlKey || t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return
      setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copy = () => {
    const lines = Object.entries(vars(state)).map(([k, v]) => `  ${k}: ${v};`)
    const css =
      `/* Dev panel: ink reveal ${mode}, hero photo ${state.home}, colour ${state.color} */\n` +
      `:root {\n${lines.join('\n')}\n}\n`
    navigator.clipboard?.writeText(css).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      },
      () => setCopied(false),
    )
  }

  if (!open) {
    return (
      <button className="devtools-pill" onClick={() => setOpen(true)} title="Open dev panel (`)">
        dev
      </button>
    )
  }

  return (
    <div className="devtools" role="group" aria-label="Developer options">
      <div className="devtools-head">
        <span className="devtools-dot" aria-hidden="true">
          ◆
        </span>
        <span className="devtools-title">ink reveal</span>
        <span className="devtools-note">
          {hidden ? 'hidden here: needs hover, motion, and 900px+' : MODES.find((m) => m.id === mode)?.hint}
        </span>
        <button className="devtools-x" onClick={() => setOpen(false)} title="Collapse (`)">
          –
        </button>
      </div>

      <div className="devtools-modes">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`devtools-mode${mode === m.id ? ' is-on' : ''}`}
            onClick={() => setState((s) => ({ ...s, mode: m.id }))}
            aria-pressed={mode === m.id}
            title={m.hint}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Sliders knobs={KNOBS} state={state} onChange={setState} />

      <div className="devtools-rule" />

      <div className="devtools-head">
        <span className="devtools-dot" aria-hidden="true">
          ◆
        </span>
        <span className="devtools-title">hero photo</span>
        <span className="devtools-note">
          {narrow ? 'hidden under 900px: no gutter to put it in' : "Portrait in the hero's right-hand space"}
        </span>
      </div>

      <div className="devtools-modes devtools-modes-2">
        {(['on', 'off'] as const).map((v) => (
          <button
            key={v}
            className={`devtools-mode${state.home === v ? ' is-on' : ''}`}
            onClick={() => setState((s) => ({ ...s, home: v }))}
            aria-pressed={state.home === v}
          >
            {v}
          </button>
        ))}
      </div>

      <Sliders knobs={HOME_KNOBS} state={state} onChange={setState} />

      <div className="devtools-rule" />

      <div className="devtools-head">
        <span className="devtools-dot" aria-hidden="true">
          ◆
        </span>
        <span className="devtools-title">photo print</span>
        <span className="devtools-note">Shared by the portrait and all three plates</span>
      </div>

      <div className="devtools-modes devtools-modes-2">
        {(['on', 'off'] as const).map((v) => (
          <button
            key={v}
            className={`devtools-mode${state.color === v ? ' is-on' : ''}`}
            onClick={() => setState((s) => ({ ...s, color: v }))}
            aria-pressed={state.color === v}
            title={v === 'on' ? 'Photographs, in colour (shipped)' : 'Desaturated and inked'}
          >
            colour {v}
          </button>
        ))}
      </div>

      <Sliders knobs={PRINT_KNOBS} state={state} onChange={setState} />

      <div className="devtools-foot">
        <button className="devtools-x" onClick={() => setState(DEFAULTS)}>
          reset
        </button>
        <button className="devtools-x" onClick={copy}>
          {copied ? 'copied ✓' : 'copy css'}
        </button>
        <span className="devtools-hint">dev only · ` to collapse</span>
      </div>
    </div>
  )
}

// Each knob contributes its three cells straight to the grid, so the rows are keyed fragments
// rather than divs — a wrapper would itself become the grid item and collapse the columns.
function Sliders({
  knobs,
  state,
  onChange,
}: {
  knobs: KnobSpec[]
  state: State
  onChange: React.Dispatch<React.SetStateAction<State>>
}) {
  return (
    <div className="devtools-grid">
      {knobs.map((k) => (
        <Fragment key={k.id}>
          <label htmlFor={`dev-${k.id}`}>{k.label}</label>
          <input
            id={`dev-${k.id}`}
            type="range"
            min={k.min}
            max={k.max}
            step={k.step}
            value={state[k.id]}
            onChange={(e) => onChange((s) => ({ ...s, [k.id]: Number(e.target.value) }))}
          />
          <span className="devtools-val">
            {state[k.id]}
            {k.unit}
          </span>
        </Fragment>
      ))}
    </div>
  )
}
