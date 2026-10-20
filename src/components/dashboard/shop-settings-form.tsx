'use client'

import { useState } from 'react'
import { updateShopSettings } from '@/server/actions/shops'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Shop, OperatingHours, OperatingHoursDay } from '@/types'

const DEFAULT_DAY: OperatingHoursDay = { is_open: true, open: '07:00', close: '20:00' }

const DAYS: { key: keyof OperatingHours; label: string }[] = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
]

function settingsError(err: unknown) {
  const message = err instanceof Error ? err.message : ''
  if (message.includes('hours_invalid')) {
    return 'Revisa el horario: la hora de cierre tiene que ser después de la apertura.'
  }
  const start = message.indexOf('[')
  if (start >= 0) {
    try {
      const parsed = JSON.parse(message.slice(start))
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') && parsed.length > 0) {
        return parsed.join(' ')
      }
    } catch {
      return 'No se pudieron guardar los cambios. Revisa los datos e intenta de nuevo.'
    }
  }
  return 'No se pudieron guardar los cambios. Revisa los datos e intenta de nuevo.'
}

export function ShopSettingsForm({ shopId, shop }: { shopId: string; shop: Shop }) {
  const [name, setName] = useState(shop.name)
  const [slug, setSlug] = useState(shop.slug)
  const [timezone, setTimezone] = useState(shop.timezone)
  const [currency, setCurrency] = useState(shop.currency)
  const [locale, setLocale] = useState(shop.locale)
  const [address, setAddress] = useState(shop.address ?? '')
  const [lat, setLat] = useState(shop.lat == null ? '' : String(shop.lat))
  const [lng, setLng] = useState(shop.lng == null ? '' : String(shop.lng))
  const [hours, setHours] = useState<OperatingHours>(shop.operating_hours as OperatingHours)
  const [slotDuration, setSlotDuration] = useState(shop.slot_duration_minutes)
  const [slotCapacity, setSlotCapacity] = useState(shop.slot_capacity)
  const [prepBuffer, setPrepBuffer] = useState(shop.prep_time_buffer_minutes)
  const [maxDaysAhead, setMaxDaysAhead] = useState(shop.max_days_ahead)
  const [acceptingPickup, setAcceptingPickup] = useState(shop.accepting_pickup !== false)
  const [stampsRequired, setStampsRequired] = useState(shop.loyalty_stamps_required ?? 10)
  const [rewardText, setRewardText] = useState(shop.loyalty_reward_text ?? 'Un artículo gratis')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'ok' | 'error'>('ok')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await updateShopSettings(shopId, {
        name,
        slug,
        timezone,
        currency,
        locale,
        address,
        lat: lat.trim() === '' ? null : Number(lat),
        lng: lng.trim() === '' ? null : Number(lng),
        operating_hours: hours,
        slot_duration_minutes: slotDuration,
        slot_capacity: slotCapacity,
        prep_time_buffer_minutes: prepBuffer,
        max_days_ahead: maxDaysAhead,
        accepting_pickup: acceptingPickup,
        loyalty_stamps_required: stampsRequired,
        loyalty_reward_text: rewardText.trim(),
      })
      setMessageTone('ok')
      setMessage('Cambios guardados')
    } catch (err) {
      setMessageTone('error')
      setMessage(settingsError(err))
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
          <CardTitle>Datos de la cafetería</CardTitle>
          <CardDescription>Nombre, moneda y zona horaria. La URL pública usa el identificador.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="shopName">Nombre</Label>
            <Input id="shopName" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="slug">Identificador del enlace</Label>
            <Input
              id="slug"
              value={slug}
              pattern="[a-z0-9-]+"
              onChange={(e) => setSlug(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
            >
              <option value="MXN">MXN</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <Label htmlFor="locale">Idioma</Label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="timezone">Zona horaria</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
            >
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/New_York">Nueva York</option>
              <option value="Europe/Madrid">Madrid</option>
              <option value="Europe/Berlin">Berlín</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
            />
          </div>
          <div>
            <Label htmlFor="lat">Latitud</Label>
            <Input
              id="lat"
              type="number"
              inputMode="decimal"
              step="any"
              min={-90}
              max={90}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="19.432608"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitud</Label>
            <Input
              id="lng"
              type="number"
              inputMode="decimal"
              step="any"
              min={-180}
              max={180}
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-99.133209"
              className="mt-1.5"
            />
          </div>
          <p className="sm:col-span-2 text-sm text-muted-foreground">
            Opcional. Con estas coordenadas tu cafetería se ordena por cercanía en Explorar.
          </p>
        </CardContent>
      </Card>

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
          <CardTitle>Tarjeta de sellos</CardTitle>
          <CardDescription>
            Cada pedido pagado suma un sello. Cuando el cliente completa la tarjeta, puede canjear un artículo gratis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="stampsRequired">Sellos para la recompensa</Label>
            <Input
              id="stampsRequired"
              type="number"
              min={1}
              max={50}
              value={stampsRequired}
              onChange={(e) => setStampsRequired(Number(e.target.value))}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="rewardText">Texto de la recompensa</Label>
            <Input
              id="rewardText"
              value={rewardText}
              maxLength={80}
              onChange={(e) => setRewardText(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
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
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            messageTone === 'ok' ? 'bg-cream text-terracotta-800 border border-terracotta-200' : 'bg-danger/10 text-danger'
          }`}
        >
          {message}
        </div>
      )}

      <Button type="submit" loading={saving}>
        Guardar cambios
      </Button>
    </form>
  )
}
