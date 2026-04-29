import { useTheme } from '../lib/theme'

interface Props {
  variant?: 'icon' | 'full'
  className?: string
}

export function Logo({ variant = 'full', className = '' }: Props) {
  const { resolvedTheme } = useTheme()

  if (variant === 'icon') {
    const src = resolvedTheme === 'dark' ? '/statewave_icon_dark.png' : '/statewave_icon_light.png'
    return <img src={src} alt="Statewave" className={`h-8 w-8 ${className}`} />
  }

  const src = resolvedTheme === 'dark' ? '/statewave_logo_dark.png' : '/statewave_logo_light.png'
  return <img src={src} alt="Statewave" className={`object-contain ${className}`} />
}
