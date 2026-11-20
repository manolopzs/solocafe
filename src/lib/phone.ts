import { shopNumberLocale } from '@/lib/ordering'

const DEFAULT_DIAL_PREFIX = '+34'

const DIAL_PREFIX_BY_REGION: Record<string, string> = {
  ES: '+34',
  GB: '+44',
  FR: '+33',
  DE: '+49',
  IT: '+39',
  PT: '+351',
  IE: '+353',
  NL: '+31',
  US: '+1',
  MX: '+52',
}

/** Country dial prefix for a shop locale ("es" or "es-ES" gives +34). Unknown regions give +34. */
export function dialPrefixForLocale(locale?: string | null): string {
  const region = shopNumberLocale(locale).split('-')[1]?.toUpperCase()
  return (region && DIAL_PREFIX_BY_REGION[region]) || DEFAULT_DIAL_PREFIX
}

/** Placeholder for the phone field, with the shop's dial prefix. */
export function phonePlaceholder(locale?: string | null): string {
  return `So we can tell you when it is ready (${dialPrefixForLocale(locale)})`
}
