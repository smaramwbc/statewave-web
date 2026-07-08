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
    'group relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-full transition-[background-color,color,border-color,box-shadow,filter] duration-300 ease-out'

  const variants = {
    primary:
      'btn-gradient text-white shadow-[0_12px_34px_rgba(108,92,255,.22)] hover:shadow-[0_18px_48px_rgba(108,92,255,.34)]',

    secondary:
      'bg-surface-1/50 border border-white/15 text-theme-primary hover:bg-surface-1/70 hover:border-white/25',

    ghost:
      'text-theme-secondary hover:text-theme-primary',

    white:
      'bg-white text-[#0B1020] hover:bg-white/90',

    dark:
      'bg-[#0A1223] text-white hover:bg-[#111C33]',
  }

  // min-h-* enforces the 44px WCAG / Apple HIG tap target on mobile so
  // visitors don't misclick adjacent CTAs on small phones. Desktop hover
  // is unaffected — these only set a floor.
  const sizes = {
    sm: 'h-10 px-5 text-sm gap-2',
    md: 'h-11 px-6 text-sm gap-2',
    lg: 'h-[54px] px-8 text-[15px] gap-2.5',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link ref={ref as Ref<HTMLAnchorElement>} to={to} className={cls}>{children}</Link>
  if (href) return <a ref={ref as Ref<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  return <button ref={ref as Ref<HTMLButtonElement>} type="button" onClick={onClick} className={cls}>{children}</button>
})
