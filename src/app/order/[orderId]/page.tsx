import { notFound } from 'next/navigation'
import { getPublicOrderView } from '@/server/queries/orders'
import { OrderStatusClient } from '@/components/order/order-status-client'

export const instant = false

interface OrderStatusPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function OrderStatusPage({ params, searchParams }: OrderStatusPageProps) {
  const { orderId } = await params
  const { token } = await searchParams
  const view = await getPublicOrderView(orderId, token)
  if (!view) notFound()

  return (
    <OrderStatusClient
      initialOrder={view.order}
      accessToken={token}
      vapidPublicKey={view.vapidPublicKey}
    />
  )
}
