import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'

const tones = {
  danger: 'bg-danger/10 text-danger',
  info: 'bg-accent/10 text-foreground',
  warning: 'bg-warning/10 text-foreground',
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={['flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm leading-5', tones[tone]].join(' ')}>
      <Icon name={tone === 'danger' ? 'x' : 'check'} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
