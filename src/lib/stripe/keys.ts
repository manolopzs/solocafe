const PLACEHOLDER = /placeholder|changeme|your_stripe|xxx/i

export const STRIPE_NOT_CONFIGURED_MESSAGE =
  'El pago con tarjeta no está disponible todavía. Falta configurar Stripe.'

export function isConfiguredStripeKey(
  key: string | null | undefined,
  kind: 'secret' | 'publishable'
) {
  const value = (key ?? '').trim()
  if (!value || PLACEHOLDER.test(value)) return false

  const pattern =
    kind === 'secret'
      ? /^(sk|rk)_(test|live)_[A-Za-z0-9]{16,}$/
      : /^pk_(test|live)_[A-Za-z0-9]{16,}$/
  return pattern.test(value)
}

export function checkoutPaymentMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('stripe_not_configured')) {
    return STRIPE_NOT_CONFIGURED_MESSAGE
  }
  if (message.includes('not connected to Stripe')) {
    return 'Esta cafetería todavía no puede cobrar con tarjeta.'
  }
  return 'No pudimos preparar el pago. Inténtalo de nuevo.'
}
