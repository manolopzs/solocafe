import { GuestAccount } from '@/components/account/guest-account'
import { AccountHome } from '@/components/account/account-home'
import AccountPage from './page'

jest.mock('@/server/queries/customers', () => ({
  getCurrentCustomer: jest.fn(),
  getLoyaltyCards: jest.fn(),
}))
jest.mock('@/server/queries/payment-methods', () => ({ getSavedCards: jest.fn() }))
jest.mock('@/components/account/account-home', () => ({ AccountHome: () => null }))
jest.mock('@/components/account/guest-account', () => ({ GuestAccount: () => null }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

const queries = jest.requireMock('@/server/queries/customers') as {
  getCurrentCustomer: jest.Mock
  getLoyaltyCards: jest.Mock
}
const cards = jest.requireMock('@/server/queries/payment-methods') as { getSavedCards: jest.Mock }
const navigation = jest.requireMock('next/navigation') as { redirect: jest.Mock }

describe('/account', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows guests the reasons to sign up instead of redirecting to login', async () => {
    queries.getCurrentCustomer.mockResolvedValue(null)
    const element = await AccountPage()
    expect(element.type).toBe(GuestAccount)
    expect(navigation.redirect).not.toHaveBeenCalled()
    expect(queries.getLoyaltyCards).not.toHaveBeenCalled()
  })

  it('keeps the account home for signed-in customers', async () => {
    const customer = { id: 'c1' }
    queries.getCurrentCustomer.mockResolvedValue(customer)
    queries.getLoyaltyCards.mockResolvedValue([])
    cards.getSavedCards.mockResolvedValue([])
    const element = await AccountPage()
    expect(element.type).toBe(AccountHome)
    expect(element.props.customer).toBe(customer)
  })
})
