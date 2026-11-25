/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { OrdersList } from './orders-list'
import type { Order } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
    return <a href={href} className={className}>{children}</a>
  },
}))

const active = {
  id: '11111111-1111-4111-8111-1111111111bc',
  shop_id: 'shop-1',
  shop: { id: 'shop-1', name: 'Solo cafe', slug: 'main', locale: 'es' },
  status: 'preparing',
  total_cents: 200,
  currency: 'EUR',
  created_at: '2026-11-16T09:30:00Z',
} as unknown as Order

const past = {
  ...active,
  id: '22222222-2222-4222-8222-2222222222aa',
  status: 'picked_up',
  created_at: '2026-11-15T09:00:00Z',
} as unknown as Order

const older = {
  ...past,
  id: '33333333-3333-4333-8333-3333333333cc',
  shop: { ...active.shop, name: 'Older cafe' },
  created_at: '2026-11-11T09:00:00Z',
} as unknown as Order

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-16T12:00:00Z'))
})

afterEach(() => jest.useRealTimers())

test('uses the account-style header and concise active and past row metadata', () => {
  render(<OrdersList orders={[older, past, active]} />)
  expect(screen.getByRole('img', { name: 'Solo Café' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toHaveClass('text-h1', 'text-heading')
  expect(screen.getByText('Today')).not.toHaveClass('uppercase')
  const activeMeta = screen.getByText('Preparing · Code 11BC')
  expect(activeMeta).not.toHaveTextContent('16 Nov')

  fireEvent.click(screen.getByRole('button', { name: 'Past' }))
  expect(screen.getByText('Yesterday')).not.toHaveClass('uppercase')
  const pastTitle = screen.getByText('Solo cafe')
  expect(pastTitle).toHaveClass('text-muted-foreground')
  expect(pastTitle.closest('div')?.querySelector('a span')).toHaveClass('text-muted-foreground')
  expect(pastTitle.nextElementSibling).not.toHaveTextContent('15 Nov')

  expect(screen.getByRole('heading', { name: '11 Nov' })).toBeInTheDocument()
  const olderTitle = screen.getByText('Older cafe')
  expect(olderTitle).toHaveClass('text-muted-foreground')
  expect(olderTitle.nextElementSibling?.textContent).toBe('Picked up')
})
