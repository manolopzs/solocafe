import { notFound, redirect } from 'next/navigation'
import { trackerUrlAfterPayment } from '@/lib/payment-return'

export const instant = false

// Payment return_url. There is no "Pago confirmado" screen any more: the
// customer goes straight to the live tracker, which also runs the saved-card
// payment sync when `sync=1`.
export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string; sync?: string; redirect_status?: string }>
}) {
  const { orderId } = await params
  const { token, sync, redirect_status: redirectStatus } = await searchParams
  if (!token) notFound()

  redirect(trackerUrlAfterPayment(orderId, token, { sync, redirectStatus }))
}
