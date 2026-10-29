'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Sheet } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { checkoutBlockedCopy } from '@/lib/ordering'
import type { CartViewLine } from '@/components/order/cart-sheet'
import type { Customer, Shop } from '@/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isTestStripeKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  return key.startsWith('pk_test')
}

function readyEstimateLabel(shop: Shop): string {
  const minutes = shop.prep_time_buffer_minutes ?? shop.estimated_ready_minutes ?? 5
  return `Listo en ~${minutes} min`
}

export function CheckoutSheet({
  open,
  onClose,
  shop,
  customer,
  lines,
  total,
  blockedReason,
  loading,
  error,
  rewardText,
  redeemLoyalty,
  onRedeemLoyalty,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  shop: Shop
  customer: Customer | null
  lines: CartViewLine[]
  total: string
  blockedReason: string | null
  loading: boolean
  error: string | null
  rewardText?: string | null
  redeemLoyalty?: boolean
  onRedeemLoyalty?: (value: boolean) => void
  onSubmit: (input: {
    customerName: string
    customerPhone: string
    customerEmail: string
    specialInstructions: string
    pickupType: 'asap'
    pickupSlotDate?: string
    pickupSlotStartTime?: string
    redeemLoyalty?: boolean
  }) => void
}) {
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
  const [customerEmail, setCustomerEmail] = useState(customer?.email ?? '')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const blockedCopy = checkoutBlockedCopy(blockedReason)
  const asapBlocked = shop.ordering?.asap_available === false
  const testMode = isTestStripeKey()

  const submit = () => {
    if (!customerName.trim()) {
      setLocalError('Ingresa tu nombre para continuar')
      return
    }
    const email = customerEmail.trim()
    if (email && !EMAIL_PATTERN.test(email)) {
      setLocalError('El correo no es válido')
      return
    }
    setLocalError(null)
    onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: email,
      specialInstructions: specialInstructions.trim(),
      pickupType: 'asap',
      redeemLoyalty,
    })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Recoger"
      position="bottom"
      className="sm:left-1/2 sm:right-auto sm:top-auto sm:w-full sm:max-w-[480px] sm:-translate-x-1/2 sm:rounded-t-[1.75rem]"
      footer={
        <div className="space-y-3">
          {testMode && (
            <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-5 text-foreground">
              Pago de prueba con tarjeta. No se hace ningún cargo real.
            </p>
          )}
          <Button
            onClick={submit}
            disabled={Boolean(blockedReason) || asapBlocked}
            loading={loading}
            size="lg"
            className="w-full touch-manipulation"
          >
            Pagar {total}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {!customer && (
          <div className="rounded-2xl bg-surface px-4 py-3.5 text-sm leading-6 text-foreground">
            ¿Quieres pedir más rápido la próxima vez?{' '}
            <Link href="/account/signup" className="font-medium text-accent underline-offset-2 hover:underline">
              Crea una cuenta
            </Link>
          </div>
        )}

        {lines.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-foreground">Tu pedido</h2>
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {lines.map((line) => (
                <li key={line.key} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {line.quantity} × {line.name}
                    </p>
                    {line.detail && <p className="mt-0.5 text-sm text-muted-foreground">{line.detail}</p>}
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-foreground">{line.lineTotal}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-base font-medium tabular-nums text-foreground">{total}</span>
            </p>
          </section>
        )}

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-foreground">
            Nombre
          </label>
          <Input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="¿Cómo te llaman?"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-foreground">
            Teléfono
          </label>
          <Input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Para avisarte cuando esté listo (+34)"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-foreground">
            Correo para el recibo
          </label>
          <Input
            id="customerEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Opcional"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-foreground">
            Instrucciones
          </label>
          <Textarea
            id="instructions"
            value={specialInstructions}
            onChange={(event) => setSpecialInstructions(event.target.value)}
            placeholder="Ej: leche de avena"
            rows={2}
            className="mt-1.5 resize-none"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-foreground">Cuándo lo recoges</p>
          <button
            type="button"
            disabled={asapBlocked}
            className="mt-2 min-h-16 w-full rounded-2xl border border-primary bg-primary px-3.5 py-3 text-left text-sm text-primary-foreground transition-colors disabled:opacity-50"
          >
            <span className="block font-medium">Lo antes posible</span>
            <span className="mt-0.5 block text-xs opacity-80">
              {asapBlocked ? 'No disponible ahora' : readyEstimateLabel(shop)}
            </span>
          </button>
        </div>

        {rewardText && (
          <label className="flex min-h-14 items-start gap-3 rounded-2xl bg-surface p-4 text-sm">
            <input
              type="checkbox"
              checked={redeemLoyalty === true}
              onChange={(event) => onRedeemLoyalty?.(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-border accent-[var(--primary)]"
            />
            <span>
              <span className="block font-semibold text-foreground">Canjear recompensa</span>
              <span className="block text-muted-foreground">{rewardText}. El descuento se calcula al crear el pedido.</span>
            </span>
          </label>
        )}

        {(localError || error || blockedCopy) && (
          <Notice tone="danger">{localError || error || blockedCopy}</Notice>
        )}
      </div>
    </Sheet>
  )
}
