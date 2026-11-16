import { getCurrentCustomer, getLoyaltyCards } from '@/server/queries/customers'
import { getSavedCards } from '@/server/queries/payment-methods'
import { AccountHome } from '@/components/account/account-home'
import { GuestAccount } from '@/components/account/guest-account'
import type { CustomerPaymentMethod } from '@/types'

export default async function AccountPage() {
  const customer = await getCurrentCustomer()

  // Guests see why an account helps, with sign-up and sign-in, instead of a login wall.
  if (!customer) return <GuestAccount />

  const loyaltyCards = await getLoyaltyCards()

  let savedCards: CustomerPaymentMethod[] = []
  try {
    savedCards = await getSavedCards()
  } catch {
    savedCards = []
  }

  return <AccountHome customer={customer} loyaltyCards={loyaltyCards} savedCards={savedCards} />
}
