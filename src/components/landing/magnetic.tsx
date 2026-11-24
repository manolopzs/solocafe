'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from './use-reduced-motion'

export function Magnetic({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const el = ref.current
    if (!el) return

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.15)
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.15)
      el.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`

      const stillMoving =
        Math.abs(currentRef.current.x - targetRef.current.x) > 0.01 ||
        Math.abs(currentRef.current.y - targetRef.current.y) > 0.01

      if (stillMoving) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        rafRef.current = null
      }
    }

    const schedule = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const max = 6
      const dist = Math.sqrt(dx * dx + dy * dy)
      const scale = dist > 0 ? Math.min(max, dist / 8) / dist : 0
      targetRef.current = { x: dx * scale, y: dy * scale }
      schedule()
    }

    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 }
      schedule()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  )
}
