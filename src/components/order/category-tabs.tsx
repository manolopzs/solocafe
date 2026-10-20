'use client'

import { useEffect, useRef } from 'react'
import type { MenuCategory } from '@/types'

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: MenuCategory[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const node = activeRef.current
    const scroller = node?.parentElement
    if (!node || !scroller) return
    const left = node.offsetLeft - scroller.clientWidth / 2 + node.clientWidth / 2
    scroller.scrollTo({ left, behavior: 'smooth' })
  }, [activeId])

  if (categories.length === 0) return null

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth px-3 no-scrollbar touch-pan-y sm:px-4">
          {categories.map((category) => {
            const active = activeId === category.id
            return (
              <button
                key={category.id}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(category.id)}
                className={[
                  'snap-start shrink-0 border-b-2 px-3 py-3 text-sm transition-colors touch-manipulation',
                  active
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
