'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, formAction, pending] = useActionState(resetPasswordAction, null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card variant="outline">
          <CardHeader className="text-center">
            <CardTitle>Nueva contraseña</CardTitle>
            <CardDescription>Introduce tu nueva contraseña para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="passwordConfirmation">Repite la contraseña</Label>
                <Input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="mt-1.5"
                />
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

              <Button type="submit" disabled={pending || !token} className="w-full">
                {pending ? 'Guardando...' : 'Guardar contraseña'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="font-medium text-accent hover:text-accent/80">
                Volver al inicio de sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center px-6 py-12 text-sm text-muted-foreground">Cargando...</main>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
