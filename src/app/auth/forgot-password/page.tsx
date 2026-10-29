'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card variant="outline">
          <CardHeader className="text-center">
            <CardTitle>Recupera tu contraseña</CardTitle>
            <CardDescription>
              Introduce tu correo y te enviaremos un enlace para restablecerla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success ? (
              <div
                role="status"
                className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success"
              >
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.success}</span>
              </div>
            ) : (
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
                  {pending ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </form>
            )}

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
