import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles: Record<Required<BadgeProps>['variant'], string> = {
  default: 'bg-espresso-700 text-white',
  secondary: 'bg-warm-100 text-warm-800',
  outline: 'border border-warm-200 bg-paper text-warm-700',
  success: 'bg-sage-100 text-sage-800',
  warning: 'bg-terracotta-100 text-terracotta-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-warm-100 text-warm-800',
}

export function Badge({ children, variant = 'secondary', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
