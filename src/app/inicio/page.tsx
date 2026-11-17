import type { Metadata } from 'next'
import { connection } from 'next/server'
import { ShopDirectory } from '@/components/explore/shop-directory'
import { greetingFor } from '@/lib/greeting'
import { getPublicShops, withMenuCutouts } from '@/server/queries/explore'

export const instant = false

export const metadata: Metadata = {
  title: 'Inicio',
}

/** Customer home (mock 01): greeting and the shops, closed ones too. Each card opens its menu. */
export default async function InicioPage() {
  await connection()
  const { shops, sort } = await getPublicShops(undefined, { includeClosed: true })
  const cards = await withMenuCutouts(shops)
  return <ShopDirectory shops={cards} sort={sort} title={greetingFor(new Date())} />
}
