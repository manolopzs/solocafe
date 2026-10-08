'use client'

import { useState } from 'react'
import { createShop } from '@/server/actions/shops'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      await createShop({
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        timezone: formData.get('timezone') as string,
        currency: formData.get('currency') as 'MXN' | 'EUR',
        locale: formData.get('locale') as 'es' | 'en',
        address: (formData.get('address') as string) || undefined,
      })
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Error al crear la cafeteria')
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-12">
      <Card variant="outline" className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-md">
            <Icon name="coffee" className="h-6 w-6" />
          </div>
          <CardTitle className="font-serif mt-4">Crea tu cafeteria</CardTitle>
          <CardDescription>Configura los datos basicos. Puedes completar el resto despues.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la cafeteria</Label>
              <Input id="name" name="name" type="text" required className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="slug">URL de tu menu</Label>
              <div className="mt-1.5 flex rounded-xl border border-warm-200 bg-paper shadow-sm">
                <span className="inline-flex items-center rounded-l-xl border-r border-warm-200 bg-warm-100 px-4 text-sm text-muted-foreground">
                  solocafe.app/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="mi-cafeteria"
                  className="block w-full rounded-r-xl bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue="MXN"
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
                  name="locale"
                  defaultValue="es"
                  className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
                >
                  <option value="es">Espanol</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Zona horaria</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue="America/Mexico_City"
                className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
              >
                <option value="America/Mexico_City">Ciudad de Mexico</option>
                <option value="America/New_York">Nueva York</option>
                <option value="Europe/Madrid">Madrid</option>
                <option value="Europe/Berlin">Berlin</option>
              </select>
            </div>

            <div>
              <Label htmlFor="address">Direccion</Label>
              <textarea
                id="address"
                name="address"
                rows={2}
                className="mt-1.5 block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? 'Creando...' : 'Crear cafeteria'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
