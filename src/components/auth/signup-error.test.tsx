/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SignupError } from './signup-error'

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

describe('SignupError', () => {
  it.each([
    ['owner', '/auth/login'],
    ['customer', '/account/login'],
  ])('shows login and recovery links for a duplicate email (%s)', (_flow, loginHref) => {
    render(
      <SignupError
        state={{ error: 'An account with this email already exists.', code: 'email_taken' }}
        loginHref={loginHref}
        recoverHref="/auth/forgot-password"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('An account with this email already exists.')
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', loginHref)
    expect(screen.getByRole('link', { name: 'Recover password' })).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('shows only the message for other errors', () => {
    render(
      <SignupError
        state={{ error: "We couldn't complete your sign up. Please try again." }}
        loginHref="/auth/login"
        recoverHref="/auth/forgot-password"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't complete your sign up. Please try again.")
    expect(screen.queryByRole('link')).toBeNull()
  })
})
