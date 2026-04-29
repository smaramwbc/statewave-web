import { useRef, useEffect, useCallback, useState } from 'react'
import { useTheme } from '../lib/theme'

/**
 * "Episodes → Memories" — Progressive Organization
 *
 * Two distinct visual groups:
 * - Episodes: small scattered fragments (raw interactions/events)
 * - Memories: larger compiled nodes (derived knowledge)
 *
 * Animation:
 * - Episodes start scattered everywhere
 * - They drift toward memory nodes and cluster around them
 * - Memories form connected groups (knowledge graph)
 * - Final state: clear episode→memory structure, organized
 */

interface Episode {
  startX: number
  startY: number
  targetX: number
  targetY: number
  x: number
  y: number
  size: number
  phase: number
  memoryIdx: number
  label: string
}

interface Memory {
  startX: number
  startY: number
  targetX: number
  targetY: number
  x: number
  y: number
  size: number
  phase: number
  group: number
  label: string
}

// TODO: Connect this visualization to the real Statewave API for live data.
// Replace mock memories/episodes with real-time subject context from
// GET /v1/memories/search and GET /v1/timeline endpoints.
// This will serve as a compelling real-time product demo on the marketing site.

const ANIMATION_DURATION = 14
const MEMORY_COUNT = 14
const EPISODE_COUNT = 130

// Color spectrum per group (hue-shifted for a beautiful rainbow spread)
const GROUP_COLORS = [
  { h: 180, s: 80, name: 'cyan' },    // Support Agent — cyan/teal
  { h: 260, s: 75, name: 'violet' },   // Coding Assistant — violet
  { h: 330, s: 75, name: 'rose' },     // Sales Copilot — rose/pink
  { h: 45, s: 85, name: 'amber' },     // DevOps Agent — amber/gold
  { h: 145, s: 70, name: 'emerald' },  // Research Assistant — emerald/green
]

function groupColor(group: number, lightness: number, alpha: number): string {
  const c = GROUP_COLORS[group % GROUP_COLORS.length]
  return `hsla(${c.h}, ${c.s}%, ${lightness}%, ${alpha})`
}

// 5 use-case groups, each with memories + episodes
// Group 0: Support Agent
// Group 1: Coding Assistant
// Group 2: Sales Copilot
// Group 3: DevOps Agent
// Group 4: Research Assistant

const memoryLabelsByGroup: Record<number, string[]> = {
  0: [
    'Customer prefers email over chat',
    'Billing issue resolved — refund issued',
    'Account tier: Enterprise',
  ],
  1: [
    'Project stack: Next.js + Prisma',
    'Coding style: functional, no classes',
    'Resolved: memory leak in useEffect',
  ],
  2: [
    'Deal stage: negotiation',
    'Budget approved: $50k ARR',
    'Key contact: VP Engineering',
  ],
  3: [
    'Infra: k8s on GCP, 3 clusters',
    'Incident resolved: DB failover lag',
    'SLA: 99.95% uptime target',
  ],
  4: [
    'Research focus: transformer efficiency',
    'Key finding: LoRA beats full fine-tune',
    'Prefers arxiv papers over blog posts',
  ],
}

const episodeLabelsByGroup: Record<number, string[]> = {
  0: [
    'Ticket opened: login failure',
    'Customer replied with screenshot',
    'Agent escalated to L2',
    'Resolution confirmed by user',
    'CSAT survey: 5/5',
    'Follow-up scheduled',
  ],
  1: [
    'Code review requested',
    'Suggested refactor: extract hook',
    'Test added for edge case',
    'PR merged to main',
    'Build passed: 142 tests green',
    'Deployed to staging',
  ],
  2: [
    'Discovery call completed',
    'Proposal sent: 3 options',
    'Objection handled: security',
    'Demo scheduled with CTO',
    'Contract redlined',
    'Follow-up email sent',
  ],
  3: [
    'Alert: CPU spike on node-7',
    'Auto-scaled to 5 replicas',
    'Rollback triggered: v2.3.1',
    'Health check restored',
    'Post-mortem drafted',
    'Runbook updated',
  ],
  4: [
    'Paper ingested: attention is all you need',
    'Key passage highlighted',
    'Comparison table generated',
    'Citation graph expanded',
    'Summary exported to Notion',
    'Follow-up question logged',
  ],
}

