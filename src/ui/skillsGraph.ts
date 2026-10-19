// The skills graph — data, and the layout that places it.
// Dynamically powered by portfolioConfig.skills.groups.
import { portfolioConfig, type SkillGroup, type SkillKind } from '../portfolio.config'

export type Kind = SkillKind
export type GroupId = string

export const GROUPS: SkillGroup[] = portfolioConfig.skills.groups

export type GraphNode = {
  id: string
  label: string
  kind: Kind
  hub: boolean
  core: boolean
  group: GroupId
  side: 'left' | 'right'
  x: number
  y: number
  vx: number
  vy: number
  fixed?: boolean
}

export const VIEW = { w: 1000, h: 640 }

// Glyph paths on a 24x24 box, stroked in currentColor
export const GLYPHS: Record<Kind, string[]> = {
  lang: ['M9 7.5 5.5 12 9 16.5', 'M15 7.5 18.5 12 15 16.5'],
  ui: ['M4.5 6.5h15v11h-15z', 'M4.5 10.2h15'],
  arch: ['M4.5 4.5h15v15h-15z', 'M8.6 8.6h6.8v6.8h-6.8z'],
  async: ['M4 12.5c2.6-5.2 5.4 5.2 8 0s5.4-5.2 8 0'],
  data: ['M5 7c0-1.7 3.2-3 7-3s7 1.3 7 3-3.2 3-7 3-7-1.3-7-3z', 'M5 7v10c0 1.7 3.2 3 7 3s7-1.3 7-3V7'],
  net: ['M4.5 12h14', 'M14.8 8.2 19 12l-4.2 3.8'],
  di: ['M12 3.8v5.7', 'M8.4 9.5h7.2v4.3a3.6 3.6 0 0 1-7.2 0z', 'M12 17.7v2.5'],
  test: ['M4.6 12a7.4 7.4 0 1 0 14.8 0 7.4 7.4 0 1 0-14.8 0', 'M8.6 12.2 11 14.6 15.7 9.9'],
  perf: ['M4.5 16.5h3.6v-3h-3.6z', 'M10.2 16.5h3.6v-6.4h-3.6z', 'M15.9 16.5h3.6v-9.5h-3.6z'],
  tool: [
    'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 1 0 0-6.8z',
    'M12 3.9v2.4M12 17.7v2.4M4.2 12h2.4M17.4 12h2.4',
  ],
  lock: ['M8.2 11V9.2a3.8 3.8 0 0 1 7.6 0V11', 'M6.6 11h10.8v8.4H6.6z'],
  search: ['M11 5.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 1 0 0-11.2z', 'M15.1 15.1 19.6 19.6'],
}

export function getSkillGlyph(kind: string): string[] {
  return GLYPHS[kind as Kind] || GLYPHS.tool
}

export type HubGlyphPart = {
  d: string
  paint?: 'fill' | 'stroke'
}

export const HUB_GLYPHS: Record<string, HubGlyphPart[]> = {
  lang: [
    { d: 'M5.2 7.8 9 12l-3.8 4.2', paint: 'stroke' },
    { d: 'M18.8 7.8 15 12l3.8 4.2', paint: 'stroke' },
    { d: 'M10.4 18.4h3.2', paint: 'stroke' },
  ],
  android: [
    { d: 'M7.1 10.3h9.8v6.2a1.2 1.2 0 0 1-1.2 1.2H8.3a1.2 1.2 0 0 1-1.2-1.2z', paint: 'stroke' },
    { d: 'M7.1 10.3a4.9 4.9 0 0 1 9.8 0', paint: 'stroke' },
    { d: 'M9.4 6.4 8.1 4.5M14.6 6.4l1.3-1.9', paint: 'stroke' },
    { d: 'M10.1 8.4h.1M13.8 8.4h.1', paint: 'stroke' },
    { d: 'M5.2 11.6v3.1M18.8 11.6v3.1M9.5 17.7v2M14.5 17.7v2', paint: 'stroke' },
  ],
  web: [
    { d: 'M4.7 6.4h14.6v11.2H4.7z', paint: 'stroke' },
    { d: 'M4.7 9.5h14.6', paint: 'stroke' },
    { d: 'M8 14.1a4 4 0 0 0 8 0', paint: 'stroke' },
    { d: 'M12 10.9v6.4', paint: 'stroke' },
  ],
  backend: [
    { d: 'M6 6.7c0-1.4 2.7-2.5 6-2.5s6 1.1 6 2.5-2.7 2.5-6 2.5-6-1.1-6-2.5z', paint: 'stroke' },
    { d: 'M6 6.7v8.8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6.7', paint: 'stroke' },
    { d: 'M6 11.1c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5', paint: 'stroke' },
    { d: 'M8.4 19.8h7.2M12 18v1.8', paint: 'stroke' },
  ],
  tools: [
    { d: 'M15.7 4.8a3.5 3.5 0 0 0-4.4 4.3L5.8 14.6a1.7 1.7 0 0 0 2.4 2.4l5.5-5.5a3.5 3.5 0 0 0 4.3-4.4l-2.1 2.1-1.7-.3-.3-1.7z', paint: 'stroke' },
    { d: 'M6.4 5.4 18.6 17.6M17.2 19l2-2M4.8 7l2-2', paint: 'stroke' },
  ],
}

