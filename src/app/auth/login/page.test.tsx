/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import LoginPage from './page'
import { loginAction, requestLoginCodeAction, verifyLoginCodeAction } from '@/server/actions/auth'

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
jest.mock('@/server/actions/auth', () => ({
  loginAction: jest.fn(),
  requestLoginCodeAction: jest.fn(),
  verifyLoginCodeAction: jest.fn(),
}))

const mockRequest = requestLoginCodeAction as jest.MockedFunction<typeof requestLoginCodeAction>
const mockVerify = verifyLoginCodeAction as jest.MockedFunction<typeof verifyLoginCodeAction>
const mockPasswordLogin = loginAction as jest.MockedFunction<typeof loginAction>

describe('owner login page', () => {
  beforeEach(() => {
    search = ''
    mockRequest.mockReset()
    mockVerify.mockReset()
    mockPasswordLogin.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('confirms the password change after a reset', () => {
    search = 'reset=success'
    render(<LoginPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Password changed. Log in with the new one.')
  })

  it('shows the email code step by default without a password field', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByRole('button', { name: 'Send login code' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Forgot your password?' })).not.toBeInTheDocument()
  })

  it('moves to the code step and enables resend after thirty seconds', async () => {
    jest.useFakeTimers()
    mockRequest.mockResolvedValue({
      step: 'code',
      email: 'owner@example.com',
      message: 'If that email exists, we sent a 6-digit login code.',
      requestedAt: Date.now(),
    })
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send login code' }))
    })

    expect(screen.getByText(/Code sent to/)).toHaveTextContent('Code sent to owner@example.com')
    expect(screen.getByLabelText('6-digit code')).toHaveAttribute('autoComplete', 'one-time-code')
    expect(screen.getByLabelText('6-digit code')).toHaveAttribute('maxLength', '6')
    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled()

    act(() => {
      jest.advanceTimersByTime(30_000)
    })

    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled()
  })

  it('keeps the email in the input after a request error', async () => {
    mockRequest.mockResolvedValue({
      step: 'email',
      email: 'owner@example.com',
      error: "We couldn't send the code. Please try again.",
    })
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send login code' }))
    })

    expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com')
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't send the code. Please try again.")
  })

  it('keeps the email and code step after a verification error', async () => {
    mockRequest.mockResolvedValue({
      step: 'code',
      email: 'owner@example.com',
      requestedAt: Date.now(),
    })
    mockVerify.mockResolvedValue({
      step: 'code',
      email: 'owner@example.com',
      error: 'Invalid or expired code.',
    })
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send login code' }))
    })
    fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '000000' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    })

    expect(screen.getByText(/Code sent to/)).toHaveTextContent('Code sent to owner@example.com')
    expect(screen.getByLabelText('6-digit code')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired code.')
    expect(document.querySelector('input[name="email"]')).toHaveValue('owner@example.com')
  })

  it('switches to password login with the email and recovery link intact', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in with password instead' }))

    expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com')
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute('href', '/auth/forgot-password')
    expect(screen.getByRole('button', { name: 'Log in with email code' })).toBeInTheDocument()
  })
})
