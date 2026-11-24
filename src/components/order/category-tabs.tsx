'use client'

import { useEffect, useRef } from 'react'
import { storefrontCategoryName } from '@/lib/storefront-menu'
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

  if (categories.length <= 1) return null

  return (
    <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="phone-col">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-5 py-1 no-scrollbar touch-pan-y">
          {categories.map((category) => {
            const active = activeId === category.id
            return (
              <button
                key={category.id}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(category.id)}
                aria-current={active ? 'true' : undefined}
                className="flex h-11 shrink-0 snap-start items-center rounded-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={[
                    'flex h-9 items-center rounded-full px-4 text-body-sm font-semibold transition-colors',
                    active ? 'bg-foreground text-background' : 'bg-pill text-on-pill',
                  ].join(' ')}
                >
                  {storefrontCategoryName(category.name)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
