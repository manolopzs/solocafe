'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { formatMoney } from '@/lib/ordering'
import { PreparingScreen, ReadyScreen } from './phone-screens'
import { useReducedMotion } from './use-reduced-motion'

type Phase = 'menu' | 'add' | 'order' | 'preparing' | 'ready' | 'notification' | 'dismiss'

const PHASES: Phase[] = ['menu', 'add', 'order', 'preparing', 'ready', 'notification', 'dismiss']

/** Which screen each phase shows: 0 menu, 1 preparing, 2 ready. */
const SCREEN_OF: Record<Phase, number> = {
  menu: 0,
  add: 0,
  order: 0,
  preparing: 1,
  ready: 2,
  notification: 2,
  dismiss: 2,
}

const menuItems = [
  { name: 'Latte', cents: 200, image: '/menu/latte.jpg' },
  { name: 'Cortado', cents: 200, image: '/menu/cortado.jpg' },
  { name: 'Café con leche', cents: 300, image: '/menu/cafe-con-leche.jpg' },
]

const PHASE_DURATION_MS: Record<Phase, number> = {
  menu: 2000,
  add: 900,
  order: 900,
  preparing: 3500,
  ready: 2400,
  notification: 2500,
  // The notification slides away before the loop rewinds to the menu.
  dismiss: 700,
}

export function DeviceFrame() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('menu')
  const [loop, setLoop] = useState(0)
  const [visible, setVisible] = useState(true)
  const frameRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) return
    const frame = frameRef.current
    if (!frame) return

    const visibleRef = { current: true }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        setVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    observer.observe(frame)

    const onVisibility = () => {
      if (document.hidden) {
        visibleRef.current = false
        setVisible(false)
      } else {
        const rect = frame.getBoundingClientRect()
        const isVisible =
          rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0
        visibleRef.current = isVisible
        setVisible(isVisible)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // One step at a time; while the phone is off-screen or the tab is hidden, wait without advancing.
    let index = 0
    let timer = 0
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      if (!visibleRef.current) {
        timer = window.setTimeout(tick, 400)
        return
      }
      index = (index + 1) % PHASES.length
      if (index === 0) setLoop((n) => n + 1)
      setPhase(PHASES[index])
      timer = window.setTimeout(tick, PHASE_DURATION_MS[PHASES[index]])
    }
    timer = window.setTimeout(tick, PHASE_DURATION_MS[PHASES[0]])

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    let ticking = false

    const update = () => {
      ticking = false
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0
      const y = -progress * 30
      wrapper.style.transform = `translateY(${y}px)`
    }

    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  if (reduced) {
    return (
      <div
        className="relative"
        role="img"
        aria-label="Solo Café Ready screen with pickup code 7E3D and the notification Your latte is ready"
      >
        <div className="relative rotate-[-6deg] sm:rotate-[-8deg]">
          <PhoneFrame>
            <ReadyScreen showNotification animateCode={false} />
          </PhoneFrame>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      data-visible={visible}
      role="img"
      aria-label="Preview of ordering a latte in Solo Café: add it, order, preparing, then Ready with pickup code 7E3D"
      className="relative"
    >
      <div className="landing-hero-float">
        <div
          ref={frameRef}
          className="relative rotate-[-6deg] sm:rotate-[-8deg]"
        >
          <PhoneFrame>
            <ScreenStack phase={phase} loop={loop} />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="relative h-[470px] w-[230px] overflow-hidden rounded-[2.75rem] border-[7px] border-foreground bg-foreground p-[7px] shadow-landing-phone lg:h-[612px] lg:w-[300px] lg:rounded-[3rem] lg:border-[8px] lg:p-[8px]">
        <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] bg-background lg:rounded-[2.5rem]">
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[2.75rem] lg:rounded-[3rem]">
          <div className="absolute left-1/2 top-[12px] z-20 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black/90 lg:top-[14px] lg:h-[26px] lg:w-[92px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-[2.75rem] bg-gradient-to-br from-white/10 via-transparent to-transparent lg:rounded-[3rem]"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

function ScreenStack({ phase, loop }: { phase: Phase; loop: number }) {
  const screen = SCREEN_OF[phase]
  return (
    <div className="relative h-full w-full bg-background">
      <ScreenLayer index={0} screen={screen}>
        {/* Remounted each loop so the rows rise in again after the rewind. */}
        <MenuScreen key={loop} adding={phase === 'add'} ordering={phase === 'order'} stagger={loop > 0} />
      </ScreenLayer>
      <ScreenLayer index={1} screen={screen}>
        <PreparingScreen animateBar={phase === 'preparing'} />
      </ScreenLayer>
      <ScreenLayer index={2} screen={screen}>
        <ReadyScreen showNotification={phase === 'notification'} animateCode={phase === 'ready'} />
      </ScreenLayer>
    </div>
  )
}

/**
 * Out, then in: the leaving screen fades and slides away in 200ms, and the next one only starts after that,
 * so two screens are never opaque at once. Screens before the current one wait on the left and later ones
 * on the right, so the rewind from Ready to the menu slides the other way.
 */
function ScreenLayer({ index, screen, children }: { index: number; screen: number; children: React.ReactNode }) {
  const active = index === screen
  const position = active
    ? 'opacity-100 translate-x-0 duration-[420ms] delay-[220ms] ease-out'
    : `pointer-events-none opacity-0 duration-200 ease-in ${index < screen ? '-translate-x-6' : 'translate-x-6'}`
  return (
    <div className={`absolute inset-0 transition-[opacity,transform] ${position}`} aria-hidden={!active}>
      {children}
    </div>
  )
}

function MenuScreen({ adding, ordering, stagger }: { adding?: boolean; ordering?: boolean; stagger?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-background p-3 pt-6 lg:p-4 lg:pt-7">
      <div className="mb-3 lg:mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">
          Solo cafe
        </p>
        <p className="text-xs font-semibold text-foreground lg:text-sm">Menu</p>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden lg:space-y-3">
        {menuItems.map((item, index) => (
          <MenuItemRow
            key={item.name}
            item={item}
            pressed={adding && index === 0}
            className={stagger ? `landing-rise landing-rise-${index + 1}` : ''}
          />
        ))}
      </div>
      <div
        className={`mt-2 flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 transition-transform duration-500 ease-out lg:mt-3 lg:px-4 lg:py-3 ${
          adding || ordering ? 'translate-y-0' : 'translate-y-[120%]'
        }`}
      >
        <span className="text-[10px] font-medium text-muted-foreground lg:text-xs">1 item</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground lg:text-sm">{formatMoney(200)}</span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold lg:px-4 lg:py-1.5 lg:text-xs ${
              ordering ? 'bg-foreground/80 text-background scale-95' : 'bg-foreground text-background'
            }`}
          >
            Order
          </span>
        </div>
      </div>
    </div>
  )
}

function MenuItemRow({
  item,
  pressed,
  className = '',
}: {
  item: (typeof menuItems)[number]
  pressed?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl bg-surface p-2 lg:gap-3 lg:p-3 ${className}`}>
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg lg:h-14 lg:w-14">
        <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight text-foreground lg:text-sm">{item.name}</p>
        <p className="text-[10px] text-muted-foreground lg:text-xs">{formatMoney(item.cents)}</p>
      </div>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-150 lg:h-8 lg:w-8 ${
          pressed ? 'scale-90' : 'scale-100'
        }`}
      >
        <span className="text-sm leading-none lg:text-base">+</span>
      </span>
    </div>
  )
}
