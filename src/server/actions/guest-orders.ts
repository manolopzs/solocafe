'use server'

import { z } from 'zod'
import { getPublicOrderView } from '@/server/queries/orders'
import type { OrderStatus } from '@/types'

const refsSchema = z
  .array(z.object({ id: z.string().uuid(), token: z.string().min(1).max(200) }))
  .max(10)

/** Re-read the status of orders saved on a guest's phone, using each order's own access token. */
export async function refreshGuestOrderStatuses(
  refs: { id: string; token: string }[]
): Promise<{ id: string; status: OrderStatus }[]> {
  const parsed = refsSchema.safeParse(refs)
  if (!parsed.success) return []
  const views = await Promise.all(parsed.data.map((ref) => getPublicOrderView(ref.id, ref.token)))
  return views.flatMap((view) => (view ? [{ id: view.order.id, status: view.order.status }] : []))
}
