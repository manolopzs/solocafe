'use client'

import { Icon } from '@/components/ui/icon'

export function BagBar({
  count,
  total,
  etaMinutes,
  onOpen,
  pulseKey = 0,
}: {
  count: number
  total: string
  etaMinutes?: number
  onOpen: () => void
  /** Bumped on every add; the bar pulses once each time it changes. */
  pulseKey?: number
}) {
  if (count <= 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-14 z-40 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
      <button
        key={pulseKey}
        type="button"
        onClick={onOpen}
        data-pulse={pulseKey > 0 ? 'true' : undefined}
        className={`pointer-events-auto mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-2xl bg-cta px-4 text-cta-foreground shadow-float transition-colors hover:bg-cta-hover active:bg-cta-hover ${pulseKey > 0 ? 'animate-bag-pulse' : 'animate-rise'} touch-manipulation`}
      >
        <span className="flex items-center gap-2.5 font-medium">
          <Icon name="cart" className="h-5 w-5" />
          Ver pedido
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cta-foreground px-1.5 text-sm font-semibold tabular-nums text-cta">
            {count}
          </span>
        </span>
        <span className="text-right">
          <span className="block font-semibold tabular-nums">{total}</span>
          {etaMinutes !== undefined && (
            <span className="block text-[11px] font-medium text-cta-foreground">Listo en unos {etaMinutes} min</span>
          )}
        </span>
      </button>
    </div>
  )
}
