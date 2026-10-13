import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { OrderStatusClient } from '@/components/order/order-status-client'

export const instant = false

interface OrderStatusPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ phone?: string }>
}

export default async function OrderStatusPage({ params, searchParams }: OrderStatusPageProps) {
  const { orderId } = await params
  const { phone } = await searchParams
  const order = await getOrderWithItems(orderId, phone)
  if (!order) notFound()

  return <OrderStatusClient initialOrder={order} phone={phone} />
}
