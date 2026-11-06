'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Sheet } from '@/components/ui/sheet'
import { checkoutBlockedCopy } from '@/lib/ordering'
import { QuantityStepper } from '@/components/order/quantity-stepper'
import { updateCustomerProfile } from '@/server/actions/customers'
import type { CartViewLine } from '@/components/order/cart-sheet'
import type { Customer, Shop } from '@/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isTestStripeKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  return key.startsWith('pk_test')
}

export function CheckoutSheet({
  open,
  onClose,
  shop,
  customer,
  lines,
  total,
  etaMinutes,
  blockedReason,
  previewError,
  onRefreshPreview,
  loading,
  error,
  rewardText,
  redeemLoyalty,
  onRedeemLoyalty,
  onQuantity,
  onRemove,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  shop: Shop
  customer: Customer | null
  lines: CartViewLine[]
  total: string
  etaMinutes?: number
  blockedReason: string | null
  previewError?: string | null
  onRefreshPreview?: () => void
  loading: boolean
  error: string | null
  rewardText?: string | null
  redeemLoyalty?: boolean
  onRedeemLoyalty?: (value: boolean) => void
  onQuantity: (index: number, quantity: number) => void
  onRemove: (index: number) => void
  onSubmit: (input: {
    customerName: string
    customerPhone: string
    customerEmail: string
    specialInstructions: string
    pickupType: 'asap'
    redeemLoyalty?: boolean
  }) => void
}) {
  const isSignedIn = customer !== null
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
  const [customerEmail, setCustomerEmail] = useState(customer?.email ?? '')
  const [editingIdentity, setEditingIdentity] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [savingPhone, setSavingPhone] = useState(false)

  const displayName = customer?.name?.trim() || customer?.email || 'tu cuenta'
  const needsPhone = isSignedIn && !customer?.phone && !customerPhone.trim()
  const asapBlocked = shop.ordering?.asap_available === false
  const testMode = isTestStripeKey()
  const blockedCopy = checkoutBlockedCopy(blockedReason)

  const validateEmail = (email: string) => {
    if (!email) return true
    return EMAIL_PATTERN.test(email)
  }

  const submit = async () => {
    setLocalError(null)

    const name = customerName.trim()
    const phone = customerPhone.trim()
    const email = customerEmail.trim()

    if (!isSignedIn || editingIdentity) {
      if (!name) {
        setLocalError('Introduce tu nombre para continuar')
        return
      }
    }

    if (!isSignedIn) {
      if (!phone && !email) {
        setLocalError('Introduce un teléfono o un correo de contacto')
        return
      }
    } else if (needsPhone) {
      if (!phone) {
        setLocalError('Añade tu teléfono para avisarte cuando esté listo')
        return
      }
    }

    if (!validateEmail(email)) {
      setLocalError('El correo no es válido')
      return
    }

    if (isSignedIn && customer && !customer.phone && phone) {
      setSavingPhone(true)
      try {
        const formData = new FormData()
        formData.set('name', name || customer.name || '')
        formData.set('phone', phone)
        await updateCustomerProfile(formData)
      } catch (err) {
        setSavingPhone(false)
        setLocalError(err instanceof Error ? err.message : 'No pudimos guardar tu teléfono')
        return
      }
      setSavingPhone(false)
    }

    const resolvedName =
      isSignedIn && !editingIdentity
        ? (customer?.name?.trim() || customer?.email || name)
        : name
    const resolvedPhone =
      isSignedIn && !editingIdentity ? (customer?.phone ?? phone) : phone

    onSubmit({
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      customerEmail: isSignedIn && !editingIdentity ? (email || customer?.email || '') : email,
      specialInstructions: '',
      pickupType: 'asap',
      redeemLoyalty,
    })
  }

  const canSubmit =
    lines.length > 0 && !loading && !savingPhone && !blockedReason && !asapBlocked

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tu pedido"
      position="bottom"
      className="sm:left-1/2 sm:right-auto sm:top-auto sm:w-full sm:max-w-[480px] sm:-translate-x-1/2 sm:rounded-t-[1.75rem]"
      footer={
        <div className="space-y-3">
          {testMode && (
            <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-5 text-foreground">
              Pago de prueba con tarjeta. No se hace ningún cargo real.
            </p>
          )}
          {(localError || error || previewError) && (
            <Notice tone="danger">
              {localError || error || previewError}
            </Notice>
          )}
          {previewError && onRefreshPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefreshPreview}
              className="w-full"
            >
              Reintentar
            </Button>
          )}
          <Button
            onClick={() => void submit()}
            disabled={!canSubmit}
            loading={loading || savingPhone}
            size="lg"
            className="w-full touch-manipulation"
          >
            Pagar {total}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {!isSignedIn && (
          <div className="rounded-2xl bg-surface px-4 py-3.5 text-sm leading-6 text-foreground">
            ¿Quieres pedir más rápido la próxima vez?{' '}
            <Link href="/account/signup" className="font-medium text-accent underline-offset-2 hover:underline">
              Crea una cuenta
            </Link>
          </div>
        )}

        {lines.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Tu pedido está vacío. Añade algo del menú.
          </p>
        ) : (
          <section>
            <ul className="divide-y divide-border border-y border-border">
              {lines.map((line, index) => (
                <li key={line.key} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{line.name}</p>
                      {line.detail && <p className="mt-0.5 text-sm text-muted-foreground">{line.detail}</p>}
                      {line.unavailable && (
                        <span className="mt-2 inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                          Ya no disponible
                        </span>
                      )}
                      <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{line.lineTotal}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-danger"
                      aria-label={`Eliminar ${line.name}`}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <QuantityStepper
                      value={line.quantity}
                      onDecrease={() => onQuantity(index, line.quantity - 1)}
                      onIncrease={() => onQuantity(index, line.quantity + 1)}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-base font-medium tabular-nums text-foreground">{total}</span>
            </p>
          </section>
        )}

        <div className="rounded-2xl bg-surface px-4 py-3.5">
          <p className="text-sm font-medium text-foreground">Recogida</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo antes posible
            {etaMinutes !== undefined && etaMinutes > 0 && ` · ~${etaMinutes} min`}
          </p>
        </div>

        <div className="space-y-3">
          {isSignedIn && !editingIdentity ? (
            <>
              <p className="rounded-2xl bg-surface px-4 py-3.5 text-sm text-foreground">
                Pedido para <span className="font-medium">{displayName}</span>
                {' · '}
                <button
                  type="button"
                  onClick={() => setEditingIdentity(true)}
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  cambiar
                </button>
              </p>
              {needsPhone && (
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-foreground">
                    Teléfono <span className="text-muted-foreground">*</span>
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
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          {(!isSignedIn || editingIdentity) && (
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
          )}

          {isSignedIn && editingIdentity && (
            <button
              type="button"
              onClick={() => {
                setEditingIdentity(false)
                setCustomerName(customer?.name ?? '')
                setCustomerPhone(customer?.phone ?? '')
                setCustomerEmail(customer?.email ?? '')
              }}
              className="text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              Usar datos guardados
            </button>
          )}
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

        {blockedCopy && (
          <Notice tone="danger">{blockedCopy}</Notice>
        )}
      </div>
    </Sheet>
  )
}
