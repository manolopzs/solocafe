import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles: Record<Required<BadgeProps>['variant'], string> = {
  default: 'bg-foreground text-primary-foreground',
  secondary: 'bg-surface text-foreground border border-border',
  outline: 'border border-border bg-surface-elevated text-foreground',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  info: 'bg-surface text-foreground border border-border',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
