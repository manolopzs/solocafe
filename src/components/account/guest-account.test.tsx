/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { GuestAccount } from './guest-account'

describe('GuestAccount', () => {
  it('explains stamps with an empty card and lists two reasons to sign up', () => {
    render(<GuestAccount />)
    expect(screen.getByRole('heading', { level: 1, name: 'Tu cuenta' })).toBeInTheDocument()
    expect(screen.getByText('Puedes pedir sin cuenta. Con una, pides más rápido.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Tu nombre y teléfono, guardados')).toBeInTheDocument()
    expect(screen.getByText('Repite tu pedido en un toque')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tarjeta de sellos' })).toBeInTheDocument()
    expect(screen.getByText('Cada pedido pagado suma un sello en esa cafetería.')).toBeInTheDocument()
    // No invented count: each shop sets its own number of stamps.
    expect(screen.queryByText(/de 8/)).not.toBeInTheDocument()
  })

  it('keeps the existing sign-up and sign-in routes', () => {
    render(<GuestAccount />)
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/account/signup')
    expect(screen.getByRole('link', { name: 'Ya tengo cuenta · Entrar' })).toHaveAttribute('href', '/account/login')
  })
})
