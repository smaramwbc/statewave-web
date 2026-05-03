import { useRef, useEffect, useCallback, useState } from 'react'
import { useTheme } from '../lib/theme'
import { useChatWidget } from '../lib/widget-context'
import { fetchLiveData, type LiveSubjectData } from '../services/statewave-live'

/**
 * Statewave data model — visualized.
 *
 * Episodes and memories both belong directly to a subject. Memories are
 * compiled from episodes; the link is `source_episode_ids` (real provenance
 * returned by the backend), not a content-similarity heuristic.
 *
 * Layout reflects retrieval shape:
 * - Subject: large central anchor (the entity Statewave organizes around)
 * - Memory: medium node on inner orbit (compiled, ranked, retrieved)
 * - Episode: small particle on outer orbit (raw event, append-only)
 * - Lines:
 *   - Memory → Subject (membership)
 *   - Memory → its source Episodes (provenance)
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
  episodeId: string
  startX: number
  startY: number
  x: number
  y: number
  size: number
  phase: number
  group: number
  subjectIdx: number
  // Provenance anchor: if this episode is cited by at least one memory,
  // anchorMemoryIdx points to that memory (the first one citing it) and
  // anchorOrder / anchorSiblings define its slot in that memory's local
  // orbit. Orphan episodes have anchorMemoryIdx = -1 and orbit the subject.
  anchorMemoryIdx: number
  anchorOrder: number
  anchorSiblings: number
  // Raw-event metadata (for tooltips)
  source: string
  type: string
  label: string
}

interface Memory {
  memoryId: string
  startX: number
  startY: number
  x: number
  y: number
  size: number
  phase: number
  group: number
  subjectId: string
  subjectIdx: number
  // Compiled-memory metadata (for tooltips)
  kind: string
  confidence: number
  label: string
  // Real provenance — indices into the episodes array of episodes this
  // memory was compiled from (populated after build, since episode array
  // grows alongside memories).
  sourceEpisodeIdxs: number[]
}

const ANIMATION_DURATION = 3

// Color spectrum per group — hues chosen so every group is clearly visible
// on both light and dark backgrounds (avoid yellows + pale pinks that vanish
// on white).
const GROUP_COLORS = [
  { h: 190, s: 90, name: 'cyan' },     // Support Agent — bright cyan
  { h: 265, s: 85, name: 'violet' },   // Coding Assistant — violet
  { h: 340, s: 88, name: 'magenta' },  // Sales Copilot — deep pink/magenta (was rose, too pale on white)
  { h: 22,  s: 92, name: 'orange' },   // DevOps Agent — orange (was amber/yellow, near-invisible on white)
  { h: 160, s: 78, name: 'emerald' },  // Research Assistant — emerald
]

function groupColor(group: number, lightness: number, alpha: number): string {
  const c = GROUP_COLORS[group % GROUP_COLORS.length]
  return `hsla(${c.h}, ${c.s}%, ${lightness}%, ${alpha})`
}

/**
 * Build Subject[], Memory[], and Episode[] from live Statewave API data.
 *
 * Episodes and memories both belong directly to a subject. The episode↔memory
 * relationship comes from the backend's real `source_episode_ids` provenance,
 * not from any content-similarity guess.
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

  // First pass: create subjects + episodes (need episode index for provenance)
  // and remember per-subject mappings so we can resolve memory.source_episode_ids.
  const episodeIdxById: Map<string, number> = new Map()

  for (let groupIdx = 0; groupIdx < data.length; groupIdx++) {
    const subjectData = data[groupIdx]
    const group = groupIdx % 5
    const subjectIdx = subjects.length

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

    // Episodes (raw events) — append-only history, child of subject
    const seenEpisodeContent = new Set<string>()
    for (const ep of subjectData.episodes) {
      const payloadMsg =
        (ep.payload?.content as string) ||
        (ep.payload?.message as string) ||
        (ep.payload?.text as string) ||
        `${ep.type} from ${ep.source}`
      const normalizedEp = payloadMsg.trim().toLowerCase()
      if (seenEpisodeContent.has(normalizedEp)) continue
      seenEpisodeContent.add(normalizedEp)

      const idx = episodes.length
      episodeIdxById.set(ep.id, idx)
      episodes.push({
        episodeId: ep.id,
        startX: Math.random(),
        startY: Math.random(),
        x: Math.random(),
        y: Math.random(),
        size: 1.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        group,
        subjectIdx,
        // Anchor fields populated after memories are built (second pass below).
        anchorMemoryIdx: -1,
        anchorOrder: 0,
        anchorSiblings: 0,
        source: ep.source,
        type: ep.type,
        label: payloadMsg,
      })
    }

    // Memories (compiled, derived) — child of subject; link to source episodes via provenance
    const seenMemoryContent = new Set<string>()
    for (const m of subjectData.memories) {
      const normalizedContent = m.content.trim().toLowerCase()
      if (seenMemoryContent.has(normalizedContent)) continue
      seenMemoryContent.add(normalizedContent)

      const sourceEpisodeIdxs: number[] = []
      for (const epId of m.source_episode_ids ?? []) {
        const idx = episodeIdxById.get(epId)
        if (idx !== undefined) sourceEpisodeIdxs.push(idx)
      }

      memories.push({
        memoryId: m.id,
        startX: Math.random(),
        startY: Math.random(),
        x: Math.random(),
        y: Math.random(),
        size: 5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        group,
        subjectId: subjectData.subject_id,
        subjectIdx,
        kind: m.kind,
        confidence: m.confidence,
        label: m.content,
        sourceEpisodeIdxs,
      })
    }
  }

  // Second pass: assign each cited episode an anchor memory + slot. Episodes
  // cited by multiple memories anchor to the first one (deterministic), but
  // provenance lines are still drawn to ALL citing memories.
  for (let mi = 0; mi < memories.length; mi++) {
    const cited = memories[mi].sourceEpisodeIdxs
    for (let order = 0; order < cited.length; order++) {
      const epIdx = cited[order]
      const ep = episodes[epIdx]
      if (!ep || ep.anchorMemoryIdx !== -1) continue
      ep.anchorMemoryIdx = mi
      ep.anchorOrder = order
      ep.anchorSiblings = cited.length
    }
  }

  return { subjects, memories, episodes }
}

/**
 * Detects narrow viewports (smartphone widths) at mount and on resize.
 *
 * On mobile we deliberately skip the entire canvas visualization: the agent
 * particles, labels, and provenance lines compete with the hero headline
 * for attention and made the page hard to read on real phones. Mobile gets
 * a calm gradient backdrop and the "Try the Demo" CTA in the hero — that's
 * enough; the canvas is desktop-first storytelling, not core content.
 */
