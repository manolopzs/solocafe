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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-elevated/95 p-4 shadow-lg backdrop-blur-md safe-bottom">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-between rounded-full bg-foreground px-5 py-3.5 text-primary-foreground shadow-md touch-manipulation"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Icon name="cart" className="h-5 w-5" />
            Tu pedido
            <span className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-sm font-bold">{count}</span>
          </span>
          <span className="text-right">
            <span className="block font-bold">{total}</span>
            {etaMinutes !== undefined && (
              <span className="block text-[0.65rem] font-medium text-primary-foreground/75">Listo en ~{etaMinutes} min</span>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
