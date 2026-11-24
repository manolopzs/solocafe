'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const customerTabs = new Set(['/inicio', '/account', '/account/orders'])
const orderPrefix = '/order/'

function tabIndex(pathname: string): number {
  if (pathname === '/inicio' || (pathname.split('/').filter(Boolean).length === 1 && !pathname.startsWith('/account') && !pathname.startsWith('/order'))) return 0
  if (pathname === '/account/orders' || pathname.startsWith(orderPrefix)) return 1
  if (pathname === '/account') return 2
  return -1
}

function isCustomerRoute(pathname: string): boolean {
  return customerTabs.has(pathname) || pathname.startsWith(orderPrefix) || (pathname.split('/').filter(Boolean).length === 1 && !pathname.startsWith('/dashboard') && !pathname.startsWith('/auth'))
}

export function TabTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [previousPathname, setPreviousPathname] = useState(pathname)
  const [direction, setDirection] = useState(0)
  const [animate, setAnimate] = useState(false)

  const isCustomer = isCustomerRoute(pathname)

  useEffect(() => {
    if (previousPathname === pathname) return

    const from = tabIndex(previousPathname)
    const to = tabIndex(pathname)
    const nextDirection = from >= 0 && to >= 0 ? to - from : 0
    const nextAnimate = isCustomerRoute(previousPathname) && isCustomerRoute(pathname)
    const raf = requestAnimationFrame(() => {
      setDirection(nextDirection)
      setAnimate(nextAnimate)
      setPreviousPathname(pathname)
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, previousPathname])

  if (!isCustomer) return <>{children}</>

  return (
    <div
      key={pathname}
      className={[
        animate && direction > 0 ? 'motion-safe:animate-tab-next' : '',
        animate && direction < 0 ? 'motion-safe:animate-tab-prev' : '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
