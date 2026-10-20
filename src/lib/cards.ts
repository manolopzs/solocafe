import type { CustomerPaymentMethod } from '@/types'

const BRANDS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
}

export function cardBrandLabel(brand: string | null) {
  if (!brand) return 'Tarjeta'
  return BRANDS[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
}

export function cardTitle(card: Pick<CustomerPaymentMethod, 'brand' | 'last4'>) {
  const brand = cardBrandLabel(card.brand)
  if (card.last4) return `${brand} terminada en ${card.last4}`
  return brand
}

export function cardExpiry(card: Pick<CustomerPaymentMethod, 'exp_month' | 'exp_year'>) {
  if (!card.exp_month || !card.exp_year) return null
  const month = String(card.exp_month).padStart(2, '0')
  return `Vence ${month}/${card.exp_year}`
}
