'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-espresso-700 text-white shadow-md"
          >
            <Icon name="coffee" className="h-6 w-6" />
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Entra a tu cuenta</CardTitle>
            <CardDescription>Ingresa tu correo y contrasena para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@cafeteria.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="********"
                  className="mt-1.5"
                />
              </div>

              {state?.error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
                  {state.error}
                </div>
              )}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              No tienes cuenta?{' '}
              <Link href="/auth/signup" className="font-medium text-espresso-700 hover:underline">
                Crear cuenta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