function useIsHeroCanvasSuppressed(): boolean {
  const [suppressed, setSuppressed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 639px)').matches
  })
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setSuppressed(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return suppressed
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { openWidget, isOpen: widgetOpen, isMinimized: widgetMinimized } = useChatWidget()
  const canvasSuppressed = useIsHeroCanvasSuppressed()
  // While the chat widget is occupying the screen, the hero particles must
  // not respond to hover or click. We park the live state in a ref so the
  // window-level listeners (registered once) can read it without re-binding.
  const widgetActiveRef = useRef(false)
  widgetActiveRef.current = widgetOpen && !widgetMinimized
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
  const hintSubjectIdxRef = useRef<number>(-1)
  const [hintPos, setHintPos] = useState<{ x: number; y: number } | null>(null)
  const [hintVisible, setHintVisible] = useState(true)

  themeRef.current = isDark

  // Fetch live data from Statewave backend (only source of truth). Skipped
  // entirely on mobile — the canvas isn't rendered there, so we don't pay
  // the network round-trip or memory cost on a phone where it would never
  // become visible.
  const liveLoadedRef = useRef(false)
  useEffect(() => {
    if (canvasSuppressed) return
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
  }, [canvasSuppressed])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Only allow hover interaction once particles are grouped
    if (progressRef.current < 0.85) return
    // Suspend particle hover while the chat widget is occupying the screen —
    // no cursor changes, no tooltip, no click target underneath.
    if (widgetActiveRef.current) {
      if (hoveredRef.current) {
        hoveredRef.current = null
        document.body.style.cursor = ''
        setTooltip(null)
      }
      return
    }
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
        const memCount = memoriesRef.current.filter(m => m.subjectIdx === i).length
        const epCount = episodesRef.current.filter(ep => ep.subjectIdx === i).length
        const text = `Subject anchors all data for one entity.\n${memCount} memories · ${epCount} episodes`
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text, type: `${s.label} · ${s.subjectId}`, group: s.group, kind: 'subject' })
        hoveredRef.current = { kind: 'subject', idx: i }
        document.body.style.cursor = 'pointer'
        return
      }
    }

    // Check memories
    for (let i = 0; i < memoriesRef.current.length; i++) {
      const m = memoriesRef.current[i]
      const dx = m.x - mx
      const dy = m.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hitRadius = (m.size * 1.5) / Math.min(canvasW, canvasH)
      if (dist < hitRadius) {
        const groupNames = ['Support Agent', 'Coding Assistant', 'Sales Copilot', 'DevOps Agent', 'Research Assistant']
        const sourceCount = m.sourceEpisodeIdxs.length
        const confidencePct = Math.round(m.confidence * 100)
        const provenanceLine = sourceCount > 0
          ? `Compiled from ${sourceCount} episode${sourceCount === 1 ? '' : 's'}`
          : 'No source episodes linked'
        const text = `${m.label}\nkind: ${m.kind} · confidence: ${confidencePct}%\n${provenanceLine}`
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text, type: `${groupNames[m.group]} · ${m.subjectId}`, group: m.group, kind: 'memory' })
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
      const hitRadius = (ep.size * 2) / Math.min(canvasW, canvasH)
      if (dist < hitRadius) {
        // Reverse provenance: which memories cite this episode
        const citingCount = memoriesRef.current.reduce(
          (acc, m) => acc + (m.sourceEpisodeIdxs.includes(i) ? 1 : 0),
          0,
        )
        const citingLine = citingCount > 0
          ? `Cited by ${citingCount} memor${citingCount === 1 ? 'y' : 'ies'}`
          : 'Not yet compiled into a memory'
        const text = `${ep.label}\nsource: ${ep.source} · type: ${ep.type}\n${citingLine}`
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text, type: 'Episode (raw)', group: ep.group, kind: 'episode' })
        hoveredRef.current = { kind: 'episode', idx: i }
        document.body.style.cursor = 'pointer'
        setHintVisible(false)
        return
      }
    }

    hoveredRef.current = null
    document.body.style.cursor = ''
    setTooltip(null)
  }, [])

  // Click handler to open chat widget for any particle
  const handleClick = useCallback(() => {
    // Disable particle clicks while the widget is in front — otherwise a
    // click that lands on the visible canvas (e.g. between the widget and
    // the page edge) could re-trigger openWidget for a different persona.
    if (widgetActiveRef.current) return
    if (hoveredRef.current?.kind === 'episode') {
      const ep = episodesRef.current[hoveredRef.current.idx]
      const subj = subjectsRef.current[ep.subjectIdx]
      if (subj) {
        openWidget(subj.subjectId, subj.label)
      }
    } else if (hoveredRef.current?.kind === 'memory') {
      const mem = memoriesRef.current[hoveredRef.current.idx]
      const subj = subjectsRef.current[mem.subjectIdx]
      if (subj) {
        openWidget(subj.subjectId, subj.label)
      }
    } else if (hoveredRef.current?.kind === 'subject') {
      const subj = subjectsRef.current[hoveredRef.current.idx]
      if (subj) {
        openWidget(subj.subjectId, subj.label)
      }
    }
  }, [openWidget])

  // Anchor the hint chip to a random subject (the largest circle in any group),
  // but delay its appearance so users register the visualization first.
  const [hintReady, setHintReady] = useState(false)
  useEffect(() => {
    if (isLive && subjectsRef.current.length > 0 && hintSubjectIdxRef.current === -1) {
      hintSubjectIdxRef.current = Math.floor(Math.random() * subjectsRef.current.length)
    }
    if (!isLive) return
    const t = window.setTimeout(() => setHintReady(true), 3000)
    return () => window.clearTimeout(t)
  }, [isLive])

  useEffect(() => {
    // No canvas on mobile → no need to install the global hover/click
    // handlers. They'd be no-ops anyway since `canvasRef.current` is null,
    // but skipping the registration avoids a per-frame mouse callback on
    // every page just for the hero canvas.
    if (canvasSuppressed) return
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [handleMouseMove, handleClick, canvasSuppressed])

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

    // Responsive group centers — distribute around hero content
    // Hero content occupies roughly center (y: 0.3-0.6), so place groups around it
    const aspect = w / h
    const isWide = aspect > 1.4
    const isMobile = w < 640

    let groupCenters: { x: number; y: number }[]
    if (isMobile) {
      // Mobile: groups distributed around content area
      groupCenters = [
        { x: 0.22, y: 0.32 },  // Support Agent - mid left
        { x: 0.78, y: 0.28 },  // Coding Assistant - mid right
        { x: 0.15, y: 0.65 },  // Sales Copilot - lower left
        { x: 0.85, y: 0.68 },  // DevOps Agent - lower right
        { x: 0.50, y: 0.18 },  // Research Assistant - upper center
      ]
    } else if (isWide) {
      // Wide screens: shift everything down significantly
      groupCenters = [
        { x: 0.08, y: 0.52 },  // Support Agent - left mid
        { x: 0.92, y: 0.48 },  // Coding Assistant - right mid
        { x: 0.10, y: 0.85 },  // Sales Copilot - left bottom
        { x: 0.90, y: 0.82 },  // DevOps Agent - right bottom
        { x: 0.50, y: 0.18 },  // Research Assistant - upper center
      ]
    } else {
      // Default/tablet: balanced, shifted down
      groupCenters = [
        { x: 0.12, y: 0.48 },  // Support Agent - left mid
        { x: 0.88, y: 0.44 },  // Coding Assistant - right mid
        { x: 0.10, y: 0.82 },  // Sales Copilot - left bottom
        { x: 0.90, y: 0.78 },  // DevOps Agent - right bottom
        { x: 0.50, y: 0.16 },  // Research Assistant - upper center
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

    // Update episode positions.
    // - Cited episodes orbit their anchor memory tightly (short provenance
    //   lines, clear "this raw event compiled into that memory" reading).
    // - Orphan episodes (uncompiled) orbit the subject on the outer ring.
    // Pre-compute per-subject orphan counts/indices once for the orphan loop.
    const orphanIdxBySubject: number[][] = subjects.map(() => [])
    for (let ei = 0; ei < episodes.length; ei++) {
      if (episodes[ei].anchorMemoryIdx === -1) {
        orphanIdxBySubject[episodes[ei].subjectIdx].push(ei)
      }
    }

    for (let ei = 0; ei < episodes.length; ei++) {
      const e = episodes[ei]
      let tX: number, tY: number
      if (e.anchorMemoryIdx !== -1) {
        // Cluster around the anchor memory in a small local orbit.
        const anchor = memories[e.anchorMemoryIdx]
        const angle =
          (e.anchorOrder / Math.max(e.anchorSiblings, 1)) * Math.PI * 2 +
          e.phase * 0.2 +
          t * 0.06
        const r = 0.022 + ((e.phase / (Math.PI * 2)) % 1) * 0.012
        tX = anchor.x + Math.cos(angle) * r
        tY = anchor.y + Math.sin(angle) * r * 0.75
      } else {
        // Orphan: outer orbit around the subject.
        const subj = subjects[e.subjectIdx]
        const orphans = orphanIdxBySubject[e.subjectIdx]
        const orderInOrphans = orphans.indexOf(ei)
        const angle =
          (orderInOrphans / Math.max(orphans.length, 1)) * Math.PI * 2 +
          e.phase * 0.2 +
          t * 0.05
        const r = 0.14 + ((e.phase / (Math.PI * 2)) % 1) * 0.03
        tX = subj.x + Math.cos(angle) * r
        tY = subj.y + Math.sin(angle) * r * 0.7
      }

      const baseX = e.startX + (tX - e.startX) * progress
      const baseY = e.startY + (tY - e.startY) * progress
      const chaos = (1 - progress) * 0.04
      e.x = baseX + Math.sin(t * 0.5 + e.phase * 4) * chaos + Math.sin(t * 0.2 + e.phase) * 0.002 * progress
      e.y = baseY + Math.cos(t * 0.4 + e.phase * 3) * chaos + Math.cos(t * 0.15 + e.phase * 1.5) * 0.002 * progress
    }

    // Episodes reach the subject through the memories that cite them.
    // Only orphan episodes (not yet compiled into any memory) get a direct
    // membership line — that's the honest "raw, uncompiled" state. Cited
    // episodes are connected via the brighter provenance line drawn below.
    const citedEpisodes = new Set<number>()
    for (const m of memories) {
      for (const idx of m.sourceEpisodeIdxs) citedEpisodes.add(idx)
    }
    if (progress > 0.25) {
      const orphanAlpha = (progress - 0.25) * 1.3 * (dark ? 0.18 : 0.13)
      for (let ei = 0; ei < episodes.length; ei++) {
        if (citedEpisodes.has(ei)) continue
        const e = episodes[ei]
        const subj = subjects[e.subjectIdx]
        if (!subj) continue
        const ex = e.x * w
        const ey = e.y * h
        const sx = subj.x * w
        const sy = subj.y * h
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = groupColor(e.group, dark ? 60 : 50, orphanAlpha)
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    }

    // Draw provenance lines: memory → each of its real source episodes.
    // This is the actual Statewave link (memory.source_episode_ids), not a
    // geometric or content-similarity guess. Visible after layout settles.
    if (progress > 0.3) {
      for (const m of memories) {
        if (m.sourceEpisodeIdxs.length === 0) continue
        const mx = m.x * w
        const my = m.y * h
        const provenanceAlpha = (progress - 0.3) * 1.4 * (dark ? 0.32 : 0.28)
        for (const epIdx of m.sourceEpisodeIdxs) {
          const e = episodes[epIdx]
          if (!e) continue
          const ex = e.x * w
          const ey = e.y * h
          ctx.beginPath()
          ctx.moveTo(mx, my)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = groupColor(m.group, dark ? 70 : 45, provenanceAlpha)
          ctx.lineWidth = 0.9
          ctx.stroke()
        }
      }
    }

    // Draw memory→subject connections (membership)
    for (const m of memories) {
      const subj = subjects[m.subjectIdx]
      const mx = m.x * w
      const my = m.y * h
      const sx = subj.x * w
      const sy = subj.y * h
      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2)
      const maxDist = 220

      if (dist < maxDist && progress > 0.2) {
        const strength = (1 - dist / maxDist) * progress
        const alpha = strength * (dark ? 0.3 : 0.22)
        ctx.beginPath()
        ctx.moveTo(mx, my)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = groupColor(m.group, dark ? 72 : 45, alpha)
        ctx.lineWidth = Math.max(0.7, strength * 1.6)
        ctx.stroke()
      }
    }

    // Draw episodes (small dots — colored by their subject's group)
    const hovered = hoveredRef.current
    for (let ei = 0; ei < episodes.length; ei++) {
      const e = episodes[ei]
      const px = e.x * w
      const py = e.y * h
      const isHovered = hovered?.kind === 'episode' && hovered.idx === ei
      const alpha = isHovered ? 1 : (dark ? 0.65 + progress * 0.25 : 0.7 + progress * 0.25)
      const radius = isHovered ? e.size * 2 : e.size

      if (isHovered) {
        ctx.beginPath()
        ctx.arc(px, py, radius + 4, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(e.group, dark ? 72 : 38, 0.55)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered
        ? groupColor(e.group, dark ? 85 : 32, 0.98)
        : groupColor(e.group, dark ? 68 : 38, alpha)
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

      // Pulsing attention ring (radiates outward)
      if (progress > 0.5) {
        const pulseSpeed = 1.2
        const pulsePhase = (t * pulseSpeed + s.phase) % (Math.PI * 2)
        const pulseProgress = pulsePhase / (Math.PI * 2)
        const pulseRadius = s.size * (1.5 + pulseProgress * 2.5)
        const pulseAlpha = (1 - pulseProgress) * (dark ? 0.35 : 0.25) * (progress - 0.5) * 2
        
        ctx.beginPath()
        ctx.arc(px, py, pulseRadius, 0, Math.PI * 2)
        ctx.strokeStyle = groupColor(s.group, dark ? 75 : 55, pulseAlpha)
        ctx.lineWidth = 2 * (1 - pulseProgress * 0.5)
        ctx.stroke()
      }

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

      // Subject node with enhanced pulse
      const breathe = Math.sin(t * 0.3 + s.phase) * 0.05
      const pulse = Math.sin(t * 1.5 + s.phase) * 0.08
      const nodeRadius = s.size * (0.95 + breathe + pulse * progress)
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


    // Update hint chip position from tracked subject (throttled)
    const hIdx = hintSubjectIdxRef.current
    if (hIdx >= 0 && hIdx < subjects.length && progress > 0.3) {
      const s = subjects[hIdx]
      const now = performance.now()
      if (!lastHintUpdate.current || now - lastHintUpdate.current > 80) {
        lastHintUpdate.current = now
        setHintPos({ x: s.x, y: s.y })
      }
    }

    frameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    if (canvasSuppressed) return
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
  }, [draw, canvasSuppressed])

  // On phones the agent canvas crashed into the headline and made the hero
  // unreadable (the labels — Support Agent, Coding Assistant, etc. — sat
  // directly on top of the H1). Mobile gets a calm brand-aligned gradient
  // backdrop instead; the "Try the Demo" CTA in the hero is enough.
  if (canvasSuppressed) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={{
          background: isDark
            ? 'radial-gradient(60% 50% at 18% 22%, rgba(99,102,241,0.18), transparent 70%), radial-gradient(50% 40% at 82% 30%, rgba(96,165,250,0.14), transparent 70%), radial-gradient(60% 50% at 50% 95%, rgba(34,211,238,0.10), transparent 70%)'
            : 'radial-gradient(60% 50% at 18% 22%, rgba(99,102,241,0.10), transparent 70%), radial-gradient(50% 40% at 82% 30%, rgba(96,165,250,0.08), transparent 70%), radial-gradient(60% 50% at 50% 95%, rgba(6,182,212,0.06), transparent 70%)',
        }}
      />
    )
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-50"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          // Vignette only the very edges so corner/bottom particles stay
          // legible while the text in the center still has breathing room.
          background: isDark
            ? 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, var(--theme-surface-0) 100%)'
            : 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, var(--theme-surface-0) 100%)',
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
              <div
                className="mt-2 pt-2 border-t text-[10px] font-medium tracking-wide flex items-center gap-1"
                style={{
                  borderColor: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                  color: isDark ? '#a5b4fc' : '#6366f1',
                  opacity: 0.85,
                }}
              >
                Click to try the demo
                <span aria-hidden>→</span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* "Live from Statewave API" chip relocated to the hero CTA row in
          HomePage.tsx so it sits next to the demo button and reads with full
          contrast (it was being washed out under the section's bottom fade). */}

      {/* Hint chip — anchored to a subject (biggest circle), demands attention.
          z-50 keeps it above the section's bottom-fade overlay and any other
          page-level scrims, so it never looks dimmed even if its anchor
          subject sits in the faded zone. */}
      {isLive && hintReady && hintVisible && hintPos && !widgetOpen && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `clamp(140px, ${hintPos.x * 100}%, calc(100% - 140px))`,
            top: `clamp(60px, ${hintPos.y * 100}%, calc(100% - 60px))`,
            transform: 'translate(-50%, -150%)',
          }}
        >
          <div
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-transform duration-150 hover:scale-110"
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              boxShadow: isDark
                ? '0 0 0 4px rgba(99, 102, 241, 0.18), 0 8px 24px -4px rgba(99, 102, 241, 0.55), 0 4px 12px -2px rgba(0, 0, 0, 0.35)'
                : '0 0 0 4px rgba(99, 102, 241, 0.18), 0 8px 24px -4px rgba(99, 102, 241, 0.4), 0 4px 12px -2px rgba(99, 102, 241, 0.25)',
              animation: 'heroHintBounce 1.4s ease-in-out infinite',
            }}
            onClick={() => {
              const idx = hintSubjectIdxRef.current
              if (idx >= 0 && idx < subjectsRef.current.length) {
                const subj = subjectsRef.current[idx]
                if (subj) {
                  openWidget(subj.subjectId, subj.label)
                }
                setHintVisible(false)
              }
            }}
          >
            {/* Mouse cursor icon — direct visual cue to "interact here" */}
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l7 19 2-8 8-2z" />
            </svg>
            <span>Try with Memory</span>
          </div>
        </div>
      )}
    </div>
  )
}