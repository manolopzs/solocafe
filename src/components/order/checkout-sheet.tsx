'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { getPublicPickupSlots } from '@/server/queries/menu'
import { checkoutBlockedCopy } from '@/lib/ordering'
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

export function CheckoutSheet({
  open,
  onClose,
  shop,
  customer,
  total,
  blockedReason,
  pickupType,
  onPickupType,
  loading,
  error,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  shop: Shop
  customer: Customer | null
  total: string
  blockedReason: string | null
  pickupType: 'asap' | 'scheduled'
  onPickupType: (value: 'asap' | 'scheduled') => void
  loading: boolean
  error: string | null
  onSubmit: (input: {
    customerName: string
    customerPhone: string
    specialInstructions: string
    pickupType: 'asap' | 'scheduled'
    pickupSlotDate?: string
    pickupSlotStartTime?: string
  }) => void
}) {
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
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
    if (pickupType === 'scheduled' && !selectedSlot) {
      setLocalError('Selecciona un horario de recogida')
      return
    }
    setLocalError(null)
    onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      specialInstructions: specialInstructions.trim(),
      pickupType,
      pickupSlotDate: pickupType === 'scheduled' ? selectedDate : undefined,
      pickupSlotStartTime: pickupType === 'scheduled' ? selectedSlot?.start_time : undefined,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Recoger" position="bottom" className="flex flex-col">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {!customer && (
            <div className="rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="text-foreground">
                ¿Quieres pedir más rápido la próxima vez?{' '}
                <Link href="/account/signup" className="font-bold text-accent hover:underline">
                  Crea una cuenta
                </Link>
              </p>
            </div>
          )}

          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-foreground">
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
            <label htmlFor="customerPhone" className="block text-sm font-semibold text-foreground">
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
            <label htmlFor="instructions" className="block text-sm font-semibold text-foreground">
              Instrucciones
            </label>
            <Textarea
              id="instructions"
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value)}
              placeholder="Ej: menos hielo, sin azúcar"
              rows={2}
              className="mt-1.5 resize-none"
            />
          </div>

          <div>
            <p className="block text-sm font-semibold text-foreground">Cuándo lo recoges</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={asapBlocked}
                onClick={() => onPickupType('asap')}
                className={[
                  'rounded-xl border px-4 py-3 text-left text-sm transition-all disabled:opacity-50',
                  pickupType === 'asap'
                    ? 'border-foreground bg-foreground text-primary-foreground'
                    : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                ].join(' ')}
              >
                <span className="block font-bold">Lo antes posible</span>
                <span className="block text-xs opacity-80">{asapBlocked ? 'No disponible ahora' : 'Lo preparamos ya'}</span>
              </button>
              <button
                type="button"
                onClick={() => onPickupType('scheduled')}
                className={[
                  'rounded-xl border px-4 py-3 text-left text-sm transition-all',
                  pickupType === 'scheduled'
                    ? 'border-foreground bg-foreground text-primary-foreground'
                    : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                ].join(' ')}
              >
                <span className="block font-bold">Programado</span>
                <span className="block text-xs opacity-80">Elige horario</span>
              </button>
            </div>
          </div>

          {pickupType === 'scheduled' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-semibold text-foreground">
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
                <p className="block text-sm font-semibold text-foreground">Horario</p>
                {slotsLoading ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">Cargando horarios...</p>
                ) : visibleSlots.length === 0 ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">No hay horarios para esta fecha.</p>
                ) : (
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {visibleSlots.map((slot) => (
                      <button
                        key={slot.start_time}
                        type="button"
                        disabled={slot.available <= 0}
                        onClick={() => setSelectedSlot(slot)}
                        className={[
                          'rounded-xl border px-2 py-2.5 text-center text-sm transition-all touch-manipulation',
                          selectedSlot?.start_time === slot.start_time
                            ? 'border-foreground bg-foreground text-primary-foreground'
                            : slot.available <= 0
                              ? 'border-border bg-surface text-muted-foreground'
                              : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                        ].join(' ')}
                      >
                        <span className="block font-bold">{slot.start_time}</span>
                        {slot.available <= 0 && <span className="block text-[0.6rem]">Lleno</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(localError || error || blockedCopy) && (
            <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
              <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
              {localError || error || blockedCopy}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-4 sm:p-6">
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
      </div>
    </Sheet>
  )
}
