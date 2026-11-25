/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CheckoutSheet } from './checkout-sheet'
import type { Shop } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => <div>{children}{footer}</div>,
}))

jest.mock('@/server/actions/customers', () => ({ updateCustomerProfile: jest.fn() }))

const shop = { id: 'shop-1', slug: 'main', locale: 'en-GB', ordering: { asap_available: true } } as Shop
const lines = [{ key: 'line-1', name: 'Cortado', detail: '', quantity: 1, lineTotal: '2,00 €', unavailable: false }]

test.each([
  ['en-GB', '+44'],
  ['pt', '+351'],
])('shows the %s dial prefix as an adornment with helper text below the label', (locale, prefix) => {
  render(
    <CheckoutSheet
      open
      onClose={jest.fn()}
      shop={{ ...shop, locale }}
      customer={null}
      lines={lines}
      total="2,00 €"
      blockedReason={null}
      loading={false}
      error={null}
      onQuantity={jest.fn()}
      onRemove={jest.fn()}
      onSubmit={jest.fn()}
    />,
  )

  const input = screen.getByLabelText('Phone')
  const helper = screen.getByText("So we can tell you when it's ready")
  expect(screen.getByText(prefix)).toHaveAttribute('aria-hidden', 'true')
  expect(input).toHaveAttribute('placeholder', '612 345 678')
  expect(input).toHaveAttribute('aria-describedby', 'customerPhone-help')
  expect(input).toHaveClass('pl-16')
  expect(input.parentElement?.previousElementSibling).toBe(helper)
  expect(screen.queryByPlaceholderText(/So we can tell you/)).not.toBeInTheDocument()
})
