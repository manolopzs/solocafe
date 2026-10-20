'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function ExploreGeolocation({ hasOrigin }: { hasOrigin: boolean }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hasOrigin) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    let active = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return
        const params = new URLSearchParams()
        params.set('lat', position.coords.latitude.toFixed(6))
        params.set('lng', position.coords.longitude.toFixed(6))
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      },
      () => undefined,
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8_000 },
    )

    return () => {
      active = false
    }
  }, [hasOrigin, pathname, router])

  return null
}
