import Link from 'next/link'
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
        <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Cafeterías
        </Link>

        <h1 className="mt-8 text-[2rem] font-medium leading-tight tracking-tight text-foreground">
          {firstName ? `Hola, ${firstName}` : 'Tu cuenta'}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">{customer.email || 'Gestiona tu perfil y revisa tus pedidos.'}</p>

        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Perfil</h2>
          <form action={updateCustomerProfile} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" type="text" defaultValue={customer.name ?? ''} placeholder="Cómo te llaman" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer.phone ?? ''}
                placeholder="Para avisarte cuando esté listo"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full">
              Guardar cambios
            </Button>
          </form>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Tus sellos</h2>
          {loyaltyCards.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Cada pedido pagado suma un sello en esa cafetería. Cuando completes la tarjeta, puedes canjear un artículo gratis.
            </p>
          ) : (
            loyaltyCards.map((card) => <StampCard key={card.shop_id} loyalty={card} compact />)
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Tarjetas guardadas</h2>
          {savedCards.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              No tienes tarjetas guardadas. Puedes guardar una al pagar tu próximo pedido.
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
                        Eliminar
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
              <span className="block font-medium text-foreground">Historial</span>
              <span className="block text-sm text-muted-foreground">Ver pedidos pasados</span>
            </span>
            <Icon name="chevron-right" className="h-5 w-5 text-muted-foreground" />
          </Link>
          <form action={accountLogoutAction} className="border-t border-border">
            <button type="submit" className="flex min-h-16 w-full items-center gap-3 px-4 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground">
                <Icon name="x" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">Cerrar sesión</span>
                <span className="block text-sm text-muted-foreground">Salir de tu cuenta</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
