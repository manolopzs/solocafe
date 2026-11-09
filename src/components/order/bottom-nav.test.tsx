/** @jest-environment jsdom */
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
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
})
