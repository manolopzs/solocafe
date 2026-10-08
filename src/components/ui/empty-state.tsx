import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-200 bg-warm-50 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-warm-400">{icon}</div>}
      <h3 className="text-sm font-semibold text-warm-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-warm-500">{description}</p>}
    </div>
  )
}
