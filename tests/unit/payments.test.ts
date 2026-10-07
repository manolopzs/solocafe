import { POST } from '@/app/api/webhooks/stripe/route'

function createMockSupabase() {
  const chainable: Record<string, jest.Mock> = {}
  const makeChainable = (returnValue: unknown = chainable) => {
    const fn = jest.fn(() => returnValue)
    return Object.assign(fn, chainable)
  }

  chainable.select = jest.fn(() => chainable)
  chainable.eq = jest.fn(() => chainable)
  chainable.single = jest.fn()
  chainable.update = jest.fn(() => chainable)
  chainable.insert = jest.fn(() => chainable)

  return {
    from: jest.fn(() => chainable),
    chainable,
  }
}

const mockSupabase = createMockSupabase()

jest.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn((payload, signature, secret) => {
        if (signature === 'bad') throw new Error('Invalid signature')
        return JSON.parse(payload)
      }),
    },
  },
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockSupabase),
}))

function buildEvent(type: string, object: Record<string, unknown>) {
  return {
    type,
    data: { object },
  }
}

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates payment and order on payment_intent.succeeded', async () => {
    mockSupabase.chainable.single.mockResolvedValueOnce({ data: { id: 'pay_1', order_id: 'ord_1' } })

    const event = buildEvent('payment_intent.succeeded', {
      id: 'pi_1',
      metadata: { order_id: 'ord_1' },
      latest_charge: 'ch_1',
      transfer_data: { destination: 'acct_1' },
    })

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'good' },
      body: JSON.stringify(event),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(mockSupabase.chainable.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'succeeded' }))
    expect(mockSupabase.chainable.update).toHaveBeenCalledWith(expect.objectContaining({ payment_status: 'succeeded', status: 'received' }))
    expect(mockSupabase.chainable.insert).toHaveBeenCalled()
  })

  it('updates payment and order on payment_intent.payment_failed', async () => {
    mockSupabase.chainable.single.mockResolvedValueOnce({ data: { id: 'pay_2', order_id: 'ord_2' } })

    const event = buildEvent('payment_intent.payment_failed', {
      id: 'pi_2',
      metadata: { order_id: 'ord_2' },
    })

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'good' },
      body: JSON.stringify(event),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(mockSupabase.chainable.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }))
    expect(mockSupabase.chainable.update).toHaveBeenCalledWith(expect.objectContaining({ payment_status: 'failed', status: 'cancelled' }))
  })

  it('rejects invalid signatures', async () => {
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'bad' },
      body: JSON.stringify(buildEvent('payment_intent.succeeded', {})),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('ignores irrelevant event types', async () => {
    const event = buildEvent('invoice.payment_succeeded', {})
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'good' },
      body: JSON.stringify(event),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockSupabase.chainable.update).not.toHaveBeenCalled()
  })
})
