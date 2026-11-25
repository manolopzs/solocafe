'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { loginAction, requestLoginCodeAction, verifyLoginCodeAction } from '@/server/actions/auth'
import { EmailCodeLoginForm } from '@/components/auth/email-code-login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { ResetSuccessNotice } from '@/components/auth/reset-success-notice'

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      <section className="flex flex-col justify-center bg-surface px-5 pb-8 pt-4 lg:px-16 lg:py-12 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Solo Café, home">
            <SoloCafeWordmark height={24} />
          </Link>

          <h1 className="mt-10 text-h1 text-heading sm:text-4xl">
            Your coffee, closer to your customers
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Receive orders ahead of time, cut queues and connect with the people who choose you.
          </p>

          <ul className="mt-6">
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Orders organized in real time</span>
            </li>
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Payment and pickup without complications</span>
            </li>
            <li className="flex min-h-7 items-center gap-2 text-body-sm text-foreground">
              <Icon name="check" className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.25} />
              <span>Digital menu ready in minutes</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-1 items-start justify-center px-5 pb-10 pt-6 lg:items-center lg:px-16 lg:py-12 xl:px-24">
        <div className="w-full max-w-sm">
          <Card variant="outline" className="max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent">
            <CardHeader className="max-sm:px-0 max-sm:pt-0 sm:text-center">
              <CardTitle className="!text-h2 text-heading">Log in to your account</CardTitle>
              <CardDescription className="mt-2 text-body-sm">We&apos;ll email you a 6-digit code to continue.</CardDescription>
            </CardHeader>
            <CardContent className="max-sm:px-0 max-sm:pb-0">
              <div className="mb-4">
                <Suspense fallback={null}>
                  <ResetSuccessNotice />
                </Suspense>
              </div>

              <EmailCodeLoginForm
                variant="owner"
                emailPlaceholder="you@cafeteria.com"
                forgotPasswordHref="/auth/forgot-password"
                requestCodeAction={requestLoginCodeAction}
                verifyCodeAction={verifyLoginCodeAction}
                passwordLoginAction={loginAction}
              />

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                  Sign up free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
