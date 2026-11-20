import Link from 'next/link'
import { phonePlaceholder } from '@/lib/phone'
import { accountLogoutAction } from '@/server/actions/account-auth'
import { deleteSavedCard } from '@/server/actions/payment-methods'
import { updateCustomerProfile } from '@/server/actions/customers'
import { cardExpiry, cardTitle } from '@/lib/cards'
import type { Customer, CustomerPaymentMethod, LoyaltyProgress } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StampCard } from '@/components/order/stamp-card'
import { Icon } from '@/components/ui/icon'
import { CUSTOMER_HOME_PATH } from '@/lib/site'

export function AccountHome({
  customer,
  loyaltyCards,
  savedCards,
}: {
  customer: Customer
  loyaltyCards: LoyaltyProgress[]
  savedCards: CustomerPaymentMethod[]
}) {
  const firstName = customer.name?.trim().split(' ')[0]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-5">
        <Link href={CUSTOMER_HOME_PATH} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Home
        </Link>

        <h1 className="mt-8 text-[2rem] font-medium leading-tight tracking-tight text-heading">
          {firstName ? `Hi, ${firstName}` : 'Your account'}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">{customer.email || 'Manage your profile and review your orders.'}</p>

        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Profile</h2>
          <form action={updateCustomerProfile} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" defaultValue={customer.name ?? ''} placeholder="What is your name?" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer.phone ?? ''}
                placeholder={phonePlaceholder()}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Your stamps</h2>
          {loyaltyCards.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Every paid order earns a stamp at that coffee shop. When you fill the card, you can redeem a free item.
            </p>
          ) : (
            loyaltyCards.map((card) => <StampCard key={card.shop_id} loyalty={card} compact />)
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Saved cards</h2>
          {savedCards.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You have no saved cards. You can save one when you pay your next order.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {savedCards.map((card) => {
                const expiry = cardExpiry(card)
                return (
                  <li key={card.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{cardTitle(card)}</p>
                      {expiry && <p className="text-sm text-muted-foreground">{expiry}</p>}
                    </div>
                    <form action={deleteSavedCard}>
                      <input type="hidden" name="id" value={card.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="mt-8 overflow-hidden rounded-3xl bg-surface">
          <Link href="/account/orders" className="flex min-h-16 items-center gap-3 px-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground">
              <Icon name="receipt" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-foreground">History</span>
              <span className="block text-sm text-muted-foreground">View past orders</span>
            </span>
            <Icon name="chevron-right" className="h-5 w-5 text-muted-foreground" />
          </Link>
          <form action={accountLogoutAction} className="border-t border-border">
            <button type="submit" className="flex min-h-16 w-full items-center gap-3 px-4 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground">
                <Icon name="x" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">Log out</span>
                <span className="block text-sm text-muted-foreground">Leave your account</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
