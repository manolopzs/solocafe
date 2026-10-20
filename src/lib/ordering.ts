import type { ShopOrdering } from '@/types'

export function todayHoursLabel(ordering?: ShopOrdering) {
  const today = ordering?.today
  if (!today?.is_open || !today.open || !today.close) return 'Hoy cerrado'
  return `Hoy de ${today.open} a ${today.close}`
}

export function checkoutBlockedCopy(reason: string | null | undefined) {
  switch (reason) {
    case 'shop_closed':
      return 'La cafetería está cerrada ahora. Puedes programar tu recogida.'
    case 'not_accepting':
      return 'Ahora no tomamos pedidos para recoger.'
    case 'item_unavailable':
      return 'Hay algo en tu pedido que ya no está disponible.'
    case 'modifier_unavailable':
      return 'Una opción de tu pedido ya no está disponible.'
    case 'empty':
      return 'Tu pedido está vacío.'
    case 'checking':
      return 'Revisando tu pedido.'
    default:
      return null
  }
}

export function orderErrorCopy(message: string) {
  if (message.includes('shop_closed')) return 'La cafetería está cerrada ahora.'
  if (message.includes('not_accepting')) return 'Ahora no tomamos pedidos para recoger.'
  if (message.includes('item_unavailable') || message.includes('sold_out')) {
    return 'Un producto ya no está disponible.'
  }
  if (message.includes('modifier_unavailable')) return 'Una opción ya no está disponible.'
  if (message.includes('loyalty_unavailable')) return 'Aún no puedes canjear esa recompensa.'
  if (message.includes('full')) return 'Ese horario ya está lleno.'
  if (message.includes('outside operating hours')) return 'Ese horario está fuera del horario de la cafetería.'
  return 'No pudimos crear el pedido. Inténtalo de nuevo.'
}

export function formatPickupWindow(start: string, end: string, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  })
  return `Recoge entre ${fmt.format(new Date(start))} y ${fmt.format(new Date(end))}`
}

export function formatMoney(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`
}
