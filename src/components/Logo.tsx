import { useTheme } from '../lib/theme'

interface Props {
  variant?: 'icon' | 'full'
  className?: string
}

// The icon SVG is theme-agnostic (it uses its own gradients) so we inline a
// single copy for both themes. Inline at 32px renders at any density without
// the 9KB PNG download Lighthouse flagged. The full wordmark is still a PNG
// because it has typeset letterforms; we only use it on a small number of
// surfaces (footer of marketing pages, OG images), not on the LCP path.
function StatewaveIconSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sw-layer1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="sw-layer2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="sw-layer3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="sw-wave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path
        d="M12 48 C12 48 16 52 32 52 C48 52 52 48 52 48 L52 44 C52 44 48 48 32 48 C16 48 12 44 12 44 Z"
        fill="url(#sw-layer3)"
        opacity="0.8"
      />
      <path
        d="M12 40 C12 40 16 44 32 44 C48 44 52 40 52 40 L52 36 C52 36 48 40 32 40 C16 40 12 36 12 36 Z"
        fill="url(#sw-layer2)"
        opacity="0.9"
      />
      <path d="M32 10 L14 22 L14 30 L32 38 L50 30 L50 22 Z" fill="url(#sw-layer1)" opacity="0.95" />
      <path
        d="M18 26 L26 26 L29 20 L32 32 L35 22 L38 26 L46 26"
        stroke="url(#sw-wave)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="6" y="24" width="4" height="1.5" rx="0.75" fill="#22d3ee" opacity="0.8" />
      <rect x="4" y="28" width="6" height="1.5" rx="0.75" fill="#06b6d4" opacity="0.6" />
      <rect x="7" y="32" width="3" height="1.5" rx="0.75" fill="#8b5cf6" opacity="0.5" />
      <circle cx="32" cy="41" r="1.5" fill="#a5b4fc" />
      <circle cx="32" cy="47" r="1.5" fill="#c4b5fd" />
    </svg>
  )
}

export function Logo({ variant = 'full', className = '' }: Props) {
  const { resolvedTheme } = useTheme()

  if (variant === 'icon') {
    return <StatewaveIconSvg className={`h-8 w-8 ${className}`} />
  }

  const src = resolvedTheme === 'dark' ? '/statewave_logo_dark.png' : '/statewave_logo_light.png'
  return <img src={src} alt="Statewave" className={`object-contain ${className}`} />
}
