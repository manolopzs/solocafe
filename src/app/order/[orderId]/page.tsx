import { notFound } from 'next/navigation'
import { getPublicOrderView } from '@/server/queries/orders'
import { OrderStatusClient } from '@/components/order/order-status-client'
import { PaymentReturnSync } from '@/components/order/payment-return-sync'

export const instant = false

interface OrderStatusPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string; sync?: string; pago?: string }>
}

export default async function OrderStatusPage({ params, searchParams }: OrderStatusPageProps) {
  const { orderId } = await params
  const { token, sync, pago } = await searchParams
  const view = await getPublicOrderView(orderId, token)
  if (!view) notFound()

  return (
    <>
      {sync === '1' && <PaymentReturnSync orderId={orderId} accessToken={token} />}
      <OrderStatusClient
        initialOrder={view.order}
        accessToken={token}
        vapidPublicKey={view.vapidPublicKey}
        paymentReturn={pago === '1'}
      />
    </>
  )
}
