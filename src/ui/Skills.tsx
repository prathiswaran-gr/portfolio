import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion } from 'framer-motion'
import { canHover, chirp } from './sound'
import { track, useSectionAnalytics } from './analytics'
import {
  GROUPS,
  VIEW,
  buildGraph,
  computeFit,
  decollide,
  frameNodes,
  getHubGlyph,
  getSkillGlyph,
  simTick,
  type Camera,
  type GraphNode,
} from './skillsGraph'
import { portfolioConfig } from '../portfolio.config'

const COPY = {
  sectionNo: portfolioConfig.skills.sectionNo || '03',
  title: portfolioConfig.skills.title,
  tagline: portfolioConfig.skills.tagline,
  sub: portfolioConfig.skills.sub,
}

const EASE = [0.22, 1, 0.36, 1]
const rowV = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

function Node({
  n,
  r,
  state,
  sel,
  showHubLabel,
  onEnter,
  onLeave,
  onDown,
}: {
  n: GraphNode
  r: number
  state: '' | ' is-on' | ' is-dim'
  sel: boolean
  /** Hubs are wordless until zoomed in — then the group name appears beneath the dot. */
  showHubLabel: boolean
  onEnter: () => void
  onLeave: () => void
  onDown: (e: ReactPointerEvent) => void
}) {
  // Hubs carry their brand icon inside the dot and stay wordless until zoomed; children keep the
  // glyph-and-label pair beside the dot, flipped to whichever side keeps them off the edge.
  const size = n.hub ? r * 1.55 : 13
  const s = size / 24
  const gx = n.hub ? n.x - size / 2 : n.side === 'left' ? n.x - r - 6 - size : n.x + r + 6
  const tx = n.side === 'left' ? gx - 5 : gx + size + 4
  return (
    <g
      className={`sk-node${n.hub ? ' is-hub' : ''}${n.core && n.hub ? ' is-core' : ''}${
        sel ? ' is-sel' : ''
      }${state}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
    >
      {/* A generous transparent target: the dot alone is a few px across and hard to hit. */}
      <circle className="sk-hit" cx={n.x} cy={n.y} r={Math.max(r + 9, 15)} />
      <circle className="sk-node-dot" cx={n.x} cy={n.y} r={r} />
      {n.hub ? (
        <g className="sk-hub-icon" transform={`translate(${gx} ${n.y - size / 2}) scale(${s})`}>
          {getHubGlyph(n.group).map(({ d, paint = 'fill' }, i) => (
            <path key={i} className={`is-${paint}`} d={d} />
          ))}
        </g>
      ) : (
        <g className="sk-glyph" transform={`translate(${gx} ${n.y - size / 2}) scale(${s})`}>
          {getSkillGlyph(n.kind).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
      {!n.hub && (
        <text
          className="sk-name"
          x={tx}
          y={n.y}
          textAnchor={n.side === 'left' ? 'end' : 'start'}
          dominantBaseline="middle"
        >
          {n.label}
        </text>
      )}
      {n.hub && showHubLabel && (
        <text className="sk-hub-name" x={n.x} y={n.y + r + 13} textAnchor="middle">
          {n.label}
        </text>
      )}
    </g>
  )
}

type Drag = { node: GraphNode; lastX: number; lastY: number; moved: boolean }

export default function Skills() {
  const g = useMemo(buildGraph, [])
  const { nodes, edges, byId, near } = g

  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const camRef = useRef<Camera>({ k: 1, tx: 0, ty: 0 })
  const homeRef = useRef<Camera>({ k: 1, tx: 0, ty: 0 })
  const camTargetRef = useRef<Camera | null>(null)
  const camRafRef = useRef(0)
  const alphaRef = useRef(1)
  const rafRef = useRef(0)
  const runningRef = useRef(false)
  const settledRef = useRef(false)
  const dragRef = useRef<Drag | null>(null)
  // A node press ends with a `click` that still bubbles to the svg; this flag lets the svg's
  // background handler know the click was on a node and skip clearing the selection.
  const nodeHitRef = useRef(false)

  // The frame counter is the whole render trigger: the simulation mutates node positions in
  // place and bumping this re-paints them. Hover / selection are their own state.
  const [, setFrame] = useState(0)
  const [settled, setSettled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const focus = active ?? selected
  useSectionAnalytics('skills', sectionRef)

  const startLoop = () => {
    if (runningRef.current) return
    runningRef.current = true
    const loop = () => {
      simTick(g, alphaRef.current)
      alphaRef.current *= 0.985
      // Before it settles the camera follows the graph as it blooms open. Once settled the
      // camera is owned by the click-to-zoom tween, so a later drag jostles nodes but not the view.
      if (!settledRef.current) {
        const fit = computeFit(g)
        const c = camRef.current
        c.k += (fit.k - c.k) * 0.12
        c.tx += (fit.tx - c.tx) * 0.12
        c.ty += (fit.ty - c.ty) * 0.12
      }
      setFrame((f) => f + 1)
      // Keep running while there's heat left, or while a node is being dragged.
      if (alphaRef.current > 0.02 || dragRef.current) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        runningRef.current = false
        if (!settledRef.current) {
          // First settle: separate any overlapping labels, then lock the camera to the final fit,
          // remembering it as the "home" view to return to when nothing is selected.
          for (let i = 0; i < 6; i++) decollide(g)
          camRef.current = computeFit(g)
          homeRef.current = camRef.current
          settledRef.current = true
          setSettled(true)
          setFrame((f) => f + 1)
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  // Boot: frame the camera tight on the knot so the first paint is a small cluster, then bloom
  // it open the moment the section scrolls into view — the "loading" is the graph finding its
  // shape, the way Obsidian's does. Reduced-motion skips straight to the settled layout.
  useEffect(() => {
    camRef.current = computeFit(g)
    setFrame((f) => f + 1)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      let a = 1
      for (let i = 0; i < 600; i++) {
        simTick(g, a)
        a *= 0.99
      }
      for (let i = 0; i < 6; i++) decollide(g)
      camRef.current = computeFit(g)
      homeRef.current = camRef.current
      settledRef.current = true
      setSettled(true)
      setFrame((f) => f + 1)
      return
    }
    const el = svgRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          alphaRef.current = 1
          startLoop()
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(rafRef.current)
      runningRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Click-to-zoom: selecting a node eases the camera in to frame that node and its neighbours;
  // clearing the selection eases it back to the home view. The bloom must have finished first —
  // while it is still running it owns the camera. Runs on its own rAF, cancelled on re-trigger.
  useEffect(() => {
    if (!settled) return
    let target: Camera
    if (selected) {
      const sel = byId.get(selected)
      if (!sel) return
      const ids = new Set<string>([selected, ...(near.get(selected) ?? [])])
      const subset = nodes.filter((n) => ids.has(n.id))
      // Zoom a hub (with all its children) less hard than a lone leaf, which can go closer.
      target = frameNodes(subset, 44, sel.hub ? 2 : 3)
    } else {
      target = homeRef.current
    }
    camTargetRef.current = target
    cancelAnimationFrame(camRafRef.current)
    const step = () => {
      const c = camRef.current
      const t = camTargetRef.current!
      c.k += (t.k - c.k) * 0.16
      c.tx += (t.tx - c.tx) * 0.16
      c.ty += (t.ty - c.ty) * 0.16
      setFrame((f) => f + 1)
      if (Math.abs(t.k - c.k) > 0.001 || Math.abs(t.tx - c.tx) > 0.3 || Math.abs(t.ty - c.ty) > 0.3) {
        camRafRef.current = requestAnimationFrame(step)
      } else {
        camRef.current = { ...t }
        setFrame((f) => f + 1)
      }
    }
    camRafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(camRafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, settled])

  // Map a screen point to graph space through the current camera, so a dragged node tracks the
  // pointer exactly whatever the zoom / pan of the view.
  const toGraph = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const vbx = ((clientX - rect.left) / rect.width) * VIEW.w
    const vby = ((clientY - rect.top) / rect.height) * VIEW.h
    const c = camRef.current
    return { x: (vbx - c.tx) / c.k, y: (vby - c.ty) / c.k }
  }

  const onNodeDown = (n: GraphNode, e: ReactPointerEvent) => {
    e.stopPropagation()
    svgRef.current?.setPointerCapture(e.pointerId)
    n.fixed = true
    dragRef.current = { node: n, lastX: e.clientX, lastY: e.clientY, moved: false }
    startLoop()
  }

  const onMove = (e: ReactPointerEvent) => {
    const d = dragRef.current
    if (!d) return
    if (Math.abs(e.clientX - d.lastX) > 2 || Math.abs(e.clientY - d.lastY) > 2) d.moved = true
    const p = toGraph(e.clientX, e.clientY)
    d.node.x = p.x
    d.node.y = p.y
    // A little heat so the neighbours ease out of the way as the node is pulled around.
    alphaRef.current = Math.max(alphaRef.current, 0.18)
    startLoop()
  }

  const onUp = (e: ReactPointerEvent) => {
    const d = dragRef.current
    if (!d) return
    svgRef.current?.releasePointerCapture?.(e.pointerId)
    dragRef.current = null
    d.node.fixed = false
    // A press that never moved is a click: toggle this node's focus (and its zoom). Flag it so the
    // svg's own click handler, which fires right after, doesn't immediately clear the selection.
    if (!d.moved) {
      nodeHitRef.current = true
      track('skills_graph_interaction', {
        action: 'node_click',
        skill: d.node.label,
        group: d.node.group,
        hub: d.node.hub,
        selected: selected !== d.node.id,
      })
      setSelected((s) => (s === d.node.id ? null : d.node.id))
    } else {
      track('skills_graph_interaction', {
        action: 'node_drag',
        skill: d.node.label,
        group: d.node.group,
        hub: d.node.hub,
      })
    }
  }

  const stateOf = (id: string): '' | ' is-on' | ' is-dim' => {
    if (!focus) return ''
    if (id === focus || near.get(focus)?.has(id)) return ' is-on'
    return ' is-dim'
  }

  const cam = camRef.current

  return (
    <section className="skills" ref={sectionRef}>
      <motion.div
        className="section-inner"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.header className="sec-head" variants={rowV}>
          <span className="sec-no">{COPY.sectionNo}</span>
          <h2 className="sec-title">{COPY.title}</h2>
          <span className="sec-tagline">{COPY.tagline}</span>
        </motion.header>
        <motion.p className="sec-sub" variants={rowV}>
          {COPY.sub}
        </motion.p>

        {/* Decorative: the same content is in the list below, which is what a screen reader
            reads and what narrow screens show. */}
        <motion.div className="sk-graph" variants={rowV} onPointerLeave={() => setActive(null)}>
          <svg
            ref={svgRef}
            className={`sk-svg${focus ? ' is-focused' : ''}${settled ? ' is-settled' : ''}`}
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            aria-hidden="true"
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={() => {
              // A click that came from a node has already toggled the selection in onUp; only a
              // genuine background click should clear it.
              if (nodeHitRef.current) {
                nodeHitRef.current = false
                return
              }
              if (selected) track('skills_graph_interaction', { action: 'background_clear' })
              setSelected(null)
            }}
          >
            <g transform={`translate(${cam.tx} ${cam.ty}) scale(${cam.k})`}>
              <g className="sk-edges">
                {edges.map(([a, b]) => {
                  const na = byId.get(a)!
                  const nb = byId.get(b)!
                  const on = focus === a || focus === b
                  return (
                    <line
                      key={`${a}|${b}`}
                      className={`sk-edge${on ? ' is-on' : ''}`}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                    />
                  )
                })}
              </g>
              {nodes.map((n) => (
                <Node
                  key={n.id}
                  n={n}
                  r={g.radius(n)}
                  state={stateOf(n.id)}
                  sel={selected === n.id}
                  showHubLabel={selected === n.id}
                  onEnter={() => {
                    setActive(n.id)
                    // One chirp per hub, as the old rows did. Every node would be a racket.
                    if (n.hub && canHover()) chirp(GROUPS.findIndex((x) => x.id === n.group))
                  }}
                  onLeave={() => setActive((a) => (a === n.id ? null : a))}
                  onDown={(e) => onNodeDown(n, e)}
                />
              ))}
            </g>
          </svg>
        </motion.div>

        {/* The graph needs room and a pointer, so below 900px this list is the section. Above
            it, the list is still here for screen readers, just not painted. */}
        <div className="sk-list sk-list-alt">
          {GROUPS.map((grp, i) => (
            <div className="sk-row" key={grp.id} onPointerEnter={() => canHover() && chirp(i)}>
              <div className="sk-label">
                {grp.core && <span className="sk-dot" aria-hidden="true" />}
                {grp.label}
              </div>
              <ul className="sk-items">
                {grp.items.map(([item]) => (
                  <li className="sk-item" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
