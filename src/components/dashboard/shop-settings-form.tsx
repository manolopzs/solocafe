'use client'

import { useState } from 'react'
import { updateShopSettings } from '@/server/actions/shops'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Shop, OperatingHours, OperatingHoursDay } from '@/types'

const DAYS: { key: keyof OperatingHours; label: string }[] = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
]

const DEFAULT_DAY: OperatingHoursDay = { is_open: true, open: '07:00', close: '20:00' }

export function ShopSettingsForm({ shopId, shop }: { shopId: string; shop: Shop }) {
  const [hours, setHours] = useState<OperatingHours>(shop.operating_hours as OperatingHours)
  const [slotDuration, setSlotDuration] = useState(shop.slot_duration_minutes)
  const [slotCapacity, setSlotCapacity] = useState(shop.slot_capacity)
  const [prepBuffer, setPrepBuffer] = useState(shop.prep_time_buffer_minutes)
  const [maxDaysAhead, setMaxDaysAhead] = useState(shop.max_days_ahead)
  const [acceptingPickup, setAcceptingPickup] = useState(shop.accepting_pickup !== false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await updateShopSettings(shopId, {
        operating_hours: hours,
        slot_duration_minutes: slotDuration,
        slot_capacity: slotCapacity,
        prep_time_buffer_minutes: prepBuffer,
        max_days_ahead: maxDaysAhead,
        accepting_pickup: acceptingPickup,
      })
      setMessage('Cambios guardados')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function updateDay(key: keyof OperatingHours, patch: Partial<OperatingHoursDay>) {
    setHours((prev) => ({ ...prev, [key]: { ...(prev[key] ?? DEFAULT_DAY), ...patch } }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Horarios de atención</CardTitle>
          <CardDescription>Define cuándo pueden hacer pedidos programados tus clientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            <input
              type="checkbox"
              checked={acceptingPickup}
              onChange={(event) => setAcceptingPickup(event.target.checked)}
              className="h-5 w-5 rounded border-border text-accent"
            />
            <span>
              <span className="block font-semibold text-foreground">Tomar pedidos para recoger</span>
              <span className="block text-sm text-muted-foreground">Desactívalo si hoy no puedes preparar pedidos.</span>
            </span>
          </label>
          {DAYS.map(({ key, label }) => {
            const day = hours[key] ?? DEFAULT_DAY
            return (
            <div key={key} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 sm:w-32">
                <input
                  id={`${key}-open`}
                  type="checkbox"
                  checked={day.is_open}
                  onChange={(e) => updateDay(key, { is_open: e.target.checked })}
                  className="h-5 w-5 rounded border-border text-accent"
                />
                <Label htmlFor={`${key}-open`} className="font-semibold text-foreground">
                  {label}
                </Label>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor={`${key}-start`} className="text-xs text-muted-foreground">
                    Apertura
                  </Label>
                  <Input
                    id={`${key}-start`}
                    type="time"
                    value={day.open}
                    disabled={!day.is_open}
                    onChange={(e) => updateDay(key, { open: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`${key}-end`} className="text-xs text-muted-foreground">
                    Cierre
                  </Label>
                  <Input
                    id={`${key}-end`}
                    type="time"
                    value={day.close}
                    disabled={!day.is_open}
                    onChange={(e) => updateDay(key, { close: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            )
          })}
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Configuración de horarios</CardTitle>
          <CardDescription>Ajusta la duración de cada slot y cuántos días adelante pueden pedir.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="slotDuration">Duración de slot (min)</Label>
            <Input
              id="slotDuration"
              type="number"
              min={5}
              max={120}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="slotCapacity">Pedidos por horario</Label>
            <Input
              id="slotCapacity"
              type="number"
              min={1}
              max={500}
              value={slotCapacity}
              onChange={(e) => setSlotCapacity(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="prepBuffer">Buffer de preparación (min)</Label>
            <Input
              id="prepBuffer"
              type="number"
              min={0}
              max={120}
              value={prepBuffer}
              onChange={(e) => setPrepBuffer(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="maxDaysAhead">Días máximos adelante</Label>
            <Input
              id="maxDaysAhead"
              type="number"
              min={1}
              max={30}
              value={maxDaysAhead}
              onChange={(e) => setMaxDaysAhead(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-xl bg-sage-100 px-4 py-3 text-sm text-sage-800">
          {message}
        </div>
      )}

      <Button type="submit" loading={saving}>
        Guardar cambios
      </Button>
    </form>
  )
}
