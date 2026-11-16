/**
 * Where the customer lands after paying: the live order tracker.
 *
 * Stripe (and the saved-card flow) still return to /checkout/<id>/success,
 * which now only forwards here. `pago=1` tells the tracker the customer just
 * paid, so while the webhook catches up it says "Confirmando tu pago" instead
 * of asking them to pay again. `sync=1` keeps the saved-card payment sync.
 */
export function trackerUrlAfterPayment(
  orderId: string,
  token: string,
  { sync, redirectStatus }: { sync?: string; redirectStatus?: string } = {}
) {
  const params = new URLSearchParams({ token })
  const paid = sync === '1' || redirectStatus === 'succeeded' || redirectStatus === 'processing'
  if (paid) params.set('pago', '1')
  if (sync === '1') params.set('sync', '1')
  return `/order/${encodeURIComponent(orderId)}?${params.toString()}`
}
