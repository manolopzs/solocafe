'use client'

import { Icon } from '@/components/ui/icon'

export function BagBar({
  count,
  total,
  etaMinutes,
  onOpen,
}: {
  count: number
  total: string
  etaMinutes?: number
  onOpen: () => void
}) {
  if (count <= 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-14 z-40 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-2xl bg-primary px-4 text-primary-foreground shadow-float animate-rise touch-manipulation"
      >
        <span className="flex items-center gap-2.5 font-medium">
          <Icon name="cart" className="h-5 w-5" />
          Ver pedido
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-sm font-semibold tabular-nums text-primary">
            {count}
          </span>
        </span>
        <span className="text-right">
          <span className="block font-semibold tabular-nums">{total}</span>
          {etaMinutes !== undefined && (
            <span className="block text-[11px] font-medium text-primary-foreground/80">Listo en unos {etaMinutes} min</span>
          )}
        </span>
      </button>
    </div>
  )
}
