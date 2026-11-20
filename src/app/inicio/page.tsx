import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { ShopDirectory } from '@/components/explore/shop-directory'
import { AccountAvatar } from '@/components/inicio/account-avatar'
import { GuestLoDeSiempre, LoDeSiempre } from '@/components/inicio/lo-de-siempre'
import { greetingFor } from '@/lib/greeting'
import { lastCustomerOrder } from '@/lib/last-order'
import { getCurrentCustomer, getCustomerOrders } from '@/server/queries/customers'
import { getPublicShops, withMenuCutouts } from '@/server/queries/explore'

export const instant = false

export const metadata: Metadata = {
  title: 'Home',
}

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || null
}

/**
 * Customer home (mock 01, b4): greeting, "Lo de siempre" when there is a real previous
 * order, then the shops (closed ones too). Each card opens its menu.
 */
export default async function InicioPage() {
  await connection()
  const signedIn = Boolean((await cookies()).get('token')?.value)
  const [{ shops, sort }, customer] = await Promise.all([
    getPublicShops(undefined, { includeClosed: true }),
    signedIn ? getCurrentCustomer() : Promise.resolve(null),
  ])
  const [cards, orders] = await Promise.all([
    withMenuCutouts(shops),
    customer ? getCustomerOrders() : Promise.resolve([]),
  ])

  const greeting = greetingFor(new Date())
  const name = customer ? firstName(customer.name) : null

  return (
    <ShopDirectory
      shops={cards}
      sort={sort}
      title={name ? `${greeting}, ${name}` : greeting}
      headerAction={customer ? <AccountAvatar name={customer.name} /> : undefined}
    >
      {customer ? <LoDeSiempre order={lastCustomerOrder(orders)} /> : <GuestLoDeSiempre />}
    </ShopDirectory>
  )
}
