/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import ForgotPasswordPage from './forgot-password/page'
import ResetPasswordPage from './reset-password/page'

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
jest.mock('@/server/actions/auth', () => ({ forgotPasswordAction: jest.fn(), resetPasswordAction: jest.fn() }))

const back = () => screen.getByRole('link', { name: 'Back to log in' })
const fromField = (container: HTMLElement) => container.querySelector('input[name="from"]')

describe.each([
  ['forgot password', ForgotPasswordPage, ''],
  ['reset password', ResetPasswordPage, 'token=tok&'],
])('%s page', (_name, Page, prefix) => {
  it('sends customers back to the customer login', () => {
    search = `${prefix}from=account`
    const { container } = render(<Page />)
    expect(back()).toHaveAttribute('href', '/account/login')
    expect(fromField(container)).toHaveAttribute('value', 'account')
  })

  it('defaults to the owner login', () => {
    search = prefix
    const { container } = render(<Page />)
    expect(back()).toHaveAttribute('href', '/auth/login')
    expect(fromField(container)).toBeNull()
  })
})
