'use client'

import { Suspense, useActionState } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { ResetSuccessNotice } from '@/components/auth/reset-success-notice'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      <section className="flex flex-col justify-center bg-surface px-5 pb-8 pt-4 lg:px-16 lg:py-12 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Solo Café, inicio">
            <SoloCafeWordmark height={24} />
          </Link>

          <h1 className="mt-10 text-h1 text-heading sm:text-4xl">
            Tu café, más cerca de tus clientes
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Recibe pedidos anticipados, reduce colas y conecta con quienes te eligen.
          </p>

          <ul className="mt-6">
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Pedidos organizados en tiempo real</span>
            </li>
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Pago y recogida sin complicaciones</span>
            </li>
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Menú digital listo en minutos</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-1 items-start justify-center px-5 pb-10 pt-6 lg:items-center lg:px-16 lg:py-12 xl:px-24">
        <div className="w-full max-w-sm">
          <Card variant="outline" className="max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent">
            <CardHeader className="max-sm:px-0 max-sm:pt-0 sm:text-center">
              <CardTitle className="!text-h2 text-heading">Entra en tu cuenta</CardTitle>
              <CardDescription className="mt-2 text-body-sm">Introduce tu correo y tu contraseña para continuar.</CardDescription>
            </CardHeader>
            <CardContent className="max-sm:px-0 max-sm:pb-0">
              <form action={formAction} className="space-y-4">
                <Suspense fallback={null}>
                  <ResetSuccessNotice />
                </Suspense>

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

                <p className="text-center text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signup" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
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
