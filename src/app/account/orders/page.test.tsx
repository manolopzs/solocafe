import { GuestOrders } from '@/components/account/guest-orders'
import { OrdersList } from '@/components/account/orders-list'
import AccountOrdersPage from './page'

jest.mock('@/server/queries/customers', () => ({
  getCurrentCustomer: jest.fn(),
  getCustomerOrders: jest.fn(),
}))
jest.mock('@/components/account/guest-orders', () => ({ GuestOrders: () => null }))
jest.mock('@/components/account/orders-list', () => ({ OrdersList: () => null }))

const queries = jest.requireMock('@/server/queries/customers') as {
  getCurrentCustomer: jest.Mock
  getCustomerOrders: jest.Mock
}

describe('/account/orders', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows guests their on-device orders instead of redirecting to login', async () => {
    queries.getCurrentCustomer.mockResolvedValue(null)
    const element = await AccountOrdersPage()
    expect(element.type).toBe(GuestOrders)
    expect(queries.getCustomerOrders).not.toHaveBeenCalled()
  })

  it('keeps the account order history for signed-in customers', async () => {
    const orders = [{ id: 'o1' }]
    queries.getCurrentCustomer.mockResolvedValue({ id: 'c1' })
    queries.getCustomerOrders.mockResolvedValue(orders)
    const element = await AccountOrdersPage()
    expect(element.type).toBe(OrdersList)
    expect(element.props.orders).toBe(orders)
  })
})
