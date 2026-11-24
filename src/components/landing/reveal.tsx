'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: 1 | 2 | 3
}

export function Reveal({ children, className = '', delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!document.documentElement.hasAttribute('data-landing-animate')) {
      document.documentElement.setAttribute('data-landing-animate', '')
    }

    // Reduced motion: the CSS never hides .landing-reveal, so nothing to observe.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const delayClass = delay ? `landing-reveal-delay-${delay}` : ''

  return (
    <div
      ref={ref}
      className={`landing-reveal ${delayClass} ${visible ? 'landing-reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