function createMemories(): Memory[] {
  const memories: Memory[] = []
  // 5 cluster groups arranged around the text area (not behind it)
  // These are normalized positions that avoid the center text zone
  const groupCenters = [
    { x: 0.12, y: 0.3 },   // top-left
    { x: 0.88, y: 0.28 },  // top-right
    { x: 0.08, y: 0.65 },  // bottom-left
    { x: 0.9, y: 0.62 },   // bottom-right
    { x: 0.5, y: 0.12 },   // top-center (above text)
  ]

  for (let i = 0; i < MEMORY_COUNT; i++) {
    const group = i % 5
    const gc = groupCenters[group]

    // Start: scattered
    const startX = Math.random()
    const startY = Math.random()

    // Target: clustered near group center
    const angle = (i / MEMORY_COUNT) * Math.PI * 2 + Math.random() * 0.8
    const r = 0.03 + Math.random() * 0.05
    const targetX = gc.x + Math.cos(angle) * r
    const targetY = gc.y + Math.sin(angle) * r * 0.7

    const groupLabels = memoryLabelsByGroup[group]
    memories.push({
      startX, startY,
      targetX, targetY,
      x: startX, y: startY,
      size: 5 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      group,
      label: groupLabels[i % groupLabels.length],
    })
  }
  return memories
}

