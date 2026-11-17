/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { NavLink } from './nav-link'

const mockPathname = jest.fn()
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname() }))

describe('NavLink', () => {
  it('marks Resumen active only on the exact dashboard path', () => {
    mockPathname.mockReturnValue('/dashboard/shop-1/menu')
    render(<NavLink href="/dashboard/shop-1" label="Resumen" icon="store" exact />)
    expect(screen.getByRole('link', { name: 'Resumen' }).className).toContain('border-transparent')
  })

  it('marks a section active on its nested routes with a 2px underline', () => {
    mockPathname.mockReturnValue('/dashboard/shop-1/menu/edit')
    render(<NavLink href="/dashboard/shop-1/menu" label="Menú" icon="receipt" />)
    const link = screen.getByRole('link', { name: 'Menú' })
    expect(link.className).toContain('border-foreground')
    expect(link.className).toContain('h-11')
  })
})
