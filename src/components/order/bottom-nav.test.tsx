/** @jest-environment jsdom */
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BottomNav, isStorefrontPath } from './bottom-nav'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href, ...rest }: { children: ReactNode; href: string; 'aria-current'?: 'page' }) {
    return (
      <a href={href} aria-current={rest['aria-current']}>
        {children}
      </a>
    )
  },
}))

const usePathname = jest.requireMock('next/navigation').usePathname as jest.Mock<string, []>

describe('BottomNav', () => {
  it('renders nothing on /', () => {
    usePathname.mockReturnValue('/')
    const { container } = render(<BottomNav />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing on /contacto', () => {
    usePathname.mockReturnValue('/contacto')
    const { container } = render(<BottomNav />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with customer-bottom-nav on /explore', () => {
    usePathname.mockReturnValue('/explore')
    const { container } = render(<BottomNav />)
    const nav = container.querySelector('nav.customer-bottom-nav')
    expect(nav).toBeInTheDocument()
  })

  it('has three tabs, Home, Orders and Account, and none links to /explore', () => {
    usePathname.mockReturnValue('/account')
    const { container } = render(<BottomNav />)
    const links = Array.from(container.querySelectorAll('a'))
    expect(links.map((a) => a.textContent)).toEqual(['Home', 'Orders', 'Account'])
    expect(container).not.toHaveTextContent('Explore')
    expect(links.map((a) => a.getAttribute('href'))).not.toContain('/explore')
  })
})

const inicioHref = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Home')?.getAttribute('href')

describe('BottomNav Home', () => {
  it('opens /inicio when no shop has been visited, never the owner landing', () => {
    usePathname.mockReturnValue('/account')
    const { container } = render(<BottomNav />)
    expect(inicioHref(container)).toBe('/inicio')
  })

  it('marks only Home active on /inicio', () => {
    usePathname.mockReturnValue('/inicio')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Home'])
  })

  it('always opens /inicio, even after visiting a shop', () => {
    usePathname.mockReturnValue('/main')
    const { container } = render(<BottomNav />)
    expect(inicioHref(container)).toBe('/inicio')
  })

  it('marks Home active on a storefront', () => {
    usePathname.mockReturnValue('/main')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Home'])
  })

  it('marks no tab active on /explore, which nothing links to', () => {
    usePathname.mockReturnValue('/explore')
    const { container } = render(<BottomNav />)
    expect(container.querySelectorAll('a[aria-current="page"]')).toHaveLength(0)
  })

  it('marks only Orders active on /account/orders', () => {
    usePathname.mockReturnValue('/account/orders')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Orders'])
  })
})

describe('BottomNav look', () => {
  it('uses the euro receipt for Orders and a heavier stroke on the active tab', () => {
    usePathname.mockReturnValue('/account/orders')
    const { container } = render(<BottomNav />)
    const orders = Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Orders')!
    expect(orders.querySelector('svg')?.getAttribute('class')).toMatch(/lucide-receipt-euro/)
    expect(orders.querySelector('svg')?.getAttribute('stroke-width')).toBe('2.25')
    const account = Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Account')!
    expect(account.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.75')
  })
})

describe('BottomNav Orders', () => {
  it('lights Orders on an order tracker', () => {
    usePathname.mockReturnValue('/order/abc')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Orders'])
  })
})

describe('isStorefrontPath', () => {
  it('is a single segment that is not another app route', () => {
    expect(isStorefrontPath('/solo-cafe')).toBe(true)
    expect(isStorefrontPath('/explore')).toBe(false)
    expect(isStorefrontPath('/inicio')).toBe(false)
    expect(isStorefrontPath('/account')).toBe(false)
    expect(isStorefrontPath('/order/abc')).toBe(false)
    expect(isStorefrontPath('/')).toBe(false)
  })
})
