'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/ordering'
import { PickupCode } from '@/components/order/pickup-code'
import { BarHandoff } from '@/components/order/bar-handoff'
import type { Order, OrderItem, OrderItemModifier, OrderStatus } from '@/types'

type ReadyOrder = Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }

/** The order status page switches to the Ready takeover while the order is ready. */
export function showsReadyScreen(status: OrderStatus): boolean {
  return status === 'ready'
}

/** First word of the name the customer gave at checkout, or null if none. */
export function readyFirstName(customerName: string | null | undefined): string | null {
  const first = customerName?.trim().split(/\s+/)[0]
  return first ? first : null
}

/**
 * Full-screen "Ready" takeover for the order status page (mocks 06 and 07).
 * It sits above the customer tab bar (z-40), so the tab bar and "Notify me"
 * are out of the way once the order is ready.
 *
 * Stamps: the API awards one stamp when an order with a customer account is
 * paid (LoyaltyStamp.award_paid_order!). This screen only reflects that rule.
 */
export function OrderReadyScreen({ order, menuHref }: { order: ReadyOrder; menuHref: string }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showAtBar, setShowAtBar] = useState(false)
  const closeBar = useCallback(() => setShowAtBar(false), [])
  const name = readyFirstName(order.customer_name)
  const signedIn = Boolean(order.customer_id)
  const loyalty = order.loyalty
  const required = loyalty ? Math.max(loyalty.stamps_required, 1) : 0
  const filled = loyalty ? Math.min(Math.max(loyalty.stamps, 0), required) : 0
  const shopName = order.shop?.name ?? loyalty?.shop_name

  return (
    <main
      className="fixed inset-0 z-50 overflow-y-auto bg-listo-bg text-foreground motion-safe:animate-[fade-in_200ms_ease-out]"
      data-testid="order-ready-screen"
      aria-live="polite"
    >
      <div className="phone-col flex min-h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+72px)] pt-[env(safe-area-inset-top)]">
        <div className="flex h-12 items-center justify-between text-body-sm font-semibold">
          <span className="truncate">{shopName}</span>
          <Link href={menuHref} className="-mr-1 inline-flex min-h-11 items-center px-1">
            Close
          </Link>
        </div>

        <h1
          className="mt-10 break-words text-display text-foreground motion-safe:animate-[title-in_320ms_ease-out_80ms_both]"
        >
          {name ? `Ready, ${name}!` : 'Ready!'}
        </h1>
        <p className="mt-2 text-body-lg text-listo-muted">Your order is ready. Come pick it up.</p>

        <div className="mt-8 motion-safe:animate-[code-in_360ms_ease-out_160ms_both]">
          <PickupCode
            orderId={order.id}
            size="lg"
            hint="Say it, or tap to show this at the counter"
            onTap={() => setShowAtBar(true)}
            data-testid="open-bar-handoff"
          />
        </div>

        {signedIn ? (
          <section className="mt-3 rounded-code bg-listo-card px-5 pb-5 pt-5" data-testid="ready-stamp">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[22px] font-semibold leading-7 tracking-[-0.015em]">+1 stamp</p>
              {loyalty && (
                <p className="text-body-sm text-listo-muted">
                  {filled} of {required}
                </p>
              )}
            </div>
            {loyalty && required <= 12 && (
              <div className="mt-4 flex justify-between" aria-hidden="true">
                {Array.from({ length: required }, (_, index) => (
                  <span
                    key={index}
                    data-new={index === filled - 1 ? 'true' : undefined}
                    className={[
                      'h-6 w-6 rounded-full border-2',
                      index < filled ? 'border-foreground bg-foreground' : 'border-foreground/60',
                      index === filled - 1
                        ? 'outline outline-2 outline-offset-[3px] outline-foreground motion-safe:animate-[fade-in_400ms_ease-out_520ms_both]'
                        : '',
                    ].join(' ')}
                  />
                ))}
              </div>
            )}
            {loyalty && shopName && <p className="mt-4 text-body-sm text-listo-muted">Your {shopName} stamp card</p>}
          </section>
        ) : (
          <section
            className="mt-3 flex items-center justify-between gap-4 rounded-code bg-listo-card px-5 py-5"
            data-testid="ready-guest-invite"
          >
            <div className="min-w-0">
              <p className="text-h3">Save your stamps</p>
              <p className="mt-1 max-w-[30ch] text-body-sm text-listo-muted [text-wrap:balance]">
                With an account, every order earns a stamp.
              </p>
            </div>
            <Link
              href="/account/signup"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-[15px] font-semibold text-background"
            >
              Sign up
            </Link>
          </section>
        )}

        {showDetails && (
          <div className="mt-3 rounded-code bg-listo-card px-5 py-4 text-left text-foreground" data-testid="ready-details">
            <ul className="divide-y divide-foreground/10">
              {order.items.map((item) => (
                <li key={item.id} className="py-2.5">
                  <p className="font-medium">
                    {item.quantity} × {item.item_name_snapshot}
                  </p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-body-sm text-listo-muted">
                      {item.modifiers.map((modifier) => modifier.option_name_snapshot).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-foreground/10 pt-3">
              <span className="text-listo-muted">Total</span>
              <span className="font-semibold tabular-nums">{formatMoney(order.total_cents, order.currency, order.shop?.locale)}</span>
            </div>
          </div>
        )}
      </div>

      {/* N3: a secondary exit, fixed at safe area + 8 so it sits in the same place with or without an account. */}
      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+8px)] z-10 flex justify-center">
        <button
          type="button"
          className="inline-flex min-h-12 items-center px-3 text-body-sm font-semibold underline underline-offset-4"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? 'Hide order details' : 'View order details'}
        </button>
      </div>
      {showAtBar && (
        <BarHandoff
          orderId={order.id}
          shopName={shopName}
          customerName={order.customer_name?.trim() || null}
          items={order.items.map((item) => ({ id: item.id, quantity: item.quantity, name: item.item_name_snapshot }))}
          onClose={closeBar}
        />
      )}
    </main>
  )
}
