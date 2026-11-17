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
        state={{ error: 'Ya existe una cuenta con este email.', code: 'email_taken' }}
        loginHref={loginHref}
        recoverHref="/auth/forgot-password"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe una cuenta con este email.')
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', loginHref)
    expect(screen.getByRole('link', { name: 'Recuperar contraseña' })).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('shows only the message for other errors', () => {
    render(
      <SignupError
        state={{ error: 'No hemos podido completar el registro. Inténtalo de nuevo.' }}
        loginHref="/auth/login"
        recoverHref="/auth/forgot-password"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido completar el registro. Inténtalo de nuevo.')
    expect(screen.queryByRole('link')).toBeNull()
  })
})
