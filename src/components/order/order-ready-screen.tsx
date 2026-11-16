'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/ordering'
import { pickupCode } from '@/lib/pickup-code'
import type { Order, OrderItem, OrderItemModifier, OrderStatus } from '@/types'

type ReadyOrder = Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }

/** The order status page switches to the Listo takeover while the order is ready. */
export function showsReadyScreen(status: OrderStatus): boolean {
  return status === 'ready'
}

/** First word of the name the customer gave at checkout, or null if none. */
export function readyFirstName(customerName: string | null | undefined): string | null {
  const first = customerName?.trim().split(/\s+/)[0]
  return first ? first : null
}

/**
 * Full-screen "Listo" takeover for the order status page (mock 01b).
 * It sits above the customer tab bar (z-40), so the tab bar and "Avísame"
 * are out of the way once the order is ready.
 *
 * Stamps: the API awards one stamp when an order with a customer account is
 * paid (LoyaltyStamp.award_paid_order!). This screen only reflects that rule.
 */
export function OrderReadyScreen({ order, menuHref }: { order: ReadyOrder; menuHref: string }) {
  const [showDetails, setShowDetails] = useState(false)
  const name = readyFirstName(order.customer_name)
  const signedIn = Boolean(order.customer_id)
  const loyalty = order.loyalty
  const required = loyalty ? Math.max(loyalty.stamps_required, 1) : 0
  const filled = loyalty ? Math.min(Math.max(loyalty.stamps, 0), required) : 0

  return (
    <main
      className="fixed inset-0 z-50 overflow-y-auto bg-terracotta-600 text-cream"
      data-testid="order-ready-screen"
      aria-live="polite"
    >
      <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between font-semibold">
          <span className="truncate">{order.shop?.name}</span>
          <Link href={menuHref} className="inline-flex min-h-11 items-center px-1">
            Cerrar
          </Link>
        </div>

        <h1 className="mt-8 break-words text-[4.25rem] font-bold uppercase leading-[0.9] tracking-tight">
          {name ? (
            <>
              ¡Listo,
              <br />
              {name}!
            </>
          ) : (
            '¡Listo!'
          )}
        </h1>
        <p className="mt-4 text-lg font-semibold leading-snug">Tu pedido está listo. Pasa a recogerlo.</p>

        <div className="mt-7 rounded-[1.75rem] bg-cream px-6 pb-5 pt-5 text-center text-foreground">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Tu código</p>
          <p className="mt-1 text-[5.5rem] font-semibold leading-none tracking-[0.06em] tabular-nums" data-testid="ready-pickup-code">
            {pickupCode(order.id)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Dilo o enséñalo en la barra</p>
        </div>

        {signedIn ? (
          <div className="mt-9 flex flex-col items-center gap-4 text-center" data-testid="ready-stamp">
            <div>
              <p className="text-4xl font-bold uppercase leading-none">+1 sello</p>
              {loyalty && (
                <p className="mt-1 text-sm font-medium opacity-90">
                  {filled} de {required} en tu tarjeta
                </p>
              )}
            </div>
            {loyalty && required <= 12 && (
              <div className="flex flex-wrap justify-center gap-2" aria-hidden="true">
                {Array.from({ length: required }, (_, index) => (
                  <span
                    key={index}
                    className={[
                      'h-6 w-6 rounded-full border-2',
                      index < filled ? 'border-cream bg-cream' : 'border-cream/75',
                      index === filled - 1 ? 'scale-125' : '',
                    ].join(' ')}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-cream/40 px-5 py-4 text-center" data-testid="ready-guest-invite">
            <p className="font-semibold">Guarda tus sellos</p>
            <p className="mt-1 text-sm opacity-90">Con una cuenta sumas un sello en cada pedido.</p>
            <Link
              href="/account/signup"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-cream px-5 font-semibold text-terracotta-700"
            >
              Crear cuenta
            </Link>
          </div>
        )}

        <div className="mt-auto pt-10 text-center">
          <button
            type="button"
            className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            aria-expanded={showDetails}
            onClick={() => setShowDetails((open) => !open)}
          >
            {showDetails ? 'Ocultar detalle del pedido' : 'Ver detalle del pedido'}
          </button>
          {showDetails && (
            <div className="mt-3 rounded-3xl bg-cream px-5 py-4 text-left text-foreground">
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <p className="font-medium">
                      {item.quantity} × {item.item_name_snapshot}
                    </p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {item.modifiers.map((modifier) => modifier.option_name_snapshot).join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium tabular-nums">{formatMoney(order.total_cents, order.currency)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
