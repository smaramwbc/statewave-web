import { useTheme } from '../lib/theme'

interface Props {
  variant?: 'icon' | 'full'
  className?: string
}

export function Logo({ variant = 'full', className = '' }: Props) {
  const { resolvedTheme } = useTheme()

  if (variant === 'icon') {
    return (
      <img
        src="/brand/icon.svg"
        alt="Statewave"
        className={`object-contain ${className}`}
      />
    )
  }

  const src =
    resolvedTheme === 'dark'
      ? '/brand/logo-horizontal-db.svg'
      : '/brand/logo-horizontal-lb.svg'

  return <img src={src} alt="Statewave" className={`object-contain ${className}`} />
}