export const DEFAULT_HUB_GLYPH: HubGlyphPart[] = [
  { d: 'M12 4.5l6.5 3.8v7.4L12 19.5l-6.5-3.8V8.3z', paint: 'stroke' },
  { d: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', paint: 'stroke' },
]

export function getHubGlyph(groupId: string): HubGlyphPart[] {
  return HUB_GLYPHS[groupId] || DEFAULT_HUB_GLYPH
}

function rng(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
}

const P = {
  repel: 26000,
  hubRepel: 2.2,
  rest: 74,
  coreRest: 100,
  hubRest: 250,
  spring: 0.012,
  grav: 0.006,
  squash: 1.5,
  damp: 0.82,
  vmax: 260,
}

const CH = 6.45

function radius(n: GraphNode) {
  return n.hub ? (n.core ? 14 : 12) : 3.2
}

function labelBox(n: GraphNode) {
  if (n.hub) {
    const r = radius(n)
    return { x0: n.x - r, y0: n.y - r, x1: n.x + r, y1: n.y + r }
  }
  const w = n.label.length * CH + 28
  const h = 13
  const x0 = n.side === 'left' ? n.x - radius(n) - 6 - w : n.x + radius(n) + 6
  return { x0, y0: n.y - h / 2, x1: x0 + w, y1: n.y + h / 2 }
}

function build(groups: SkillGroup[] = portfolioConfig.skills.groups) {
  const { w: W, h: H } = VIEW
  const rand = rng(20240822)
  const nodes: GraphNode[] = []
  const edges: [string, string][] = []

  const coreGroup = groups.find((g) => g.core) || groups[0]
  const nonCoreGroups = groups.filter((g) => g !== coreGroup)
  const ring = Math.max(nonCoreGroups.length, 1)

  let ri = 0
  groups.forEach((g) => {
    const isCore = g === coreGroup
    const a = (ri / ring) * Math.PI * 2 - Math.PI / 2
    if (!isCore) ri++

    const hub: GraphNode = {
      id: g.id,
      label: g.label,
      kind: g.kind,
      hub: true,
      core: isCore,
      group: g.id,
      side: 'right',
      x: isCore ? W / 2 : W / 2 + Math.cos(a) * (34 + rand() * 26),
      y: isCore ? H / 2 : H / 2 + Math.sin(a) * (34 + rand() * 26),
      vx: 0,
      vy: 0,
    }
    nodes.push(hub)

    g.items.forEach(([label, kind], i) => {
      const t = (i / Math.max(g.items.length, 1)) * Math.PI * 2 + rand() * 0.6
      nodes.push({
        id: `${g.id}:${label}`,
        label,
        kind,
        hub: false,
        core: isCore,
        group: g.id,
        side: 'right',
        x: hub.x + Math.cos(t) * (12 + rand() * 24),
        y: hub.y + Math.sin(t) * (12 + rand() * 24),
        vx: 0,
        vy: 0,
      })
      edges.push([hub.id, `${g.id}:${label}`])
    })
  })

  // Cross-link hubs: link core to every other hub, and link adjacent hubs in ring
  for (let i = 0; i < nonCoreGroups.length; i++) {
    edges.push([coreGroup.id, nonCoreGroups[i].id])
    if (i > 0) {
      edges.push([nonCoreGroups[i - 1].id, nonCoreGroups[i].id])
    }
  }
  if (nonCoreGroups.length > 2) {
    edges.push([nonCoreGroups[nonCoreGroups.length - 1].id, nonCoreGroups[0].id])
  }

  return { nodes, edges, byId: new Map(nodes.map((n) => [n.id, n])) }
}

export function simTick(g: Graph, alpha: number) {
  const { w: W, h: H } = VIEW
  const ns = g.nodes
  for (const n of ns) {
    n.vx *= P.damp
    n.vy *= P.damp
  }
  for (let i = 0; i < ns.length; i++) {
    for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i]
      const b = ns[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d2 = dx * dx + dy * dy || 0.01
      const d = Math.sqrt(d2)
      const push = (P.repel * (a.hub || b.hub ? P.hubRepel : 1)) / d2
      const fx = (dx / d) * push
      const fy = (dy / d) * push
      a.vx -= fx
      a.vy -= fy
      b.vx += fx
      b.vy += fy
    }
  }
  for (const [ai, bi] of g.edges) {
    const a = g.byId.get(ai)
    const b = g.byId.get(bi)
    if (!a || !b) continue
    const rest = a.hub && b.hub ? P.hubRest : a.core || b.core ? P.coreRest : P.rest
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 0.01
    const f = (d - rest) * P.spring
    a.vx += (dx / d) * f
    a.vy += (dy / d) * f
    b.vx -= (dx / d) * f
    b.vy -= (dy / d) * f
  }
  for (const n of ns) {
    n.vx += (W / 2 - n.x) * P.grav
    n.vy += (H / 2 - n.y) * P.grav * P.squash
    n.vx = Math.max(-P.vmax, Math.min(P.vmax, n.vx))
    n.vy = Math.max(-P.vmax, Math.min(P.vmax, n.vy))
    if (n.fixed) {
      n.vx = 0
      n.vy = 0
    } else {
      n.x += n.vx * alpha
      n.y += n.vy * alpha
    }
  }
}

