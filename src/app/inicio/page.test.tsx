import type { ReactElement } from 'react'
import { ShopDirectory } from '@/components/explore/shop-directory'
import InicioPage from './page'

jest.mock('next/server', () => ({ connection: jest.fn(async () => undefined) }))
jest.mock('@/server/queries/explore', () => ({
  getPublicShops: jest.fn(),
  withMenuCutouts: jest.fn(async (shops: unknown[]) => shops.map((shop) => ({ ...(shop as object), cutouts: ['/menu/cutouts/latte.png'] }))),
}))
jest.mock('@/components/explore/shop-directory', () => ({ ShopDirectory: () => null }))
const mockToken = { value: undefined as string | undefined }
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({ get: () => (mockToken.value ? { value: mockToken.value } : undefined) })),
}))
jest.mock('@/server/queries/customers', () => ({
  getCurrentCustomer: jest.fn(),
  getCustomerOrders: jest.fn(),
}))
jest.mock('@/components/inicio/lo-de-siempre', () => ({ LoDeSiempre: () => null, GuestLoDeSiempre: () => null }))

const explore = jest.requireMock('@/server/queries/explore') as { getPublicShops: jest.Mock }
const customers = jest.requireMock('@/server/queries/customers') as {
  getCurrentCustomer: jest.Mock
  getCustomerOrders: jest.Mock
}
const loDeSiempre = jest.requireMock('@/components/inicio/lo-de-siempre') as {
  LoDeSiempre: unknown
  GuestLoDeSiempre: unknown
}

const shop = (slug: string, name: string) => ({
  slug,
  name,
  address: null,
  open_now: false,
  brand_color: null,
  display_font: 'inter',
  hero_photo_url: null,
})

type Child = ReactElement<{ order?: { id: string; reorderHref: string } | null }>
type Props = { shops: { slug: string; cutouts: string[] }[]; title: string; headerAction?: ReactElement; children: Child }

describe('/inicio', () => {
  beforeEach(() => {
    explore.getPublicShops.mockReset()
    customers.getCurrentCustomer.mockReset()
    customers.getCustomerOrders.mockReset()
    mockToken.value = undefined
  })

  it('shows the only shop as a card (closed ones too) instead of redirecting', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('solo-cafe', 'Solo cafe')] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(explore.getPublicShops).toHaveBeenCalledWith(undefined, { includeClosed: true })
    expect(element.type).toBe(ShopDirectory)
    expect(element.props.shops.map((s) => s.slug)).toEqual(['solo-cafe'])
    expect(element.props.shops[0].cutouts).toEqual(['/menu/cutouts/latte.png'])
    expect(element.props.title).toMatch(/^(Good morning|Good afternoon|Good evening)$/)
  })

  it('lists every shop when there are several', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('a', 'A'), shop('b', 'B')] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.shops.map((s) => s.slug)).toEqual(['a', 'b'])
  })

  it('shows the empty directory when there are no shops', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.shops).toEqual([])
  })

  it('guests get no header action and the on-device Lo de siempre, without calling the account API', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('solo-cafe', 'Solo cafe')] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.headerAction).toBeUndefined()
    expect(element.props.children.type).toBe(loDeSiempre.GuestLoDeSiempre)
    expect(customers.getCurrentCustomer).not.toHaveBeenCalled()
  })

  it('signed-in customers get their avatar, their name and their last order', async () => {
    mockToken.value = 'abc'
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('solo-cafe', 'Solo cafe')] })
    customers.getCurrentCustomer.mockResolvedValue({ id: 'c1', name: 'Lucía Pérez' })
    customers.getCustomerOrders.mockResolvedValue([
      {
        id: 'o1',
        shop_slug: 'solo-cafe',
        shop_name: 'Solo cafe',
        status: 'picked_up',
        total_cents: 200,
        currency: 'EUR',
        created_at: '2026-11-10T10:00:00Z',
        items: [{ id: 'i1', item_name_snapshot: 'Latte', quantity: 1 }],
      },
    ])
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.title).toMatch(/, Lucía$/)
    expect(element.props.headerAction).toBeDefined()
    expect(element.props.children.type).toBe(loDeSiempre.LoDeSiempre)
    expect(element.props.children.props.order?.reorderHref).toBe('/solo-cafe?reorder=o1')
  })

  it('signed-in customers with no orders get no Lo de siempre', async () => {
    mockToken.value = 'abc'
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [] })
    customers.getCurrentCustomer.mockResolvedValue({ id: 'c1', name: 'Lucía' })
    customers.getCustomerOrders.mockResolvedValue([])
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.children.props.order).toBeNull()
  })

  it('treats an expired session as a guest', async () => {
    mockToken.value = 'stale'
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [] })
    customers.getCurrentCustomer.mockResolvedValue(null)
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.headerAction).toBeUndefined()
    expect(element.props.children.type).toBe(loDeSiempre.GuestLoDeSiempre)
    expect(customers.getCustomerOrders).not.toHaveBeenCalled()
  })
})
