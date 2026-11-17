'use client'

import { Suspense, useActionState, useState } from 'react'
import Link from 'next/link'
import { accountLoginAction } from '@/server/actions/account-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { CUSTOMER_HOME_PATH } from '@/lib/site'
import { Notice } from '@/components/ui/notice'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { ResetSuccessNotice } from '@/components/auth/reset-success-notice'

export default function AccountLoginPage() {
  const [state, formAction, pending] = useActionState(accountLoginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen flex-col bg-background px-5 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <Link href={CUSTOMER_HOME_PATH} className="inline-flex min-h-11 items-center self-start" aria-label="Solo Café, inicio">
          <SoloCafeWordmark height={24} />
        </Link>

        <h1 className="mt-10 text-[2rem] font-medium leading-tight tracking-tight text-heading">Inicia sesión</h1>
        <p className="mt-2 text-base leading-6 text-muted-foreground">Accede a tu cuenta para ver tus pedidos y repetirlos.</p>

        <form action={formAction} className="mt-8 space-y-4">
          <Suspense fallback={null}>
            <ResetSuccessNotice />
          </Suspense>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" className="mt-1.5" />
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
                autoComplete="current-password"
                placeholder="Mínimo 8 caracteres"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} className="h-4 w-4" />
              </button>
            </div>
          </div>

          {state?.error && <Notice tone="danger">{state.error}</Notice>}

          <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-center text-sm">
            <Link href="/auth/forgot-password?from=account" className="font-medium text-accent underline underline-offset-2">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/account/signup" className="font-medium text-accent underline underline-offset-2">
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  )
}