export function decollide(g: Graph) {
  const ns = g.nodes
  for (let i = 0; i < ns.length; i++) {
    for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i]
      const b = ns[j]
      const abox = labelBox(a)
      const bbox = labelBox(b)
      const ox = Math.min(abox.x1, bbox.x1) - Math.max(abox.x0, bbox.x0)
      const oy = Math.min(abox.y1, bbox.y1) - Math.max(abox.y0, bbox.y0)
      if (ox > 0 && oy > 0) {
        if (ox < oy) {
          const shift = ox / 2 + 1
          if (!a.fixed && !a.hub) a.x += a.x < b.x ? -shift : shift
          if (!b.fixed && !b.hub) b.x += b.x < a.x ? -shift : shift
        } else {
          const shift = oy / 2 + 1
          if (!a.fixed && !a.hub) a.y += a.y < b.y ? -shift : shift
          if (!b.fixed && !b.hub) b.y += b.y < a.y ? -shift : shift
        }
      }
    }
  }
}

export type Camera = { k: number; tx: number; ty: number }

export function frameNodes(subset: GraphNode[], pad = 44, maxZoom = 2.4): Camera {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const n of subset) {
    const b = labelBox(n)
    if (b.x0 < minX) minX = b.x0
    if (b.x1 > maxX) maxX = b.x1
    if (b.y0 < minY) minY = b.y0
    if (b.y1 > maxY) maxY = b.y1
  }
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2
  const k = Math.min(VIEW.w / w, VIEW.h / h, maxZoom)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return {
    k,
    tx: VIEW.w / 2 - cx * k,
    ty: VIEW.h / 2 - cy * k,
  }
}

export function computeFit(g: Graph): Camera {
  return frameNodes(g.nodes, 48, 1.4)
}

export type Graph = ReturnType<typeof build> & {
  near: Map<string, Set<string>>
  radius: typeof radius
}

export function buildGraph(groups = portfolioConfig.skills.groups): Graph {
  const base = build(groups)
  for (const n of base.nodes) {
    if (!n.hub) {
      const hub = base.byId.get(n.group)
      if (hub) n.side = n.x < hub.x ? 'left' : 'right'
    }
  }

  const near = new Map<string, Set<string>>()
  for (const n of base.nodes) near.set(n.id, new Set())
  for (const [a, b] of base.edges) {
    near.get(a)?.add(b)
    near.get(b)?.add(a)
  }

  return { ...base, near, radius }
}
