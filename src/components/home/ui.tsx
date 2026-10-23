import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { logo } from './links'

/** Internal paths go through the router; everything else (mailto included,
 *  matching the FAQ links) opens in a new tab. */
export function Ln({
  to, className, style, children, ariaLabel,
}: { to: string; className?: string; style?: CSSProperties; children: ReactNode; ariaLabel?: string }) {
  if (to.startsWith('/')) {
    return <Link to={to} className={className} style={style} aria-label={ariaLabel}>{children}</Link>
  }
  const ext = !to.startsWith('#')
  return (
    <a
      href={to}
      className={className}
      style={style}
      aria-label={ariaLabel}
      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

/** Brand glyph tinted by currentColor (the logos are single-path SVGs). */
export function Icon({ name, size = 16, w, h }: { name: string; size?: number; w?: number; h?: number }) {
  return (
    <span
      aria-hidden="true"
      className="sw-icon"
      style={{ width: w ?? size, height: h ?? size, ['--m' as string]: `url(${logo(name)})` }}
    />
  )
}

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <span className={`sw-eyebrow${dark ? ' sw-eyebrow--dark' : ''}`}>{children}</span>
}

const words = (text: string, from: number) =>
  text.split(' ').map((w, i) => (
    <span key={`${from}-${i}`}>
      <span className="sw-w" style={{ ['--d' as string]: `${(from + i) * 40}ms` }}>{w}</span>{' '}
    </span>
  ))

/** Two-tone section heading. Words fade in as the heading scrolls into view
 *  (armed only after mount, so the server-rendered HTML is never hidden). */
export function H2({
  a, b, xl, one, style, id,
}: { a: string; b?: string; xl?: boolean; one?: boolean; style?: CSSProperties; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() }
    }, { rootMargin: '0px 0px -15% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const n = a.split(' ').length
  return (
    <h2 ref={ref} id={id} className={`sw-h2${xl ? ' sw-h2--xl' : ''}`} style={style}>
      {words(a, 0)}
      {b && (<>{one ? ' ' : <br />}<span className="sw-dim">{words(b, n)}</span></>)}
    </h2>
  )
}

export function Divider() {
  const cross = (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M5.5 0V11M0 5.5H11" /></svg>
  )
  return <div className="sw-divider" aria-hidden="true">{cross}{cross}</div>
}
