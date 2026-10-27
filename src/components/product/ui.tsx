import type { ReactNode } from 'react'
import { H2, Ln } from '../home/ui'

/** Section header from the Figma file: title left, lede (and an optional link) right. */
export function Head({ title, lede, more, dark }: { title: string; lede: string; more?: { to: string; label: string }; dark?: boolean }) {
  return (
    <div className={`pd-head${dark ? ' pd-head--dark' : ''}`}>
      <H2 a={title} />
      <div className="pd-head__side">
        <p className="pd-lede">{lede}</p>
        {more && <Ln to={more.to} className="pd-more">{more.label} →</Ln>}
      </div>
    </div>
  )
}

export type Tone = 'ok' | 'warn' | 'bad' | 'accent' | 'muted' | 'inv'

/** Small rounded status label (Active, Would deny, Local …). */
export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`pd-pill pd-pill--${tone}`}>{children}</span>
}

/** Square icon holder; `size` is the tile edge, the icon inside is about half of it. */
export function Tile({ children, size = 30, tone = 'tint' }: { children: ReactNode; size?: number; tone?: 'tint' | 'card' | 'navy' | 'ok' | 'warn' | 'inv' }) {
  return <span aria-hidden="true" className={`pd-tile pd-tile--${tone}`} style={{ width: size, height: size }}>{children}</span>
}

/** Pill-shaped segmented control. */
export function Seg<T extends string>({ label, options, value, onChange, dark }: {
  label: string; options: readonly { id: T; text: string }[]; value: T; onChange: (v: T) => void; dark?: boolean
}) {
  return (
    <div role="group" aria-label={label} className={`pd-seg${dark ? ' pd-seg--dark' : ''}`}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.text}</button>
      ))}
    </div>
  )
}

/** Full-colour brand mark (the shared v8 logo files). */
export function Brand({ name, size = 16 }: { name: 'slack' | 'zendesk' | 'gmail' | 'github'; size?: number }) {
  return <img src={`/images/home/v8/logos/${name}.svg`} alt="" width={size} height={size} className="pd-brand" loading="lazy" />
}
