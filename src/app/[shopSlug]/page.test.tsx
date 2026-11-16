import type { ReactElement } from 'react'
import { OrderPageClient } from '@/components/order/order-page-client'
import PublicOrderPage from './page'

jest.mock('next/headers', () => ({ cookies: jest.fn() }))
jest.mock('next/navigation', () => ({ notFound: jest.fn(() => { throw new Error('notFound') }) }))
jest.mock('@/server/queries/customers', () => ({ getCurrentCustomer: jest.fn(), getCustomerOrder: jest.fn() }))
jest.mock('@/server/queries/favorites', () => ({ getShopFavorites: jest.fn() }))
jest.mock('@/server/queries/recentOrders', () => ({ getRecentOrders: jest.fn() }))
jest.mock('@/server/queries/orders', () => ({ getPublicOrderView: jest.fn(), getUsualOrder: jest.fn() }))
jest.mock('@/server/queries/storefront', () => ({ getPublicStorefront: jest.fn() }))
jest.mock('@/components/order/order-page-client', () => ({ OrderPageClient: () => null }))
jest.mock('@/components/shop/shop-hero', () => ({ ShopHero: () => null }))

const headers = jest.requireMock('next/headers') as { cookies: jest.Mock }
const customers = jest.requireMock('@/server/queries/customers') as { getCurrentCustomer: jest.Mock; getCustomerOrder: jest.Mock }
const orders = jest.requireMock('@/server/queries/orders') as { getPublicOrderView: jest.Mock }
const storefront = jest.requireMock('@/server/queries/storefront') as { getPublicStorefront: jest.Mock }

const shop = { id: 'shop-1', brand_color: '#8c3d25', display_font: null, name: 'Solo cafe', hero_photo_url: null }
const menu = {
  categories: [],
  items: [
    { id: 'latte', is_active: true, is_86ed: false },
    { id: 'cortado', is_active: true, is_86ed: true },
  ],
  modifierGroups: [],
  modifierOptions: [],
  itemModifierLinks: [],
}
const pastOrder = {
  id: 'o1',
  shop_id: 'shop-1',
  items: [
    { item_id: 'latte', quantity: 2, modifiers: [] },
    { item_id: 'cortado', quantity: 1, modifiers: [] },
  ],
}

function clientProps(element: ReactElement): Record<string, unknown> {
  const children = (element.props as { children: ReactElement[] }).children
  const client = children.find((child) => child.type === OrderPageClient)!
  return client.props as Record<string, unknown>
}

const render = (search: Record<string, string>) =>
  PublicOrderPage({ params: Promise.resolve({ shopSlug: 'main' }), searchParams: Promise.resolve(search) })

describe('/[shopSlug] ?reorder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    storefront.getPublicStorefront.mockResolvedValue({ shop, menu })
    headers.cookies.mockResolvedValue({ get: () => undefined })
  })

  it('lets a guest repeat a saved order with its token, skipping sold-out items', async () => {
    orders.getPublicOrderView.mockResolvedValue({ order: pastOrder, vapidPublicKey: null })
    const props = clientProps(await render({ reorder: 'o1', token: 'tok' }))
    expect(orders.getPublicOrderView).toHaveBeenCalledWith('o1', 'tok')
    expect(customers.getCustomerOrder).not.toHaveBeenCalled()
    expect((props.reorderOrder as typeof pastOrder).items.map((i) => i.item_id)).toEqual(['latte'])
    expect(props.reorderCount).toBe(2)
  })

  it('ignores a guest reorder without a token', async () => {
    const props = clientProps(await render({ reorder: 'o1' }))
    expect(orders.getPublicOrderView).not.toHaveBeenCalled()
    expect(props.reorderOrder).toBeNull()
    expect(props.reorderCount).toBe(0)
  })

  it('uses the signed-in customer order first', async () => {
    headers.cookies.mockResolvedValue({ get: () => ({ value: 'session' }) })
    customers.getCurrentCustomer.mockResolvedValue({ id: 'c1' })
    customers.getCustomerOrder.mockResolvedValue(pastOrder)
    const props = clientProps(await render({ reorder: 'o1', token: 'tok' }))
    expect(customers.getCustomerOrder).toHaveBeenCalledWith('o1')
    expect(orders.getPublicOrderView).not.toHaveBeenCalled()
    expect(props.reorderCount).toBe(2)
  })
})
