'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      <section className="flex flex-col justify-center bg-surface px-6 py-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon name="coffee" className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Solo Cafe</span>
          </Link>

          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Tu café, más cerca de tus clientes
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Recibe pedidos anticipados, reduce filas y conecta con quienes te eligen.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3 text-sm text-foreground">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Pedidos organizados en tiempo real</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-foreground">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Pago y recogida sin complicaciones</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-foreground">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Menú digital listo en minutos</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm">
          <Card variant="outline">
            <CardHeader className="text-center">
              <CardTitle>Entra a tu cuenta</CardTitle>
              <CardDescription>Ingresa tu correo y contraseña para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
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
                  {pending ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signup" className="font-medium text-accent hover:text-accent/80">
                  Crear cuenta gratis
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
