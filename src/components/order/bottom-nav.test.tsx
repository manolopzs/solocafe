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

  it('has three tabs, Inicio, Pedidos and Cuenta, and none links to /explore', () => {
    usePathname.mockReturnValue('/account')
    const { container } = render(<BottomNav />)
    const links = Array.from(container.querySelectorAll('a'))
    expect(links.map((a) => a.textContent)).toEqual(['Inicio', 'Pedidos', 'Cuenta'])
    expect(container).not.toHaveTextContent('Explorar')
    expect(links.map((a) => a.getAttribute('href'))).not.toContain('/explore')
  })
})

const inicioHref = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Inicio')?.getAttribute('href')

describe('BottomNav Inicio', () => {
  it('opens /inicio when no shop has been visited, never the owner landing', () => {
    usePathname.mockReturnValue('/account')
    const { container } = render(<BottomNav />)
    expect(inicioHref(container)).toBe('/inicio')
  })

  it('marks only Inicio active on /inicio', () => {
    usePathname.mockReturnValue('/inicio')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Inicio'])
  })

  it('always opens /inicio, even after visiting a shop', () => {
    usePathname.mockReturnValue('/main')
    const { container } = render(<BottomNav />)
    expect(inicioHref(container)).toBe('/inicio')
  })

  it('marks Inicio active on a storefront', () => {
    usePathname.mockReturnValue('/main')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Inicio'])
  })

  it('marks no tab active on /explore, which nothing links to', () => {
    usePathname.mockReturnValue('/explore')
    const { container } = render(<BottomNav />)
    expect(container.querySelectorAll('a[aria-current="page"]')).toHaveLength(0)
  })

  it('marks only Pedidos active on /account/orders', () => {
    usePathname.mockReturnValue('/account/orders')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Pedidos'])
  })
})

describe('BottomNav look', () => {
  it('uses the euro receipt for Pedidos and a heavier stroke on the active tab', () => {
    usePathname.mockReturnValue('/account/orders')
    const { container } = render(<BottomNav />)
    const pedidos = Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Pedidos')!
    expect(pedidos.querySelector('svg')?.getAttribute('class')).toMatch(/lucide-receipt-euro/)
    expect(pedidos.querySelector('svg')?.getAttribute('stroke-width')).toBe('2.25')
    const cuenta = Array.from(container.querySelectorAll('a')).find((a) => a.textContent === 'Cuenta')!
    expect(cuenta.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.75')
  })
})

describe('BottomNav Pedidos', () => {
  it('lights Pedidos on an order tracker', () => {
    usePathname.mockReturnValue('/order/abc')
    const { container } = render(<BottomNav />)
    const active = Array.from(container.querySelectorAll('a[aria-current="page"]')).map((a) => a.textContent)
    expect(active).toEqual(['Pedidos'])
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
