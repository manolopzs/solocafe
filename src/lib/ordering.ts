import type { ShopOrdering } from '@/types'

/**
 * False only when the API says the owner has not saved hours yet. In that
 * case the API still orders on default hours, but screens should not show
 * those defaults (or "Open") as if they were the shop's real hours.
 * Older payloads without the flag count as configured.
 */
export function hoursConfigured(source?: object | null) {
  return (source as { hours_configured?: unknown } | null | undefined)?.hours_configured !== false
}

export function todayHoursLabel(ordering?: ShopOrdering) {
  const today = ordering?.today
  if (!today?.is_open || !today.open || !today.close) return 'Closed today'
  return `Today ${today.open} to ${today.close}`
}

export function checkoutBlockedCopy(reason: string | null | undefined) {
  switch (reason) {
    case 'shop_closed':
      return 'The coffee shop is closed right now.'
    case 'not_accepting':
      return "We're not taking pickup orders right now."
    case 'item_unavailable':
      return 'Something in your order is no longer available.'
    case 'modifier_unavailable':
      return 'One option in your order is no longer available.'
    case 'empty':
      return 'Your order is empty.'
    case 'checking':
      return 'Checking your order.'
    case 'error':
      return "We couldn't check your order."
    default:
      return null
  }
}

export function orderErrorCopy(message: string) {
  if (message.includes('shop_closed')) return 'The coffee shop is closed right now.'
  if (message.includes('not_accepting')) return "We're not taking pickup orders right now."
  if (message.includes('item_unavailable') || message.includes('sold_out')) {
    return 'A product is no longer available.'
  }
  if (message.includes('modifier_unavailable')) return 'An option is no longer available.'
  if (message.includes('loyalty_unavailable')) return "You can't redeem that reward yet."
  if (message.includes('full')) return 'That time slot is already full.'
  if (message.includes('outside operating hours')) return 'That time is outside the coffee shop hours.'
  return "We couldn't create the order. Please try again."
}

export const CUSTOMER_TIME_ZONE = 'Europe/Madrid'

export function formatPickupWindow(start: string, end: string, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  })
  return `Pickup between ${fmt.format(new Date(start))} and ${fmt.format(new Date(end))}`
}

const DEFAULT_NUMBER_LOCALE = 'es-ES'

const LOCALE_DEFAULT_REGION: Record<string, string> = {
  es: 'es-ES',
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ca: 'ca-ES',
}

/**
 * Resolve a shop locale into a BCP 47 tag that Intl can use.
 * Full tags are kept when supported; bare languages get a default region.
 * Unknown or invalid tags fall back to es-ES.
 */
export function shopNumberLocale(locale?: string | null): string {
  if (!locale) return DEFAULT_NUMBER_LOCALE
  const trimmed = locale.trim()
  if (!trimmed) return DEFAULT_NUMBER_LOCALE

  if (trimmed.includes('-')) {
    try {
      const supported = Intl.NumberFormat.supportedLocalesOf([trimmed])
      if (supported.length > 0 && supported[0].toLowerCase() === trimmed.toLowerCase()) {
        return supported[0]
      }
    } catch {
      // Invalid tag: fall through to default.
    }
    return DEFAULT_NUMBER_LOCALE
  }

  return LOCALE_DEFAULT_REGION[trimmed] ?? DEFAULT_NUMBER_LOCALE
}

export function formatMoney(cents: number, currency = 'EUR', locale?: string) {
  const amount = (Number.isFinite(cents) ? cents : 0) / 100
  const code = (currency || 'EUR').toUpperCase()
  const numberLocale = shopNumberLocale(locale)
  try {
    return new Intl.NumberFormat(numberLocale, { style: 'currency', currency: code })
      .format(amount)
      .replace(/[\u00a0\u202f]/g, ' ')
  } catch {
    return new Intl.NumberFormat(DEFAULT_NUMBER_LOCALE, { style: 'currency', currency: 'EUR' })
      .format(amount)
      .replace(/[\u00a0\u202f]/g, ' ')
  }
}
