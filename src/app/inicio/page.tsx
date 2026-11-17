import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { ShopDirectory } from '@/components/explore/shop-directory'
import { getPublicShops } from '@/server/queries/explore'

export const instant = false

export const metadata: Metadata = {
  title: 'Inicio',
}

/**
 * Customer home for a phone that hasn't visited a shop yet.
 * One shop in the network: go straight to its menu. Otherwise list them, closed ones too.
 */
export default async function InicioPage() {
  await connection()
  const { shops, sort } = await getPublicShops(undefined, { includeClosed: true })
  if (shops.length === 1) redirect(`/${encodeURIComponent(shops[0].slug)}`)
  return <ShopDirectory shops={shops} sort={sort} />
}
