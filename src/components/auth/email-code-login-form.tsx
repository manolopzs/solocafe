'use client'

import { useActionState, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/components/ui/notice'
import type { EmailCodeRequestState, EmailCodeVerifyState } from '@/lib/auth-flow'

type PasswordLoginState = { error?: string; email?: string } | null

type EmailCodeLoginFormProps = {
  variant: 'account' | 'owner'
  emailPlaceholder: string
  forgotPasswordHref: string
  requestCodeAction: (
    prevState: EmailCodeRequestState | null,
    formData: FormData,
  ) => Promise<EmailCodeRequestState>
  verifyCodeAction: (
    prevState: EmailCodeVerifyState | null,
    formData: FormData,
  ) => Promise<EmailCodeVerifyState>
  passwordLoginAction: (
    prevState: PasswordLoginState,
    formData: FormData,
  ) => Promise<PasswordLoginState>
}

export function EmailCodeLoginForm({
  variant,
  emailPlaceholder,
  forgotPasswordHref,
  requestCodeAction,
  verifyCodeAction,
  passwordLoginAction,
}: EmailCodeLoginFormProps) {
  const [mode, setMode] = useState<'code' | 'password'>('code')
  const [email, setEmail] = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [requestState, requestFormAction, requestPending] = useActionState(requestCodeAction, null)
  const [verifyState, verifyFormAction, verifyPending] = useActionState(verifyCodeAction, null)
  const [passwordState, passwordFormAction, passwordPending] = useActionState(passwordLoginAction, null)

  const requestedAt = requestState?.step === 'code' ? requestState.requestedAt : undefined
  const isCodeStep = mode === 'code' && requestState?.step === 'code' && !changingEmail
  const resendSeconds = requestedAt
    ? Math.min(30, Math.max(0, Math.ceil((requestedAt + 30_000 - now) / 1000)))
    : 0
  const formClassName = variant === 'account' ? 'mt-8 space-y-4' : 'space-y-4'

  useEffect(() => {
    if (!requestedAt) return

    const updateTime = () => setNow(Date.now())
    const initialUpdate = window.setTimeout(updateTime, 0)
    const interval = window.setInterval(updateTime, 1000)
    return () => {
      window.clearTimeout(initialUpdate)
      window.clearInterval(interval)
    }
  }, [requestedAt])

  const startRequest = () => {
    setChangingEmail(false)
    setNow(Date.now())
  }

  const modeToggle = (
    <p className="text-center text-sm">
      <button
        type="button"
        onClick={() => setMode(mode === 'code' ? 'password' : 'code')}
        className="inline-flex min-h-11 items-center justify-center font-medium text-accent underline underline-offset-2 hover:text-accent/80"
      >
        {mode === 'code' ? 'Log in with password instead' : 'Log in with email code'}
      </button>
    </p>
  )

  if (mode === 'password') {
    return (
      <div className={formClassName}>
        <form action={passwordFormAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={emailPlaceholder}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="current-password"
                placeholder={variant === 'account' ? 'Minimum 8 characters' : '********'}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} className="h-4 w-4" />
              </button>
            </div>
          </div>

          {passwordState?.error && <FormError variant={variant}>{passwordState.error}</FormError>}

          <Button type="submit" disabled={passwordPending} size={variant === 'account' ? 'lg' : 'default'} className="w-full">
            {passwordPending ? 'Logging in...' : 'Log in'}
          </Button>

          <p className="text-center text-sm">
            <Link href={forgotPasswordHref} className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
              Forgot your password?
            </Link>
          </p>
        </form>
        {modeToggle}
      </div>
    )
  }

  if (isCodeStep) {
    return (
      <div className={formClassName}>
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Code sent to <span className="font-medium text-foreground">{requestState.email}</span>
          </p>
          {requestState.message && <Notice tone="info">{requestState.message}</Notice>}
        </div>

        <form action={verifyFormAction} className="space-y-4">
          <input type="hidden" name="email" value={requestState.email} />
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="123456"
              required
              className="mt-1.5 tracking-[0.35em]"
            />
          </div>

          {verifyState?.error && <FormError variant={variant}>{verifyState.error}</FormError>}

          <Button type="submit" disabled={verifyPending} size={variant === 'account' ? 'lg' : 'default'} className="w-full">
            {verifyPending ? 'Verifying...' : 'Log in'}
          </Button>
        </form>

        <form action={requestFormAction} onSubmit={startRequest} className="space-y-1">
          <input type="hidden" name="email" value={requestState.email} />
          {requestState.error && <FormError variant={variant}>{requestState.error}</FormError>}
          <button
            type="submit"
            disabled={requestPending || resendSeconds > 0}
            className="inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-accent underline underline-offset-2 hover:text-accent/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : requestPending ? 'Sending code...' : 'Resend code'}
          </button>
        </form>

        <p className="text-center text-sm">
          <button
            type="button"
            onClick={() => setChangingEmail(true)}
            className="inline-flex min-h-11 items-center justify-center font-medium text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Use a different email
          </button>
        </p>
        {modeToggle}
      </div>
    )
  }

  return (
    <div className={formClassName}>
      <form action={requestFormAction} onSubmit={startRequest} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={emailPlaceholder}
            className="mt-1.5"
          />
        </div>

        {requestState?.error && <FormError variant={variant}>{requestState.error}</FormError>}

        <Button type="submit" disabled={requestPending} size={variant === 'account' ? 'lg' : 'default'} className="w-full">
          {requestPending ? 'Sending code...' : 'Send login code'}
        </Button>
      </form>
      {modeToggle}
    </div>
  )
}

function FormError({ variant, children }: { variant: 'account' | 'owner'; children: ReactNode }) {
  if (variant === 'account') return <Notice tone="danger">{children}</Notice>

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
    >
      <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
