/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { ShopStatusBadge, ShopStatusBanner } from './shop-status'
import { hoursConfigured } from '@/lib/ordering'
import type { OperatingHours, ShopOrdering } from '@/types'

const defaultHours = {
  mon: { is_open: true, open: '07:00', close: '20:00' },
  tue: { is_open: true, open: '07:00', close: '20:00' },
  wed: { is_open: true, open: '07:00', close: '20:00' },
  thu: { is_open: true, open: '07:00', close: '20:00' },
  fri: { is_open: true, open: '07:00', close: '20:00' },
  sat: { is_open: true, open: '08:00', close: '20:00' },
  sun: { is_open: true, open: '08:00', close: '18:00' },
} as OperatingHours

function ordering(overrides: Partial<ShopOrdering> & { hours_configured?: boolean }): ShopOrdering {
  return {
    open_now: true,
    accepting_pickup: true,
    asap_available: true,
    status: 'open',
    today: { is_open: true, open: '07:00', close: '20:00' },
    ...overrides,
  } as ShopOrdering
}

describe('hoursConfigured', () => {
  it('is false only when the API says hours are not set', () => {
    expect(hoursConfigured({ hours_configured: false })).toBe(false)
    expect(hoursConfigured({ hours_configured: true })).toBe(true)
    expect(hoursConfigured({})).toBe(true)
    expect(hoursConfigured(undefined)).toBe(true)
  })
})

describe('ShopStatusBadge', () => {
  it('shows Open when the shop has set its hours', () => {
    render(<ShopStatusBadge ordering={ordering({ hours_configured: true })} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('hides the open state when hours are not set', () => {
    const { container } = render(<ShopStatusBadge ordering={ordering({ hours_configured: false })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('still says the shop is not taking orders when paused, even without hours', () => {
    render(<ShopStatusBadge ordering={ordering({ hours_configured: false, status: 'not_accepting', accepting_pickup: false })} />)
    expect(screen.getByText('Not taking orders')).toBeInTheDocument()
  })
})

describe('ShopStatusBanner', () => {
  it('shows today and the week when hours are set', () => {
    render(<ShopStatusBanner ordering={ordering({ hours_configured: true })} hours={defaultHours} />)
    expect(screen.getByText('Today 07:00 to 20:00')).toBeInTheDocument()
    expect(screen.getByText('Hours')).toBeInTheDocument()
  })

  it('renders nothing when hours are not set and ordering is open', () => {
    const { container } = render(
      <ShopStatusBanner ordering={ordering({ hours_configured: false })} hours={defaultHours} />
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/07:00/)).not.toBeInTheDocument()
  })

  it('explains a real block without showing default hours', () => {
    render(
      <ShopStatusBanner
        ordering={ordering({ hours_configured: false, status: 'closed', open_now: false, asap_available: false })}
        hours={defaultHours}
      />
    )
    expect(screen.getByText("We're not preparing on-demand orders right now")).toBeInTheDocument()
    expect(screen.getByText('You can schedule your pickup.')).toBeInTheDocument()
    expect(screen.queryByText(/07:00|Hours|Closed/)).not.toBeInTheDocument()
  })
})
