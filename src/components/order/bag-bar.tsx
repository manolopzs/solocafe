'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * "View order": 56 high, full pill, blue, 12 above the tab bar and 20 from the
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
  const [bump, setBump] = useState(0)
  const prevPulseRef = useRef(pulseKey)

  useEffect(() => {
    if (pulseKey > 0 && pulseKey !== prevPulseRef.current) {
      setBump((n) => n + 1)
      prevPulseRef.current = pulseKey
    }
  }, [pulseKey])

  if (count <= 0) return null

  return (
    <div
      key={bump}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+var(--bagbar-gap))] z-40 px-5 animate-bag-bump motion-reduce:animate-none"
    >
      <button
        type="button"
        onClick={onOpen}
        data-pulse={pulseKey > 0 ? 'true' : undefined}
        data-testid="bag-bar"
        className="phone-col pointer-events-auto flex h-14 animate-bar-in items-center justify-between rounded-full bg-cta pl-5 pr-5 text-cta-foreground shadow-float transition-colors hover:bg-cta-hover active:bg-cta-hover active:scale-[0.98] touch-manipulation motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex items-center gap-2.5 text-button">
          <span
            key={pulseKey}
            className={[
              'inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cta-foreground px-[7px] text-[13px] font-bold leading-6 tabular-nums text-cta',
              pulseKey > 0 ? 'animate-badge-pop motion-reduce:animate-none' : '',
            ].join(' ')}
          >
            {count}
          </span>
          View order
        </span>
        <span className="flex flex-col items-end">
          <span className="text-base font-semibold leading-5 tabular-nums">{total}</span>
          {etaMinutes !== undefined && (
            <span className="text-tab font-medium opacity-85">Ready in about {etaMinutes} min</span>
          )}
        </span>
      </button>
    </div>
  )
}
