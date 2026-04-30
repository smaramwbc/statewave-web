import { useRef, useEffect, useCallback, useState } from 'react'
import { useTheme } from '../lib/theme'
import { fetchLiveData, type LiveSubjectData } from '../services/statewave-live'

/**
 * "Subjects → Memories → Episodes" — Hierarchical Visualization
 *
 * Three distinct visual tiers reflecting the Statewave data model:
 * - Subjects: large central nodes (one per subject_id)
 * - Memories: medium nodes orbiting their subject
 * - Episodes: small particles orbiting their parent memory
 *
 * Animation:
 * - All particles start scattered
 * - They drift into hierarchical orbits
 * - Final state: clear subject→memory→episode structure
 */

interface Subject {
  startX: number
  startY: number
  x: number
  y: number
  size: number
  phase: number
  group: number
  subjectId: string
  label: string
}

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
  subjectId: string
  subjectIdx: number
}

const ANIMATION_DURATION = 14

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

/**
 * Build Subject[], Memory[], and Episode[] from live Statewave API data.
 * Hierarchy: Subject → Memories → Episodes
 * Episodes are linked to their closest-matching memory by content similarity.
 */
function buildFromLiveData(data: LiveSubjectData[]): { subjects: Subject[]; memories: Memory[]; episodes: Episode[] } {
  const subjects: Subject[] = []
  const memories: Memory[] = []
  const episodes: Episode[] = []

  const SUBJECT_LABELS: Record<string, string> = {
    'demo-support-agent': 'Support Agent',
    'demo-coding-assistant': 'Coding Assistant',
    'demo-sales-copilot': 'Sales Copilot',
    'demo-devops-agent': 'DevOps Agent',
    'demo-research-assistant': 'Research Assistant',
  }

  for (let groupIdx = 0; groupIdx < data.length; groupIdx++) {
    const subjectData = data[groupIdx]
    const group = groupIdx % 5
    const subjectIdx = subjects.length

    // Create subject node
    subjects.push({
      startX: Math.random(),
      startY: Math.random(),
      x: Math.random(),
      y: Math.random(),
      size: 14 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      group,
      subjectId: subjectData.subject_id,
      label: SUBJECT_LABELS[subjectData.subject_id] || subjectData.subject_id,
    })

    // Create Memory nodes (deduplicated by content)
    const seenMemoryContent = new Set<string>()
    const groupMemStart = memories.length
    for (const m of subjectData.memories) {
      const normalizedContent = m.content.trim().toLowerCase()
      if (seenMemoryContent.has(normalizedContent)) continue
      seenMemoryContent.add(normalizedContent)

      memories.push({
        startX: Math.random(),
        startY: Math.random(),
        targetX: 0, targetY: 0,
        x: Math.random(), y: Math.random(),
        size: 5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        group,
        label: m.content,
        subjectId: subjectData.subject_id,
        subjectIdx,
      })
    }
    const groupMemEnd = memories.length

    // Create Episode particles (deduplicated), linked to closest memory by content
    const seenEpisodeContent = new Set<string>()
    for (const ep of subjectData.episodes) {
      const payloadMsg = (ep.payload?.content as string) || (ep.payload?.message as string) || (ep.payload?.text as string) || `${ep.type} from ${ep.source}`
      const normalizedEp = payloadMsg.trim().toLowerCase()
      if (seenEpisodeContent.has(normalizedEp)) continue
      seenEpisodeContent.add(normalizedEp)

      // Find the best-matching memory in this group by content overlap
      let bestMemIdx = groupMemStart
      let bestScore = 0
      for (let mi = groupMemStart; mi < groupMemEnd; mi++) {
        const memContent = memories[mi].label.toLowerCase()
        // Simple word-overlap score
        const epWords = normalizedEp.split(/\s+/)
        const score = epWords.filter(w => w.length > 3 && memContent.includes(w)).length
        if (score > bestScore) {
          bestScore = score
          bestMemIdx = mi
        }
      }
      // Fallback: round-robin within group
      if (bestScore === 0 && groupMemEnd > groupMemStart) {
        bestMemIdx = groupMemStart + (episodes.length % (groupMemEnd - groupMemStart))
      }

      episodes.push({
        startX: Math.random(),
        startY: Math.random(),
        targetX: 0, targetY: 0,
        x: Math.random(), y: Math.random(),
        size: 1.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        memoryIdx: bestMemIdx,
        label: payloadMsg,
      })
    }
  }

  return { subjects, memories, episodes }
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const subjectsRef = useRef<Subject[]>([])
  const memoriesRef = useRef<Memory[]>([])  
  const episodesRef = useRef<Episode[]>([])
  const frameRef = useRef<number>(0)
  const lastHintUpdate = useRef<number>(0)
  const themeRef = useRef(isDark)
  const startTimeRef = useRef<number>(0)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; type: string; group: number; kind: 'memory' | 'episode' | 'subject' } | null>(null)
  const [isLive, setIsLive] = useState(false)
  const hoveredRef = useRef<{ kind: 'memory' | 'episode' | 'subject'; idx: number } | null>(null)
  const progressRef = useRef<number>(0)
  const hintMemoryIdxRef = useRef<number>(-1)
  const [hintPos, setHintPos] = useState<{ x: number; y: number } | null>(null)
  const [hintLabel, setHintLabel] = useState('')
  const [hintVisible, setHintVisible] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  themeRef.current = isDark

  // Fetch live data from Statewave backend (only source of truth)
  const liveLoadedRef = useRef(false)
  useEffect(() => {
    if (liveLoadedRef.current) return
    liveLoadedRef.current = true
    fetchLiveData().then((data) => {
      if (!data || data.length === 0) return
      const { subjects, memories, episodes } = buildFromLiveData(data)
      if (memories.length === 0) return
      subjectsRef.current = subjects
      memoriesRef.current = memories
      episodesRef.current = episodes
      startTimeRef.current = 0 // restart animation
      setIsLive(true)
    })
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Only allow hover interaction once particles are grouped
    if (progressRef.current < 0.85) return
    const rect = canvas.getBoundingClientRect()
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setTooltip(null)
      hoveredRef.current = null
      document.body.style.cursor = ''
      return
    }
    const mx = (e.clientX - rect.left) / rect.width
    const my = (e.clientY - rect.top) / rect.height

    // Check subjects first (largest circles)
    const canvasW = canvas.width ?? 1000
    const canvasH = canvas.height ?? 600
    for (let i = 0; i < subjectsRef.current.length; i++) {
      const s = subjectsRef.current[i]
      const dx = s.x - mx
      const dy = s.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hitRadius = (s.size * 1.5) / Math.min(canvasW, canvasH)
      if (dist < hitRadius) {
        const allMems = memoriesRef.current.filter(m => m.subjectIdx === i)
        const text = allMems.slice(0, 4).map(m => `• ${m.label}`).join('\n')
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text, type: `${s.label} · ${s.subjectId}`, group: s.group, kind: 'subject' })
        hoveredRef.current = { kind: 'subject', idx: i }
        document.body.style.cursor = 'pointer'
        return
      }
    }

    // Check memories (hit area matches visual size)
    for (let i = 0; i < memoriesRef.current.length; i++) {
      const m = memoriesRef.current[i]
      const dx = m.x - mx
      const dy = m.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Convert pixel radius to normalized coords (size is ~6-11px, use size * 1.5 for comfortable hit area)
      const hitRadius = (m.size * 1.5) / Math.min(canvasW, canvasH)
      if (dist < hitRadius) {
        const groupNames = ['Support Agent', 'Coding Assistant', 'Sales Copilot', 'DevOps Agent', 'Research Assistant']
        const storyText = m.label
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: storyText, type: `${groupNames[m.group]} · ${m.subjectId}`, group: m.group, kind: 'memory' })
        hoveredRef.current = { kind: 'memory', idx: i }
        document.body.style.cursor = 'pointer'
        return
      }
    }

    // Check episodes (hit area matches visual size)
    for (let i = 0; i < episodesRef.current.length; i++) {
      const ep = episodesRef.current[i]
      const dx = ep.x - mx
      const dy = ep.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Episode size is ~1.5-3px, use size * 2 for comfortable hit area
      const hitRadius = (ep.size * 2) / Math.min(canvasW, canvasH)
      if (dist < hitRadius) {
        const parentGroup = memoriesRef.current[ep.memoryIdx]?.group ?? 0
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: ep.label, type: 'Episode', group: parentGroup, kind: 'episode' })
        hoveredRef.current = { kind: 'episode', idx: i }
        document.body.style.cursor = 'pointer'
        // Hide hint chip once user discovers hovering
        setHintVisible(false)
        return
      }
    }

    hoveredRef.current = null
    document.body.style.cursor = ''
    setTooltip(null)
  }, [])

  // Click handler to open modal
  const handleClick = useCallback(() => {
    if (hoveredRef.current?.kind === 'episode') {
      const ep = episodesRef.current[hoveredRef.current.idx]
      const parentMem = memoriesRef.current[ep.memoryIdx]
      setSelectedMemory(parentMem)
      setModalOpen(true)
    } else if (hoveredRef.current?.kind === 'memory') {
      const mem = memoriesRef.current[hoveredRef.current.idx]
      setSelectedMemory(mem)
      setModalOpen(true)
    } else if (hoveredRef.current?.kind === 'subject') {
      // Open modal with the first memory of this subject
      const subjIdx = hoveredRef.current.idx
      const firstMem = memoriesRef.current.find(m => m.subjectIdx === subjIdx)
      if (firstMem) {
        setSelectedMemory(firstMem)
        setModalOpen(true)
      }
    }
  }, [])

  // Select a random memory (big circle) from any group as hint
  useEffect(() => {
    if (isLive && memoriesRef.current.length > 0 && hintMemoryIdxRef.current === -1) {
      const candidates = memoriesRef.current
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.label.length > 10)
      if (candidates.length > 0) {
        hintMemoryIdxRef.current = candidates[Math.floor(Math.random() * candidates.length)].i
      } else {
        hintMemoryIdxRef.current = Math.floor(Math.random() * memoriesRef.current.length)
      }
    }
  }, [isLive])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [handleMouseMove, handleClick])

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
    progressRef.current = progress

    // Clear
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    const memories = memoriesRef.current
    const episodes = episodesRef.current
    const subjects = subjectsRef.current

    // Responsive group centers — push groups further out on wide screens
    const aspect = w / h
    const isWide = aspect > 1.4
    const isMobile = w < 640

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

    // Update subject positions (move toward group centers)
    for (const s of subjects) {
      const gc = groupCenters[s.group]
      s.x = s.startX + (gc.x - s.startX) * progress + Math.sin(t * 0.15 + s.phase) * 0.003 * progress
      s.y = s.startY + (gc.y - s.startY) * progress + Math.cos(t * 0.12 + s.phase) * 0.003 * progress
    }

    // Update memory positions (orbit around their subject)
    for (let mi = 0; mi < memories.length; mi++) {
      const m = memories[mi]
      const subj = subjects[m.subjectIdx]
      // Distribute memories in a spiral around their subject
      const groupMemories = memories.filter(mem => mem.subjectIdx === m.subjectIdx)
      const indexInGroup = groupMemories.indexOf(m)
      const countInGroup = groupMemories.length
      const angle = (indexInGroup / Math.max(countInGroup, 1)) * Math.PI * 2 + m.phase * 0.3 + t * 0.03
      const r = 0.06 + (indexInGroup / Math.max(countInGroup, 1)) * 0.05 + (m.phase / (Math.PI * 2)) * 0.02
      const tX = subj.x + Math.cos(angle) * r
      const tY = subj.y + Math.sin(angle) * r * 0.7

      const baseX = m.startX + (tX - m.startX) * progress
      const baseY = m.startY + (tY - m.startY) * progress
      const chaos = (1 - progress) * 0.025
      m.x = baseX + Math.sin(t * 0.3 + m.phase * 3) * chaos + Math.sin(t * 0.15 + m.phase) * 0.003 * progress
      m.y = baseY + Math.cos(t * 0.25 + m.phase * 2) * chaos + Math.cos(t * 0.12 + m.phase * 1.3) * 0.002 * progress
    }

    // Update episode positions (orbit their parent memory)
    for (const e of episodes) {
      const mem = memories[e.memoryIdx]
      const angle = e.phase + t * 0.12
      const r = 0.018 + (e.phase / (Math.PI * 2)) * 0.025
      const tX = mem.x + Math.cos(angle) * r
      const tY = mem.y + Math.sin(angle) * r * 0.7

      const baseX = e.startX + (tX - e.startX) * progress
      const baseY = e.startY + (tY - e.startY) * progress
      const chaos = (1 - progress) * 0.04
      e.x = baseX + Math.sin(t * 0.5 + e.phase * 4) * chaos + Math.sin(t * 0.2 + e.phase) * 0.002 * progress
      e.y = baseY + Math.cos(t * 0.4 + e.phase * 3) * chaos + Math.cos(t * 0.15 + e.phase * 1.5) * 0.002 * progress
    }

    // Draw episode→memory connections
    for (const e of episodes) {
      const mem = memories[e.memoryIdx]
      const ex = e.x * w
      const ey = e.y * h
      const mx = mem.x * w
      const my = mem.y * h
      const dist = Math.sqrt((ex - mx) ** 2 + (ey - my) ** 2)
      const maxDist = 60 + progress * 30

      if (dist < maxDist) {
        const strength = (1 - dist / maxDist) * progress
        const alpha = strength * (dark ? 0.25 : 0.15)
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(mx, my)
        ctx.strokeStyle = groupColor(mem.group, dark ? 65 : 50, alpha)
        ctx.lineWidth = strength * 0.6
        ctx.stroke()
      }
    }

    // Draw memory→subject connections
    for (const m of memories) {
      const subj = subjects[m.subjectIdx]
      const mx = m.x * w
      const my = m.y * h
      const sx = subj.x * w
      const sy = subj.y * h
      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2)
      const maxDist = 200

      if (dist < maxDist && progress > 0.2) {
        const strength = (1 - dist / maxDist) * progress
        const alpha = strength * (dark ? 0.4 : 0.25)
        ctx.beginPath()
        ctx.moveTo(mx, my)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = groupColor(m.group, dark ? 70 : 45, alpha)
        ctx.lineWidth = strength * 1.5
        ctx.stroke()
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

    // Draw subject nodes (largest — center of each group)
    for (const s of subjects) {
      const px = s.x * w
      const py = s.y * h
      const alpha = dark ? 0.8 + progress * 0.2 : 0.6 + progress * 0.3

      // Large glow
      if (progress > 0.15) {
        const glowR = s.size * (3 + progress * 3)
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        const glowAlpha = progress * (dark ? 0.2 : 0.12)
        gradient.addColorStop(0, groupColor(s.group, dark ? 70 : 50, glowAlpha))
        gradient.addColorStop(0.5, groupColor(s.group, dark ? 60 : 45, glowAlpha * 0.3))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.beginPath()
        ctx.arc(px, py, glowR, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Subject node
      const nodeRadius = s.size * (0.95 + Math.sin(t * 0.3 + s.phase) * 0.05)
      ctx.beginPath()
      ctx.arc(px, py, nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = groupColor(s.group, dark ? 80 : 40, alpha)
      ctx.fill()

      // Outer ring
      if (progress > 0.4) {
        const ringAlpha = (progress - 0.4) * 1.5 * (dark ? 0.4 : 0.25)
        ctx.beginPath()
        ctx.arc(px, py, s.size * 1.8, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(s.group, dark ? 75 : 50, ringAlpha)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Subject label (when settled)
      if (progress > 0.7) {
        const labelAlpha = (progress - 0.7) * 3.3 * (dark ? 0.7 : 0.8)
        ctx.font = '500 10px Inter, system-ui, sans-serif'
        ctx.fillStyle = groupColor(s.group, dark ? 85 : 35, labelAlpha)
        ctx.textAlign = 'center'
        ctx.fillText(s.label, px, py + s.size + 14)
      }
    }


    // Update hint chip position from tracked memory (throttled)
    const hIdx = hintMemoryIdxRef.current
    if (hIdx >= 0 && hIdx < memories.length && progress > 0.3) {
      const m = memories[hIdx]
      const now = performance.now()
      if (!lastHintUpdate.current || now - lastHintUpdate.current > 80) {
        lastHintUpdate.current = now
        setHintPos({ x: m.x, y: m.y })
        if (!hintLabel) {
          const label = m.label.length > 35 ? m.label.slice(0, 35) + '…' : m.label
          setHintLabel(label)
        }
      }
    }

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
          className="absolute pointer-events-none z-50"
          style={{
            left: Math.min(tooltip.x + 16, (canvasRef.current?.getBoundingClientRect().width ?? 600) - 320),
            top: Math.max(tooltip.y - 20, 8),
          }}
        >
          {tooltip.kind === 'episode' ? (
            /* Episode: compact clickable chip */
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-md"
              style={{
                backgroundColor: isDark ? 'rgba(15, 12, 41, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                boxShadow: isDark 
                  ? '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1)' 
                  : '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.08)',
              }}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${GROUP_COLORS[tooltip.group % 5].h}, 70%, 60%)` }}
              />
              <span 
                className="text-[11px] font-medium max-w-[200px] truncate"
                style={{ color: isDark ? '#e0e7ff' : '#1f2937' }}
              >
                {tooltip.text}
              </span>
              <span 
                className="text-[10px] opacity-60 flex-shrink-0 ml-1"
                style={{ color: isDark ? '#a5b4fc' : '#6366f1' }}
              >
                click →
              </span>
            </div>
          ) : (
            /* Memory: summary card showing all group memories */
            <div 
              className="px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md max-w-[300px]"
              style={{
                backgroundColor: isDark ? 'rgba(15, 12, 41, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                boxShadow: isDark 
                  ? '0 12px 40px -8px rgba(0, 0, 0, 0.5)' 
                  : '0 12px 40px -8px rgba(0, 0, 0, 0.12)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-theme-border/20">
                <span 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: `hsl(${GROUP_COLORS[tooltip.group % 5].h}, 70%, 60%)` }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: isDark ? '#a5b4fc' : '#6b7280' }}>
                  {tooltip.type}
                </span>
              </div>
              <div className="space-y-1">
                {tooltip.text.split('\n').map((line, i) => (
                  <p key={i} className="text-[11px] leading-relaxed" style={{ color: isDark ? '#c7d2fe' : '#374151', opacity: 0.9 - i * 0.04 }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isLive && (
        <div
          className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border border-theme-border/50 backdrop-blur-sm pointer-events-none"
          style={{
            backgroundColor: isDark ? 'rgba(30, 27, 75, 0.7)' : 'rgba(255, 255, 255, 0.8)',
            color: isDark ? '#6ee7b7' : '#059669',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live from Statewave API
        </div>
      )}

      {/* Hint chip — follows a random memory particle */}
      {isLive && hintVisible && hintPos && (
        <div
          className="absolute flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-medium border border-indigo-400/30 backdrop-blur-sm cursor-pointer transition-all duration-100 whitespace-nowrap hover:scale-105"
          style={{
            left: `clamp(120px, ${hintPos.x * 100}%, calc(100% - 120px))`,
            top: `clamp(50px, ${hintPos.y * 100}%, calc(100% - 60px))`,
            transform: 'translate(-50%, -130%)',
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(99, 102, 241, 0.1)',
            color: isDark ? '#c7d2fe' : '#4338ca',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          onClick={() => {
            const idx = hintMemoryIdxRef.current
            if (idx >= 0 && idx < memoriesRef.current.length) {
              setSelectedMemory(memoriesRef.current[idx])
              setModalOpen(true)
              setHintVisible(false)
            }
          }}
        >
          <span className="opacity-70">✦</span>
          <span>{hintLabel || 'memory'} · click →</span>
        </div>
      )}

      {/* Modal for memory interaction */}
      {modalOpen && selectedMemory && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative max-w-lg w-full mx-4 p-6 rounded-2xl border border-theme-border shadow-2xl"
            style={{
              backgroundColor: isDark ? 'rgba(15, 12, 41, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-border/30 transition-colors"
              onClick={() => setModalOpen(false)}
            >
              <span className="text-theme-muted text-lg">×</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-theme-border/30">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `hsl(${GROUP_COLORS[selectedMemory.group % 5].h}, ${GROUP_COLORS[selectedMemory.group % 5].s}%, 60%)` }}
              />
              <div>
                <h2 className="text-lg font-semibold text-theme-primary">
                  {['Support Agent', 'Coding Assistant', 'Sales Copilot', 'DevOps Agent', 'Research Assistant'][selectedMemory.group]}
                </h2>
                <p className="text-xs text-theme-muted font-mono">{selectedMemory.subjectId}</p>
              </div>
            </div>

            {/* Memory content */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-theme-muted mb-1 font-semibold">Memory</p>
              <p className="text-theme-primary">{selectedMemory.label}</p>
            </div>

            {/* Related episodes */}
            {(() => {
              const memIdx = memoriesRef.current.indexOf(selectedMemory)
              const relatedEps = episodesRef.current.filter(ep => ep.memoryIdx === memIdx)
              if (relatedEps.length === 0) return null
              return (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-theme-muted mb-2 font-semibold">Related Episodes</p>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {relatedEps.slice(0, 6).map((ep, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-theme-secondary">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: `hsl(${GROUP_COLORS[selectedMemory.group % 5].h}, 70%, 60%)` }} />
                        <span>{ep.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* TODO: Chat interface placeholder */}
            <div className="p-4 rounded-lg border border-dashed border-theme-border/50 bg-theme-surface-1/30">
              <p className="text-sm text-theme-muted text-center">
                {/* TODO: Implement chatbot interface to interact with this memory context */}
                💬 Chat interface coming soon — ask questions about this memory
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}