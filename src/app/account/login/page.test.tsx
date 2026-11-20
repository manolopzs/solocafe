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
    expect(screen.getByRole('status')).toHaveTextContent('Password changed. Log in with the new one.')
  })

  it('links to password recovery for customers', () => {
    search = ''
    render(<AccountLoginPage />)
    expect(screen.queryByText('Password changed. Log in with the new one.')).toBeNull()
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute(
      'href',
      '/auth/forgot-password?from=account',
    )
  })
})
