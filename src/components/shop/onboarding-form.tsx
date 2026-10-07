'use client'

import { useState } from 'react'
import { createShop } from '@/server/actions/shops'

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
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Crea tu cafeteria
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Configura los datos basicos. Puedes completar el resto despues.
        </p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
              Nombre de la cafeteria
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
              URL de tu menu
            </label>
            <div className="mt-1 flex rounded-lg border border-zinc-300 shadow-sm">
              <span className="inline-flex items-center rounded-l-lg border-r border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
                solocafe.app/
              </span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                className="block w-full rounded-r-lg px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="mi-cafeteria"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-zinc-700">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="MXN"
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              >
                <option value="MXN">MXN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-zinc-700">
                Idioma
              </label>
              <select
                id="locale"
                name="locale"
                defaultValue="es"
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              >
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-zinc-700">
              Zona horaria
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue="America/Mexico_City"
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            >
              <option value="America/Mexico_City">Ciudad de Mexico</option>
              <option value="America/New_York">Nueva York</option>
              <option value="Europe/Madrid">Madrid</option>
              <option value="Europe/Berlin">Berlin</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-zinc-700">
              Direccion
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear cafeteria'}
          </button>
        </form>
      </div>
    </main>
  )
}