function createEpisodes(memories: Memory[]): Episode[] {
  const episodes: Episode[] = []

  for (let i = 0; i < EPISODE_COUNT; i++) {
    // Each episode belongs to a random memory
    const memoryIdx = Math.floor(Math.random() * memories.length)
    const mem = memories[memoryIdx]

    // Start: scattered everywhere
    const startX = Math.random()
    const startY = Math.random()

    // Target: orbit around their parent memory
    const angle = Math.random() * Math.PI * 2
    const r = 0.02 + Math.random() * 0.04
    const targetX = mem.targetX + Math.cos(angle) * r
    const targetY = mem.targetY + Math.sin(angle) * r * 0.7

    const epLabels = episodeLabelsByGroup[mem.group]
    episodes.push({
      startX, startY,
      targetX, targetY,
      x: startX, y: startY,
      size: 1.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      memoryIdx,
      label: epLabels[i % epLabels.length],
    })
  }
  return episodes
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const memoriesRef = useRef<Memory[]>([])
  const episodesRef = useRef<Episode[]>([])
  const frameRef = useRef<number>(0)
  const themeRef = useRef(isDark)
  const startTimeRef = useRef<number>(0)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; type: string } | null>(null)
  const hoveredRef = useRef<{ kind: 'memory' | 'episode' | 'center'; idx: number } | null>(null)

  themeRef.current = isDark

  if (memoriesRef.current.length === 0) {
    memoriesRef.current = createMemories()
    episodesRef.current = createEpisodes(memoriesRef.current)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setTooltip(null)
      hoveredRef.current = null
      document.body.style.cursor = ''
      return
    }
    const mx = (e.clientX - rect.left) / rect.width
    const my = (e.clientY - rect.top) / rect.height

    // Check center ring (total memories indicator — shows full story)
    const cx = 0.5
    const cy = 0.5
    const distToCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
    if (distToCenter < 0.06) {
      const groupNames = ['Support Agent', 'Coding Assistant', 'Sales Copilot', 'DevOps Agent', 'Research Assistant']
      const storyLines = memoriesRef.current.map(m => `[${groupNames[m.group]}] ${m.label}`).join('\n')
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: storyLines, type: 'All Memories' })
      hoveredRef.current = { kind: 'center', idx: 0 }
      document.body.style.cursor = 'pointer'
      return
    }

    // Check memories first (larger hit area)
    for (let i = 0; i < memoriesRef.current.length; i++) {
      const m = memoriesRef.current[i]
      const dx = m.x - mx
      const dy = m.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.03) {
        const groupNames = ['Support Agent', 'Coding Assistant', 'Sales Copilot', 'DevOps Agent', 'Research Assistant']
        const groupMemories = memoriesRef.current.filter(mem => mem.group === m.group)
        const storyText = groupMemories.map(mem => mem.label).join('\n')
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: storyText, type: groupNames[m.group] })
        hoveredRef.current = { kind: 'memory', idx: i }
        document.body.style.cursor = 'pointer'
        return
      }
    }

    // Check episodes
    for (let i = 0; i < episodesRef.current.length; i++) {
      const ep = episodesRef.current[i]
      const dx = ep.x - mx
      const dy = ep.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.018) {
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: ep.label, type: 'Episode' })
        hoveredRef.current = { kind: 'episode', idx: i }
        document.body.style.cursor = 'pointer'
        return
      }
    }

    hoveredRef.current = null
    document.body.style.cursor = ''
    setTooltip(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (startTimeRef.current === 0) startTimeRef.current = time

    const dark = themeRef.current
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    const elapsed = (time - startTimeRef.current) * 0.001
    const t = elapsed

    // Progress: 0→1 over ANIMATION_DURATION
    const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1)
    const progress = rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2

    // Clear
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    const memories = memoriesRef.current
    const episodes = episodesRef.current

    // Responsive group centers — push groups further out on wide screens,
    // keep them visible on narrow/mobile screens
    const aspect = w / h
    const isWide = aspect > 1.4
    const isMobile = w < 640

    // On wide screens, groups go further to sides. On mobile, stack vertically.
    let groupCenters: { x: number; y: number }[]
    if (isMobile) {
      groupCenters = [
        { x: 0.25, y: 0.15 },
        { x: 0.75, y: 0.15 },
        { x: 0.2, y: 0.75 },
        { x: 0.8, y: 0.75 },
        { x: 0.5, y: 0.1 },
      ]
    } else if (isWide) {
      groupCenters = [
        { x: 0.15, y: 0.3 },
        { x: 0.85, y: 0.28 },
        { x: 0.13, y: 0.65 },
        { x: 0.87, y: 0.63 },
        { x: 0.5, y: 0.12 },
      ]
    } else {
      groupCenters = [
        { x: 0.18, y: 0.3 },
        { x: 0.82, y: 0.28 },
        { x: 0.16, y: 0.68 },
        { x: 0.84, y: 0.66 },
        { x: 0.5, y: 0.13 },
      ]
    }

    // Update memory positions (targets are responsive)
    for (let mi = 0; mi < memories.length; mi++) {
      const m = memories[mi]
      const gc = groupCenters[m.group]
      const angle = (mi / memories.length) * Math.PI * 2 + m.phase * 0.5
      const r = 0.03 + (m.phase / (Math.PI * 2)) * 0.04
      const tX = gc.x + Math.cos(angle) * r
      const tY = gc.y + Math.sin(angle) * r * 0.7

      const baseX = m.startX + (tX - m.startX) * progress
      const baseY = m.startY + (tY - m.startY) * progress
      const chaos = (1 - progress) * 0.025
      m.x = baseX + Math.sin(t * 0.3 + m.phase * 3) * chaos + Math.sin(t * 0.15 + m.phase) * 0.004 * progress
      m.y = baseY + Math.cos(t * 0.25 + m.phase * 2) * chaos + Math.cos(t * 0.12 + m.phase * 1.3) * 0.003 * progress
    }

    // Update episode positions (orbit their parent memory's current position)
    for (const e of episodes) {
      const mem = memories[e.memoryIdx]
      // Target is near the memory's current animated position
      const angle = e.phase + t * 0.1
      const r = 0.015 + (e.phase / (Math.PI * 2)) * 0.03
      const tX = mem.x + Math.cos(angle) * r
      const tY = mem.y + Math.sin(angle) * r * 0.7

      const baseX = e.startX + (tX - e.startX) * progress
      const baseY = e.startY + (tY - e.startY) * progress
      const chaos = (1 - progress) * 0.04
      e.x = baseX + Math.sin(t * 0.5 + e.phase * 4) * chaos +
            Math.sin(t * 0.3 + e.phase * 2) * chaos * 0.5 +
            Math.sin(t * 0.2 + e.phase) * 0.003 * progress
      e.y = baseY + Math.cos(t * 0.4 + e.phase * 3) * chaos +
            Math.cos(t * 0.25 + e.phase * 5) * chaos * 0.4 +
            Math.cos(t * 0.15 + e.phase * 1.5) * 0.003 * progress
    }

    // Draw episode→memory connections (colored per group)
    for (const e of episodes) {
      const mem = memories[e.memoryIdx]
      const ex = e.x * w
      const ey = e.y * h
      const mx = mem.x * w
      const my = mem.y * h
      const dist = Math.sqrt((ex - mx) ** 2 + (ey - my) ** 2)
      const maxDist = 80 + progress * 40

      if (dist < maxDist) {
        const strength = (1 - dist / maxDist) * progress
        const alpha = strength * (dark ? 0.3 : 0.2)
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(mx, my)
        ctx.strokeStyle = groupColor(mem.group, dark ? 65 : 50, alpha)
        ctx.lineWidth = strength * 0.8
        ctx.stroke()
      }
    }

    // Draw memory→memory connections within same group
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        if (memories[i].group !== memories[j].group) continue
        const mx1 = memories[i].x * w
        const my1 = memories[i].y * h
        const mx2 = memories[j].x * w
        const my2 = memories[j].y * h
        const dist = Math.sqrt((mx1 - mx2) ** 2 + (my1 - my2) ** 2)
        const maxDist = 150

        if (dist < maxDist) {
          const strength = (1 - dist / maxDist) * progress
          const alpha = strength * (dark ? 0.5 : 0.35)
          ctx.beginPath()
          ctx.moveTo(mx1, my1)
          ctx.lineTo(mx2, my2)
          ctx.strokeStyle = groupColor(memories[i].group, dark ? 70 : 45, alpha)
          ctx.lineWidth = strength * 2
          ctx.stroke()
        }
      }
    }

    // Draw episodes (small dots — colored per group)
    const hovered = hoveredRef.current
    for (let ei = 0; ei < episodes.length; ei++) {
      const e = episodes[ei]
      const px = e.x * w
      const py = e.y * h
      const parentGroup = memories[e.memoryIdx].group
      const isHovered = hovered?.kind === 'episode' && hovered.idx === ei
      const alpha = isHovered ? 1 : (dark ? 0.5 + progress * 0.2 : 0.4 + progress * 0.15)
      const radius = isHovered ? e.size * 2 : e.size

      if (isHovered) {
        ctx.beginPath()
        ctx.arc(px, py, radius + 4, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(parentGroup, 70, 0.5)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered
        ? groupColor(parentGroup, dark ? 85 : 40, 0.95)
        : groupColor(parentGroup, dark ? 65 : 45, alpha)
      ctx.fill()
    }

    // Draw memories (larger nodes with glow — colored per group)
    for (let mi = 0; mi < memories.length; mi++) {
      const m = memories[mi]
      const px = m.x * w
      const py = m.y * h
      const isHovered = hovered?.kind === 'memory' && hovered.idx === mi
      const alpha = isHovered ? 1 : (dark ? 0.7 + progress * 0.2 : 0.5 + progress * 0.2)

      // Glow
      if (progress > 0.2) {
        const glowR = m.size * (2.5 + progress * 2)
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        const glowAlpha = progress * (dark ? 0.15 : 0.1)
        gradient.addColorStop(0, groupColor(m.group, dark ? 70 : 50, glowAlpha))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.beginPath()
        ctx.arc(px, py, glowR, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Node
      const nodeRadius = m.size * (0.9 + Math.sin(t * 0.5 + m.phase) * 0.1)
      ctx.beginPath()
      ctx.arc(px, py, isHovered ? nodeRadius * 1.3 : nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered
        ? groupColor(m.group, dark ? 90 : 35, 0.95)
        : groupColor(m.group, dark ? 75 : 45, alpha)
      ctx.fill()

      if (isHovered) {
        ctx.beginPath()
        ctx.arc(px, py, nodeRadius * 1.3 + 5, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(m.group, 65, 0.6)
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Ring around memory nodes (becomes visible when organized)
      if (progress > 0.5) {
        const ringAlpha = (progress - 0.5) * 2 * (dark ? 0.3 : 0.18)
        ctx.beginPath()
        ctx.arc(px, py, m.size * 1.6, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(m.group, dark ? 70 : 50, ringAlpha)
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }

    // Draw center hub ring (total context indicator)
    const centerX = w * 0.5
    const centerY = h * 0.5
    const hubRadius = Math.min(w, h) * 0.035
    const hubAlpha = progress * (dark ? 0.25 : 0.15)
    ctx.beginPath()
    ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2)
    ctx.strokeStyle = dark ? `rgba(255, 255, 255, ${hubAlpha})` : `rgba(30, 30, 60, ${hubAlpha})`
    ctx.lineWidth = 1.5
    ctx.stroke()
    // Inner dot
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
    ctx.fillStyle = dark ? `rgba(255, 255, 255, ${hubAlpha * 1.5})` : `rgba(30, 30, 60, ${hubAlpha * 1.5})`
    ctx.fill()

    frameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [draw])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 75% at 50% 45%, transparent 30%, var(--theme-surface-0) 100%)'
            : 'radial-gradient(ellipse 75% 70% at 50% 45%, transparent 25%, var(--theme-surface-0) 100%)',
        }}
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-xs font-medium shadow-lg border border-theme-border backdrop-blur-sm transition-opacity duration-150"
          style={{
            left: Math.min(tooltip.x + 12, (canvasRef.current?.getBoundingClientRect().width ?? 600) - 320),
            top: tooltip.y - 8,
            maxWidth: tooltip.text.includes('\n') ? 300 : undefined,
            backgroundColor: isDark ? 'rgba(30, 27, 75, 0.95)' : 'rgba(255, 255, 255, 0.97)',
            color: isDark ? '#c7d2fe' : '#4338ca',
          }}
        >
          <span className="opacity-60 block mb-0.5">{tooltip.type}</span>
          {tooltip.text.includes('\n') ? (
            <div className="space-y-0.5 text-[10px] leading-tight opacity-90">
              {tooltip.text.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <span>{tooltip.text}</span>
          )}
        </div>
      )}
    </div>
  )
}