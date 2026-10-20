'use client'

import { useEffect, useRef, useState } from 'react'

export function useCategorySpy(categoryIds: string[]) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  const [pickedId, setPickedId] = useState<string | null>(null)
  const idsKey = categoryIds.join('|')
  const activeId = pickedId && categoryIds.includes(pickedId) ? pickedId : (categoryIds[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY + 150
      let current = categoryIds[0] ?? ''
      for (const id of categoryIds) {
        const el = refs.current[id]
        if (el && el.offsetTop <= scrollPos) current = id
      }
      setPickedId(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [idsKey, categoryIds])

  const scrollTo = (id: string) => {
    setPickedId(id)
    const el = refs.current[id]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 120
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    refs.current[id] = el
  }

  return { activeId, scrollTo, setRef }
}
