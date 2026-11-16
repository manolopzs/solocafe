import { trackerUrlAfterPayment } from '@/lib/payment-return'

describe('trackerUrlAfterPayment', () => {
  it('sends a Stripe return straight to the live tracker', () => {
    expect(trackerUrlAfterPayment('ord-1', 'tok', { redirectStatus: 'succeeded' })).toBe('/order/ord-1?token=tok&pago=1')
  })

  it('keeps the saved-card payment sync', () => {
    expect(trackerUrlAfterPayment('ord-1', 'tok', { sync: '1' })).toBe('/order/ord-1?token=tok&pago=1&sync=1')
  })

  it('does not claim the payment went through when Stripe says it failed', () => {
    expect(trackerUrlAfterPayment('ord-1', 'tok', { redirectStatus: 'failed' })).toBe('/order/ord-1?token=tok')
  })

  it('encodes the order token', () => {
    expect(trackerUrlAfterPayment('ord-1', 'a b&c')).toBe('/order/ord-1?token=a+b%26c')
  })
})
