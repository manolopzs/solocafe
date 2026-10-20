'use client'

import { useState } from 'react'
import { updateShopPersonality } from '@/server/actions/shops'
import { DISPLAY_FONTS, displayFontFamily } from '@/lib/display-fonts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Shop } from '@/types'

export function ShopPersonalityForm({ shopId, shop }: { shopId: string; shop: Shop }) {
  const [brandColor, setBrandColor] = useState(shop.brand_color)
  const [displayFont, setDisplayFont] = useState(shop.display_font || 'dm_sans')
  const [heroPreview, setHeroPreview] = useState<string | null>(shop.hero_photo_url)
  const [removeHero, setRemoveHero] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onHeroChange(file: File | undefined) {
    if (!file) return
    setRemoveHero(false)
    setHeroPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const formData = new FormData(event.currentTarget)
    if (removeHero) formData.set('remove_hero_photo', '1')

    const result = await updateShopPersonality(shopId, shop.slug, formData)
    if (result.error) setError(result.error)
    else setMessage('Personalidad guardada')
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Personalidad</CardTitle>
          <CardDescription>
            Foto, color y tipografía de tu página pública. El fondo crema de Solo Cafe se mantiene.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="hero_photo">Foto de portada</Label>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG o WebP. Hasta 5 MB.</p>
            {heroPreview && (
              <img
                src={heroPreview}
                alt={`Foto de portada de ${shop.name}`}
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            )}
            <Input
              id="hero_photo"
              name="hero_photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3"
              onChange={(event) => onHeroChange(event.target.files?.[0])}
            />
            {shop.hero_photo_url && (
              <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={removeHero}
                  onChange={(event) => {
                    setRemoveHero(event.target.checked)
                    if (event.target.checked) setHeroPreview(null)
                    else setHeroPreview(shop.hero_photo_url)
                  }}
                />
                Quitar foto
              </label>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="brand_color">Color de marca</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Se usa en acentos. Debe cumplir contraste WCAG AA sobre el fondo crema y con texto blanco.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="color"
                  value={safeColor(brandColor)}
                  onChange={(event) => setBrandColor(event.target.value)}
                  aria-label="Elegir color de marca"
                  className="h-12 w-14 cursor-pointer rounded-xl border border-border bg-surface-elevated"
                />
                <Input
                  id="brand_color"
                  name="brand_color"
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="display_font">Tipografía</Label>
              <p className="mt-1 text-sm text-muted-foreground">Para el nombre de tu cafetería.</p>
              <Select
                id="display_font"
                name="display_font"
                className="mt-3"
                value={displayFont}
                onChange={(event) => setDisplayFont(event.target.value)}
              >
                {DISPLAY_FONTS.map((font) => (
                  <option key={font.key} value={font.key}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-background p-4"
            style={{
              ['--accent' as string]: brandColor,
              ['--ring' as string]: brandColor,
              ['--font-display' as string]: displayFontFamily(displayFont),
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vista previa</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-accent">Bienvenido a</p>
            <p className="shop-display-font text-2xl font-semibold text-foreground">{shop.name}</p>
            <span className="mt-3 inline-flex rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              Para recoger
            </span>
          </div>

          {message && <p className="rounded-xl bg-sage-100 px-4 py-3 text-sm text-sage-800">{message}</p>}
          {error && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          <Button type="submit" loading={saving}>
            Guardar personalidad
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

function safeColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#8c3d25'
}
