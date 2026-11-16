import { getCurrentCustomer, getCustomerOrders } from '@/server/queries/customers'
import { OrdersList } from '@/components/account/orders-list'
import { GuestOrders } from '@/components/account/guest-orders'

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer()

  // Guests see the orders saved on this phone instead of a login wall.
  if (!customer) return <GuestOrders />

  const orders = await getCustomerOrders()

  return <OrdersList orders={orders} />
}
