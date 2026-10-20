import {
  STRIPE_NOT_CONFIGURED_MESSAGE,
  checkoutPaymentMessage,
  isConfiguredStripeKey,
} from './keys'

describe('stripe key configuration', () => {
  it('rejects empty and placeholder keys', () => {
    expect(isConfiguredStripeKey('', 'publishable')).toBe(false)
    expect(isConfiguredStripeKey('pk_test_placeholder', 'publishable')).toBe(false)
    expect(isConfiguredStripeKey('sk_test_placeholder', 'secret')).toBe(false)
    expect(isConfiguredStripeKey('pk_test', 'publishable')).toBe(false)
    expect(isConfiguredStripeKey('sk_test_your_stripe_key_here_xxxx', 'secret')).toBe(false)
  })

  it('accepts a well formed test key', () => {
    expect(isConfiguredStripeKey(`pk_test_${'a'.repeat(16)}`, 'publishable')).toBe(true)
    expect(isConfiguredStripeKey(`sk_test_${'b'.repeat(16)}`, 'secret')).toBe(true)
    expect(isConfiguredStripeKey(`rk_test_${'c'.repeat(16)}`, 'secret')).toBe(true)
  })

  it('explains a missing Stripe setup in Spanish', () => {
    expect(
      checkoutPaymentMessage(new Error('http://localhost:3001/payments: stripe_not_configured'))
    ).toBe(STRIPE_NOT_CONFIGURED_MESSAGE)
    expect(STRIPE_NOT_CONFIGURED_MESSAGE).not.toMatch(/—|--/)
    expect(checkoutPaymentMessage(new Error('Shop is not connected to Stripe'))).toBe(
      'Esta cafetería todavía no puede cobrar con tarjeta.'
    )
    expect(checkoutPaymentMessage(new Error('network down'))).toBe(
      'No pudimos preparar el pago. Inténtalo de nuevo.'
    )
  })
})
