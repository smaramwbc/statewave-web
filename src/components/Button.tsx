import { forwardRef, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  href?: string
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button = forwardRef<HTMLElement, Props>(function Button(
  { children, href, to, onClick, variant = 'primary', size = 'md', className = '' },
  ref,
) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/20 hover:shadow-accent/30',
    secondary: 'bg-surface-2 text-theme-primary border border-theme-border hover:bg-surface-3 hover:border-theme-border',
    ghost: 'text-theme-muted hover:text-theme-primary',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link ref={ref as Ref<HTMLAnchorElement>} to={to} className={cls}>{children}</Link>
  if (href) return <a ref={ref as Ref<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  return <button ref={ref as Ref<HTMLButtonElement>} type="button" onClick={onClick} className={cls}>{children}</button>
})
