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
import { loginFlowFrom, loginPathFor } from '@/lib/auth-flow'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const flow = loginFlowFrom(searchParams.get('from'))
  const [state, formAction, pending] = useActionState(resetPasswordAction, null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card variant="outline">
          <CardHeader className="text-center">
            <CardTitle>New password</CardTitle>
            <CardDescription>Enter your new password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              {flow === 'account' && <input type="hidden" name="from" value="account" />}

              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="passwordConfirmation">Repeat password</Label>
                <Input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
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
                {pending ? 'Saving...' : 'Save password'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link href={loginPathFor(flow)} className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                Back to log in
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
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center px-6 py-12 text-sm text-muted-foreground">Loading...</main>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
