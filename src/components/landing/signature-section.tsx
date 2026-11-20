'use client'

import { useState } from 'react'
import { Reveal } from './reveal'
import { PhoneMock, type PhoneState } from './phone-mock'

const states: { key: PhoneState; label: string }[] = [
  { key: 'order', label: 'Ordered' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked-up', label: 'Picked up' },
]

export function SignatureSection() {
  const [current, setCurrent] = useState<PhoneState>('order')

  return (
    <section className="bg-foreground px-6 py-20 text-background sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-background/60">Tap through an order</p>
              <h2 className="mt-3 landing-font-display text-3xl font-normal tracking-tight text-background sm:text-4xl">
                From ordered to picked up
              </h2>
              <p className="mt-4 max-w-md text-lg text-background/70">
                A simplified preview of what a customer sees after ordering. Tap a step to see the screen.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <div
                role="tablist"
                aria-label="Order states"
                className="mt-8 flex flex-wrap gap-2"
              >
                {states.map((state) => (
                  <button
                    key={state.key}
                    role="tab"
                    type="button"
                    aria-selected={current === state.key}
                    aria-controls="phone-panel"
                    onClick={() => setCurrent(state.key)}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      current === state.key
                        ? 'bg-background text-foreground'
                        : 'bg-background/10 text-background/80 hover:bg-background/20 hover:text-background',
                    ].join(' ')}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={1}>
            <div className="flex justify-center lg:justify-end">
              <div id="phone-panel" role="tabpanel" aria-live="polite">
                <PhoneMock mode="controlled" state={current} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
