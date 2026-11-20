'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { formatMoney } from '@/lib/ordering'
import { Icon } from '@/components/ui/icon'

export type PhoneState = 'order' | 'preparing' | 'ready' | 'picked-up'

interface PhoneMockProps {
  mode?: 'auto' | 'controlled'
  state?: PhoneState
  className?: string
}

const autoStates: PhoneState[] = ['order', 'ready', 'picked-up']
const allStates: PhoneState[] = ['order', 'preparing', 'ready', 'picked-up']

const stateLabels: Record<PhoneState, string> = {
  order: 'Ordered',
  preparing: 'Preparing',
  ready: 'Ready',
  'picked-up': 'Picked up',
}

const menuItems = [
  { name: 'Latte', cents: 200, image: '/menu/cutouts/latte.png' },
  { name: 'Cortado', cents: 200, image: '/menu/cutouts/cortado.png' },
  { name: 'Café con leche', cents: 300, image: '/menu/cutouts/cafe-con-leche.png' },
]

export function PhoneMock({ mode = 'auto', state, className = '' }: PhoneMockProps) {
  const isControlled = mode === 'controlled'
  const states = isControlled ? allStates : autoStates
  const [internalState, setInternalState] = useState<PhoneState>(state ?? states[0])
  const current = isControlled && state ? state : internalState
  const containerRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(true)
  const currentIndex = states.indexOf(current)

  useEffect(() => {
    if (isControlled) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
      },
      { threshold: 0.1 }
    )
    observer.observe(container)

    const onVisibility = () => {
      if (document.hidden) visibleRef.current = false
      else {
        const rect = container.getBoundingClientRect()
        visibleRef.current =
          rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    const interval = setInterval(() => {
      if (!visibleRef.current) return
      setInternalState((prev) => {
        const idx = states.indexOf(prev)
        const next = states[(idx + 1) % states.length]
        return next
      })
    }, 2800)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      clearInterval(interval)
    }
  }, [isControlled, states])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative h-[440px] w-[220px] overflow-hidden rounded-[2.25rem] border-[6px] border-background/80 bg-background shadow-float">
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-background/80" />
        <div className="relative h-full w-full">
          {states.map((s, idx) => {
            const active = s === current
            const prev = idx < currentIndex
            return (
              <div
                key={s}
                className={`landing-phone-state ${active ? 'is-active' : ''} ${prev ? 'is-prev' : ''}`}
                aria-hidden={!active}
              >
                <PhoneScreen state={s} />
              </div>
            )
          })}
        </div>
        {isControlled && (
          <div className="sr-only" role="region" aria-live="polite">
            {stateLabels[current]}
          </div>
        )}
      </div>
    </div>
  )
}

function PhoneScreen({ state }: { state: PhoneState }) {
  switch (state) {
    case 'order':
      return <OrderScreen />
    case 'preparing':
      return <PreparingScreen />
    case 'ready':
      return <ReadyScreen />
    case 'picked-up':
      return <PickedUpScreen />
  }
}

function OrderScreen() {
  return (
    <div className="flex h-full flex-col bg-background p-3 pt-5">
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Solo cafe</p>
        <p className="text-xs font-semibold text-foreground">Menu</p>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2.5 rounded-xl bg-surface p-2"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{formatMoney(item.cents)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
        <span className="text-[10px] font-medium text-muted-foreground">2 items</span>
        <span className="text-xs font-semibold text-foreground">{formatMoney(400)}</span>
      </div>
    </div>
  )
}

function PreparingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-surface p-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      <p className="mt-4 text-sm font-semibold text-foreground">Preparing</p>
      <p className="text-xs text-muted-foreground">The cafe is making it</p>
    </div>
  )
}

function ReadyScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-listo-bg p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-listo-muted">Ready</p>
      <p className="landing-font-display mt-1 text-5xl font-light tracking-tight text-listo-code">7E3D</p>
      <p className="mt-2 text-xs text-listo-muted">Show it at the counter</p>
    </div>
  )
}

function PickedUpScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
        <Icon name="check" className="h-6 w-6 text-success" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">Picked up</p>
      <p className="text-xs text-muted-foreground">Enjoy your coffee</p>
    </div>
  )
}
