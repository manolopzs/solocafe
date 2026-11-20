'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './use-reduced-motion'

const tickets = [
  { id: '1', code: '7E3D', items: ['1 x Latte'], time: '09:35' },
  { id: '2', code: 'A41C', items: ['2 x Cortado'], time: '09:36' },
  { id: '3', code: '0B92', items: ['1 x Café con leche'], time: '09:37' },
  { id: '4', code: '5F17', items: ['1 x Latte', '1 x Cortado'], time: '09:38' },
  { id: '5', code: '2D84', items: ['2 x Latte'], time: '09:39' },
  { id: '6', code: 'C3A0', items: ['1 x Cortado'], time: '09:40' },
  { id: '7', code: '91FB', items: ['1 x Café con leche', '1 x Latte'], time: '09:41' },
]

/** Ticket offsets from the newest one: ready holds 1, preparing 2, new 2. Each tick moves every ticket one slot along. */
const slots = { ready: [4], preparing: [3, 2], new: [1, 0] } as const

const columns = [
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
] as const

export function KdsTablet() {
  const reduced = useReducedMotion()
  const [pointer, setPointer] = useState(0)
  const [visible, setVisible] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const frame = frameRef.current
    if (!frame) return

    const visibleRef = { current: false }

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

    const id = window.setInterval(() => {
      if (!visibleRef.current) return
      setPointer((p) => (p + 1) % tickets.length)
    }, 3000)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(id)
    }
  }, [reduced, setPointer, setVisible])

  const ticketAt = (offset: number) => tickets[(pointer + tickets.length - offset) % tickets.length]

  return (
    <div ref={frameRef} data-visible={visible} className="relative mx-auto w-full max-w-[560px]">
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[1.5rem] sm:aspect-[4/3] border-[10px] border-foreground bg-foreground p-[10px] shadow-landing-tablet lg:rounded-[2rem] lg:border-[12px] lg:p-[12px]">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1rem] bg-background lg:rounded-[1.25rem]">
          <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 lg:px-4 lg:py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground lg:text-sm">Solo cafe</span>
              <span className="landing-live-dot relative flex h-2 w-2 rounded-full bg-success text-success" />
            </div>
            <span className="text-xs font-medium text-muted-foreground lg:text-sm">09:40</span>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-1.5 p-2 lg:gap-2 lg:p-3">
            {columns.map((column) => (
              <div key={column.key} className="flex flex-col gap-1.5 lg:gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">
                    {column.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground lg:text-xs">{slots[column.key].length}</span>
                </div>
                <div className="relative flex flex-1 flex-col gap-1.5 rounded-lg bg-surface/60 p-1.5 lg:gap-2 lg:rounded-xl lg:p-2">
                  {slots[column.key].map((offset) => {
                    const ticket = ticketAt(offset)
                    return <TicketCard key={ticket.id} ticket={ticket} ready={column.key === 'ready'} animate={!reduced} />
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketCard({ ticket, ready, animate }: { ticket: (typeof tickets)[number]; ready: boolean; animate: boolean }) {
  return (
    <div
      className={`rounded-lg p-2 shadow-sm lg:rounded-xl lg:p-2.5 ${ready ? 'bg-listo-card ring-1 ring-sky' : 'bg-surface-elevated'} ${
        animate ? 'animate-kds-ticket-in' : ''
      }`}
    >
      <div className="flex items-baseline justify-between gap-1">
        <p className="landing-font-display text-base font-medium leading-none tracking-tight text-foreground lg:text-xl">
          {ticket.code}
        </p>
        <p className="text-[9px] text-muted-foreground lg:text-[11px]">{ticket.time}</p>
      </div>
      <ul className="mt-1.5 space-y-0.5 lg:mt-2">
        {ticket.items.map((item) => (
          <li key={item} className="text-[10px] text-muted-foreground lg:text-xs">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
