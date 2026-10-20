import { redirect } from 'next/navigation'
import { getCurrentCustomer, getCustomerOrders } from '@/server/queries/customers'
import { OrdersList } from '@/components/account/orders-list'

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer()

  if (!customer) {
    redirect('/account/login')
  }

  const orders = await getCustomerOrders()

  return <OrdersList orders={orders} />
}
