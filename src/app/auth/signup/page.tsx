'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/server/actions/auth'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null)

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Registrate para comenzar a recibir pedidos.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Correo electronico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              placeholder="tu@cafeteria.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Contrasena
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              placeholder="********"
            />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-medium text-zinc-900 underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
