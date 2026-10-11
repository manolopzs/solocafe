'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { accountSignupAction } from '@/server/actions/account-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default function AccountSignupPage() {
  const [state, formAction, pending] = useActionState(accountSignupAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen flex-col justify-center bg-surface px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Icon name="coffee" className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Solo Cafe</span>
        </Link>

        <Card variant="outline">
          <CardHeader className="text-center">
            <CardTitle>Crea tu cuenta</CardTitle>
            <CardDescription>Guarda tu historial y reordena tus favoritos en segundos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="María González"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="********"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {state?.error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
                >
                  <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/account/login" className="font-medium text-accent hover:text-accent/80">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
