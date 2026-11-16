'use client'

/**
 * "Ver pedido": 56 high, full pill, blue, 12 above the tab bar and 20 from the
 * sides (foundation/SPEC.md section 2). It slides up in 240ms the first time and
 * the count badge pops (260ms) on every add.
 */
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
  /** Bumped on every add; the badge pops once each time it changes. */
  pulseKey?: number
}) {
  if (count <= 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+var(--bagbar-gap))] z-40 px-5">
      <button
        type="button"
        onClick={onOpen}
        data-pulse={pulseKey > 0 ? 'true' : undefined}
        data-testid="bag-bar"
        className="pointer-events-auto mx-auto flex h-14 w-full max-w-3xl animate-bar-in items-center justify-between rounded-full bg-cta pl-5 pr-5 text-cta-foreground shadow-float transition-colors hover:bg-cta-hover active:bg-cta-hover touch-manipulation"
      >
        <span className="flex items-center gap-2.5 text-button">
          <span
            key={pulseKey}
            className={[
              'inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cta-foreground px-[7px] text-[13px] font-bold leading-6 tabular-nums text-cta',
              pulseKey > 0 ? 'animate-badge-pop' : '',
            ].join(' ')}
          >
            {count}
          </span>
          Ver pedido
        </span>
        <span className="flex flex-col items-end">
          <span className="text-base font-semibold leading-5 tabular-nums">{total}</span>
          {etaMinutes !== undefined && (
            <span className="text-tab font-medium opacity-85">Listo en unos {etaMinutes} min</span>
          )}
        </span>
      </button>
    </div>
  )
}
