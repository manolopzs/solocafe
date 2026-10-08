'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null)

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-md"
          >
            <Icon name="coffee" className="h-6 w-6" />
          </Link>
        </div>
        <Card variant="outline">
          <CardHeader className="text-center">
            <CardTitle className="font-serif">Crea tu cuenta</CardTitle>
            <CardDescription>Registrate para comenzar a recibir pedidos.</CardDescription>
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
                {pending ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-terracotta-600 hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
