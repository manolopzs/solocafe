'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { accountLoginAction, requestAccountCodeAction, verifyAccountCodeAction } from '@/server/actions/account-auth'
import { EmailCodeLoginForm } from '@/components/auth/email-code-login-form'
import { CUSTOMER_HOME_PATH } from '@/lib/site'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { ResetSuccessNotice } from '@/components/auth/reset-success-notice'

export default function AccountLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background px-5 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <Link href={CUSTOMER_HOME_PATH} className="inline-flex min-h-11 items-center self-start" aria-label="Solo Café, home">
          <SoloCafeWordmark height={24} />
        </Link>

        <h1 className="mt-10 text-[2rem] font-medium leading-tight tracking-tight text-heading">Log in</h1>
        <p className="mt-2 text-base leading-6 text-muted-foreground">Access your account to see your orders and reorder them.</p>

        <Suspense fallback={null}>
          <ResetSuccessNotice />
        </Suspense>

        <EmailCodeLoginForm
          variant="account"
          emailPlaceholder="you@email.com"
          forgotPasswordHref="/auth/forgot-password?from=account"
          requestCodeAction={requestAccountCodeAction}
          verifyCodeAction={verifyAccountCodeAction}
          passwordLoginAction={accountLoginAction}
        />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/account/signup" className="font-medium text-accent underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
