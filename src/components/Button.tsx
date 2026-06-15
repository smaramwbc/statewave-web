import { forwardRef, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  href?: string
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button = forwardRef<HTMLElement, Props>(function Button(
  { children, href, to, onClick, variant = 'primary', size = 'md', className = '' },
  ref,
) {
  // Explicit property list (not `transition-all`) because `scrollbar-color`
  // inherits from <html> and trips Lighthouse's non-composited-animations
  // audit when included by `all`.
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-[background-color,color,border-color,box-shadow,transform] duration-200'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/20 hover:shadow-accent/30',
    secondary: 'bg-surface-2 text-theme-primary border border-theme-border hover:bg-surface-3 hover:border-theme-border',
    ghost: 'text-theme-muted hover:text-theme-primary',
    // High-contrast CTAs for dark landing surfaces (e.g. the Multi-Agent
    // Memory page), where a solid white or solid dark button is the design.
    white: 'bg-white text-[#0a0a0f] hover:bg-white/90 shadow-lg shadow-black/10',
    dark: 'bg-[#0a0a0f] text-white hover:bg-[#18181b]',
  }

  // min-h-* enforces the 44px WCAG / Apple HIG tap target on mobile so
  // visitors don't misclick adjacent CTAs on small phones. Desktop hover
  // is unaffected — these only set a floor.
  const sizes = {
    sm: 'min-h-10 px-4 py-2 text-sm gap-1.5',
    md: 'min-h-11 px-6 py-3 text-sm gap-2',
    lg: 'min-h-12 px-7 sm:px-8 py-3.5 sm:py-4 text-base gap-2.5',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link ref={ref as Ref<HTMLAnchorElement>} to={to} className={cls}>{children}</Link>
  if (href) return <a ref={ref as Ref<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  return <button ref={ref as Ref<HTMLButtonElement>} type="button" onClick={onClick} className={cls}>{children}</button>
})
