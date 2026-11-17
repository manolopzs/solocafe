/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import LoginPage from './page'

let search = ''
jest.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(search) }))
jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))
jest.mock('@/server/actions/auth', () => ({ loginAction: jest.fn() }))

describe('owner login page', () => {
  it('confirms the password change after a reset', () => {
    search = 'reset=success'
    render(<LoginPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Contraseña cambiada. Entra con la nueva.')
  })

  it('shows no notice otherwise', () => {
    search = ''
    render(<LoginPage />)
    expect(screen.queryByText('Contraseña cambiada. Entra con la nueva.')).toBeNull()
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toHaveAttribute('href', '/auth/forgot-password')
  })
})
