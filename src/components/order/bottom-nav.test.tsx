/** @jest-environment jsdom */
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BottomNav, customerHomeHref } from './bottom-nav'
import { rememberShop } from '@/lib/recent-shops'

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
  // Order matters: recent-shops keeps one in-memory snapshot per module.
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

  it('opens the last storefront visited on this phone', () => {
    rememberShop({ slug: 'otra', name: 'Otra' })
    rememberShop({ slug: 'main', name: 'Solo cafe' })
    usePathname.mockReturnValue('/account')
    const { container } = render(<BottomNav />)
    expect(inicioHref(container)).toBe('/main')
    expect(window.localStorage.getItem('solo-cafe.recent-shops')).toContain('"main"')
  })

  it('marks Inicio active on that storefront', () => {
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

describe('customerHomeHref', () => {
  it('falls back to /inicio and never returns /', () => {
    expect(customerHomeHref([])).toBe('/inicio')
    expect(customerHomeHref([{ slug: 'main', name: 'Solo cafe' }])).toBe('/main')
  })

  it('skips the demo shop, which has no /<slug> storefront', () => {
    expect(customerHomeHref([{ slug: 'cafeteria-demo', name: 'Café de la Esquina' }])).toBe('/inicio')
    expect(
      customerHomeHref([
        { slug: 'cafeteria-demo', name: 'Café de la Esquina' },
        { slug: 'main', name: 'Solo cafe' },
      ]),
    ).toBe('/main')
  })
})
