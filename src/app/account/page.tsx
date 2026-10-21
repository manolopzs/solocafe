import { redirect } from 'next/navigation'
import { getCurrentCustomer, getLoyaltyCards } from '@/server/queries/customers'
import { getSavedCards } from '@/server/queries/payment-methods'
import { AccountHome } from '@/components/account/account-home'
import type { CustomerPaymentMethod } from '@/types'

export default async function AccountPage() {
  const customer = await getCurrentCustomer()

  if (!customer) {
    redirect('/account/login')
  }

  const loyaltyCards = await getLoyaltyCards()

  let savedCards: CustomerPaymentMethod[] = []
  try {
    savedCards = await getSavedCards()
  } catch {
    savedCards = []
  }

  return <AccountHome customer={customer} loyaltyCards={loyaltyCards} savedCards={savedCards} />
}
