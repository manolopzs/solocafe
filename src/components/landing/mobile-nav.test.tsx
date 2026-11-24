/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { MobileNav } from './mobile-nav'

describe('MobileNav', () => {
  it('opens a portal with all six menu entries', () => {
    const { container } = render(<MobileNav />)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog.parentElement).toBe(document.body)
    expect(container).not.toContainElement(dialog)

    for (const label of ['How it works', 'Pricing', 'FAQ', 'Get the app', 'Customer sign in', 'For cafes']) {
      expect(screen.getByRole('link', { name: label })).toBeVisible()
    }
    expect(screen.getByRole('link', { name: 'Get the app' })).toHaveAttribute('href', '#app')
  })
})
