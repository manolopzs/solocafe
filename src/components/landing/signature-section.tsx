'use client'

import { useEffect, useRef, useState } from 'react'
import { PhoneFrame } from './device-frame'
import { ReceivedScreen, PreparingScreen, ReadyScreen, PickedUpScreen } from './phone-screens'
import { useReducedMotion } from './use-reduced-motion'

const steps = [
  {
    key: 'received',
    label: 'Ordered',
    title: 'Order sent',
    description: 'The cafe has your order and a pickup time is reserved for you.',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    title: 'Preparing',
    description: 'The barista starts making it and the progress bar keeps you updated.',
  },
  {
    key: 'ready',
    label: 'Ready',
    title: 'Ready',
    description: 'Your pickup code appears. Show it at the counter and pay there.',
  },
  {
    key: 'picked-up',
    label: 'Picked up',
    title: 'Picked up',
    description: 'Grab your coffee and skip the queue. Ordering again is one tap away.',
  },
] as const

type StepKey = (typeof steps)[number]['key']

export function SignatureSection() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState<StepKey>('received')
  const sectionRef = useRef<HTMLElement>(null)
  const stepRefs = useRef<Record<StepKey, HTMLButtonElement | null>>({
    received: null,
    preparing: null,
    ready: null,
    'picked-up': null,
  })

  // Picks the step crossing a thin line: the viewport centre on desktop, the area below the sticky phone on mobile.
  // Runs under reduced motion too; only the transitions are dropped there.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observers: IntersectionObserver[] = []

    steps.forEach((step) => {
      const el = stepRefs.current[step.key]
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(step.key)
          }
        },
        {
          threshold: 0,
          rootMargin: window.matchMedia('(min-width: 1024px)').matches
            ? '-49% 0px -49% 0px'
            : '-70% 0px -28% 0px',
        }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollToStep = (key: StepKey) => {
    const el = stepRefs.current[key]
    if (el) {
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
      setActive(key)
    }
  }

  const activeIndex = steps.findIndex((s) => s.key === active)

  return (
    <section
      ref={sectionRef}
      className="landing-grain relative bg-foreground px-6 py-20 text-background sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-1 lg:py-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-background/60">
              Follow an order
            </p>
            <h2 className="mt-3 landing-font-display text-3xl font-normal tracking-tight text-background sm:text-4xl">
              From ordered to picked up
            </h2>
            <p className="mt-4 max-w-md text-lg text-background/70">
              A preview of what a customer sees after ordering. Scroll to walk through each step.
            </p>
            <div className="sticky top-20 z-10 -mx-6 mt-8 flex h-[370px] justify-center bg-gradient-to-b from-foreground from-[88%] to-transparent pt-4 lg:hidden">
              <div className="origin-top scale-[0.7]">
                <PhoneStage active={active} activeIndex={activeIndex} reduced={reduced} />
              </div>
            </div>
            <div className="mt-4 space-y-0 lg:mt-14">
              {steps.map((step, index) => {
                const isActive = step.key === active
                return (
                  <button
                    key={step.key}
                    ref={(el) => {
                      stepRefs.current[step.key] = el
                    }}
                    type="button"
                    onClick={() => scrollToStep(step.key)}
                    className={`group flex h-[45vh] w-full items-center gap-4 text-left transition-opacity duration-300 lg:h-[70vh] ${
                      isActive ? 'opacity-100' : 'opacity-75'
                    }`}
                  >
                    <span
                      className={`landing-font-display w-10 shrink-0 text-2xl font-light tabular-nums transition-colors duration-300 ${
                        isActive ? 'text-background' : 'text-background/55'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`text-xl font-semibold transition-colors duration-300 ${
                          isActive ? 'text-background' : 'text-background/80'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-1 max-w-sm text-base text-background/75">
                        {step.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden lg:order-2 lg:block">
            <div className="sticky top-28 flex h-[calc(100vh-14rem)] min-h-[640px] items-center justify-center">
              <PhoneStage active={active} activeIndex={activeIndex} reduced={reduced} />
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

function PhoneStage({
  active,
  activeIndex,
  reduced,
}: {
  active: StepKey
  activeIndex: number
  reduced: boolean
}) {
  return (
    <div className="relative rotate-[-8deg]">
      {steps.map((step, index) => {
        const isActive = step.key === active
        const isPrev = index < activeIndex
        return (
          <div
            key={step.key}
            className={`${index === 0 ? 'relative' : 'absolute inset-0'} ${
              reduced ? '' : 'transition-[opacity,translate] ease-out'
            } ${
              isActive
                ? 'opacity-100 translate-x-0 duration-[420ms] delay-[220ms]'
                : isPrev
                  ? 'pointer-events-none opacity-0 -translate-x-4 duration-200'
                  : 'pointer-events-none opacity-0 translate-x-4 duration-200'
            }`}
            aria-hidden={!isActive}
          >
            <PhoneFrame>
              <StepScreen step={step.key} />
            </PhoneFrame>
          </div>
        )
      })}
      {!reduced && (
        <div
          className="pointer-events-none absolute -inset-8 -z-10 hidden rounded-full bg-[radial-gradient(circle_at_center,var(--surface-elevated)_0%,transparent_70%)] opacity-30 blur-2xl lg:block"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function StepScreen({ step }: { step: StepKey }) {
  switch (step) {
    case 'received':
      return <ReceivedScreen />
    case 'preparing':
      return <PreparingScreen />
    case 'ready':
      return <ReadyScreen animateCode />
    case 'picked-up':
      return <PickedUpScreen />
  }
}
