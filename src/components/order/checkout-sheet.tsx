'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { getPublicPickupSlots } from '@/server/queries/menu'
import { checkoutBlockedCopy } from '@/lib/ordering'
import type { CartViewLine } from '@/components/order/cart-sheet'
import type { Customer, PickupSlot, Shop } from '@/types'

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function stripeTestMode() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  return key.length === 0 || key.startsWith('pk_test')
}

export function CheckoutSheet({
  open,
  onClose,
  shop,
  customer,
  lines,
  total,
  blockedReason,
  pickupType,
  onPickupType,
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
  pickupType: 'asap' | 'scheduled'
  onPickupType: (value: 'asap' | 'scheduled') => void
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
    pickupType: 'asap' | 'scheduled'
    pickupSlotDate?: string
    pickupSlotStartTime?: string
    redeemLoyalty?: boolean
  }) => void
}) {
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
  const [customerEmail, setCustomerEmail] = useState(customer?.email ?? '')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))
  const [slots, setSlots] = useState<PickupSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null)
  const [loadedSlotKey, setLoadedSlotKey] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const blockedCopy = checkoutBlockedCopy(blockedReason)
  const asapBlocked = shop.ordering?.asap_available === false
  const slotKey = open && pickupType === 'scheduled' ? `${shop.id}:${selectedDate}` : ''
  const slotsLoading = Boolean(slotKey) && loadedSlotKey !== slotKey
  const visibleSlots = loadedSlotKey === slotKey ? slots : []
  const testMode = stripeTestMode()

  useEffect(() => {
    if (!slotKey) return
    let cancelled = false
    getPublicPickupSlots(shop.id, selectedDate)
      .then((data) => {
        if (cancelled) return
        setSlots(data)
        setSelectedSlot((prev) => {
          if (prev && data.find((slot) => slot.start_time === prev.start_time)) return prev
          return data.find((slot) => slot.available > 0) ?? null
        })
        setLoadedSlotKey(slotKey)
      })
      .catch(() => {
        if (cancelled) return
        setSlots([])
        setSelectedSlot(null)
        setLoadedSlotKey(slotKey)
      })
    return () => {
      cancelled = true
    }
  }, [slotKey, selectedDate, shop.id])

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
    if (pickupType === 'scheduled' && !selectedSlot) {
      setLocalError('Selecciona un horario de recogida')
      return
    }
    setLocalError(null)
    onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: email,
      specialInstructions: specialInstructions.trim(),
      pickupType,
      pickupSlotDate: pickupType === 'scheduled' ? selectedDate : undefined,
      pickupSlotStartTime: pickupType === 'scheduled' ? selectedSlot?.start_time : undefined,
      redeemLoyalty,
    })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Recoger"
      position="bottom"
      footer={
        <div className="space-y-3">
          {testMode && (
            <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-5 text-foreground">
              Pago de prueba con tarjeta. No se hace ningún cargo real.
            </p>
          )}
          <Button
            onClick={submit}
            disabled={Boolean(blockedReason)}
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
            placeholder="Para avisarte cuando esté listo"
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
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={asapBlocked}
              onClick={() => onPickupType('asap')}
              className={[
                'min-h-16 rounded-2xl border px-3.5 py-3 text-left text-sm transition-colors disabled:opacity-50',
                pickupType === 'asap'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
              ].join(' ')}
            >
              <span className="block font-medium">Lo antes posible</span>
              <span className="mt-0.5 block text-xs opacity-80">{asapBlocked ? 'No disponible ahora' : 'Lo preparamos ya'}</span>
            </button>
            <button
              type="button"
              onClick={() => onPickupType('scheduled')}
              className={[
                'min-h-16 rounded-2xl border px-3.5 py-3 text-left text-sm transition-colors',
                pickupType === 'scheduled'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
              ].join(' ')}
            >
              <span className="block font-medium">Programado</span>
              <span className="mt-0.5 block text-xs opacity-80">Elige horario</span>
            </button>
          </div>
        </div>

        {pickupType === 'scheduled' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-foreground">
                Fecha
              </label>
              <Input
                id="pickupDate"
                type="date"
                value={selectedDate}
                min={formatDateInput(new Date())}
                max={formatDateInput(addDays(new Date(), shop.max_days_ahead))}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setSelectedSlot(null)
                }}
                className="mt-1.5"
              />
            </div>
            <div>
              <p className="block text-sm font-medium text-foreground">Horario</p>
              {slotsLoading ? (
                <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 rounded-2xl" />
                  ))}
                </div>
              ) : visibleSlots.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No hay horarios para esta fecha.</p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {visibleSlots.map((slot) => (
                    <button
                      key={slot.start_time}
                      type="button"
                      disabled={slot.available <= 0}
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        'min-h-12 rounded-2xl border px-2 py-2 text-center text-sm transition-colors touch-manipulation',
                        selectedSlot?.start_time === slot.start_time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : slot.available <= 0
                            ? 'border-transparent bg-surface text-muted-foreground'
                            : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                      ].join(' ')}
                    >
                      <span className="block font-medium tabular-nums">{slot.start_time}</span>
                      {slot.available <= 0 && <span className="block text-[11px]">Lleno</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
