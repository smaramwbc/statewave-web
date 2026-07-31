import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description: string
  className?: string
}

export function Card({ icon, title, description, className = '' }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`sw-card p-6 rounded-2xl border border-brand-500/20 bg-surface-1/45 hover:border-brand-500/35 transition-colors ${className}`}
    >
      {icon && <div className="mb-4 text-accent">{icon}</div>}
      <h3 className="text-lg font-semibold text-theme-primary mb-2">{title}</h3>
      <p className="text-sm text-theme-muted leading-relaxed">{description}</p>
    </motion.div>
  )
}
