import { createClient } from '@/lib/supabase/server'

export async function getShopAnalytics(shopId: string) {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('total_cents, created_at')
    .eq('shop_id', shopId)
    .eq('payment_status', 'succeeded')

  const totals = (orders ?? []).map((o) => o.total_cents)
  const revenueCents = totals.reduce((a, b) => a + b, 0)
  const orderCount = totals.length
  const averageTicketCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0

  return {
    orderCount,
    revenueCents,
    averageTicketCents,
  }
}
