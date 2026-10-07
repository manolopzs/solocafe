import { redirect } from 'next/navigation'
import { getUserShops } from '@/server/queries/shops'

export const instant = false

export default async function DashboardIndexPage() {
  const shops = await getUserShops()

  if (shops.length === 0) {
    redirect('/dashboard/onboarding')
  }

  if (shops.length === 1) {
    redirect(`/dashboard/${shops[0].id}`)
  }

  redirect(`/dashboard/${shops[0].id}`)
}
