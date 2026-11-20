/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { GuestAccount } from './guest-account'

describe('GuestAccount', () => {
  it('explains stamps with an empty card and lists two reasons to sign up', () => {
    render(<GuestAccount />)
    expect(screen.getByRole('heading', { level: 1, name: 'Your account' })).toBeInTheDocument()
    expect(screen.getByText('You can order without an account. With one, you order faster.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Your name and phone, saved')).toBeInTheDocument()
    expect(screen.getByText('Reorder in one tap')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stamp card' })).toBeInTheDocument()
    expect(screen.getByText('Every paid order earns a stamp at that coffee shop.')).toBeInTheDocument()
    // No invented count: each shop sets its own number of stamps.
    expect(screen.queryByText(/de 8/)).not.toBeInTheDocument()
  })

  it('keeps the existing sign-up and sign-in routes', () => {
    render(<GuestAccount />)
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/account/signup')
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/account/login')
  })
})
