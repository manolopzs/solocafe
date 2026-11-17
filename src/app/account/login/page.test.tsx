/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import AccountLoginPage from './page'

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
jest.mock('@/server/actions/account-auth', () => ({ accountLoginAction: jest.fn() }))

describe('customer login page', () => {
  it('confirms the password change after a reset', () => {
    search = 'reset=success'
    render(<AccountLoginPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Contraseña cambiada. Entra con la nueva.')
  })

  it('links to password recovery for customers', () => {
    search = ''
    render(<AccountLoginPage />)
    expect(screen.queryByText('Contraseña cambiada. Entra con la nueva.')).toBeNull()
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toHaveAttribute(
      'href',
      '/auth/forgot-password?from=account',
    )
  })
})
