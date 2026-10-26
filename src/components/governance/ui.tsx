import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { H2 } from '../home/ui'

/** Centered two-tone section heading from the governance Figma frames. */
export function GHead({ id, a, b, lede, dark }: { id: string; a: string; b: string; lede: string; dark?: boolean }) {
  return (
    <div className={`gv-head${dark ? ' gv-head--dark' : ''}`}>
      <H2 id={id} a={a} b={b} />
      <p className="pd-lede">{lede}</p>
    </div>
  )
}

export type Fold = { open?: boolean; onToggle?: () => void }

/** Card title that becomes the open/close button on phones (see useFold). Chevrons swap, they never rotate. */
export function FoldTitle({ panel, open, onToggle, children }: Fold & { panel: string; children: ReactNode }) {
  if (open === undefined) return <>{children}</>
  return (
    <button type="button" className="gv-toggle" aria-expanded={open} aria-controls={panel} onClick={onToggle}>
      {children}
      {open ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
    </button>
  )
}
