'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api/client'
import { RATE_LIMITED_MESSAGE } from '@/lib/api/errors'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const FALLBACK_SUCCESS = "You're on the list. We'll let you know when the iOS app is out."
const INVALID_EMAIL = 'Enter a valid email address.'
const FALLBACK_ERROR = "We couldn't add you to the list. Please try again."
// Same shape the browser checks for type="email"; the API validates again.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function waitlistErrorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 429) return RATE_LIMITED_MESSAGE
  if (err instanceof ApiError && err.status === 422) return INVALID_EMAIL
  return FALLBACK_ERROR
}

/** Inline iOS waitlist sign-up. Posts straight to the API so its per-IP rate limit sees the visitor, not our server. */
export function WaitlistForm({ source = 'landing' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const successRef = useRef<HTMLParagraphElement>(null)
  const inputId = useId()
  const errorId = useId()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status.kind === 'submitting') return
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ kind: 'error', message: INVALID_EMAIL })
      return
    }

    setStatus({ kind: 'submitting' })
    try {
      const data = await api.post<{ message?: string }>('/waitlist', { waitlist_signup: { email: value, source } }, false)
      setStatus({ kind: 'success', message: data?.message || FALLBACK_SUCCESS })
      requestAnimationFrame(() => successRef.current?.focus())
    } catch (err) {
      setStatus({ kind: 'error', message: waitlistErrorMessage(err) })
    }
  }

  if (status.kind === 'success') {
    return (
      <div className="mx-auto w-full max-w-md">
        <p
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="rounded-field bg-background/10 px-4 py-4 text-base text-background outline-none"
        >
          {status.message}
        </p>
      </div>
    )
  }

  const submitting = status.kind === 'submitting'
  const error = status.kind === 'error' ? status.message : null

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-md text-left">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Input
          id={inputId}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status.kind === 'error') setStatus({ kind: 'idle' })
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={submitting}
          className="sm:flex-1"
        />
        <Button type="submit" variant="cta" size="lg" disabled={submitting} aria-busy={submitting} className="w-full shrink-0 sm:w-auto">
          {submitting ? 'Joining...' : 'Join the waitlist'}
        </Button>
      </div>
      {/* red-300, not the danger token: danger fails contrast on the espresso band. */}
      <p id={errorId} role="alert" className="mt-2 min-h-5 text-center text-sm text-red-300">
        {error}
      </p>
      <p className="mt-1 text-center text-sm text-background/60">
        We only use your email to tell you when the app is out.{' '}
        <Link href="/privacidad" className="underline underline-offset-2 hover:text-background">
          Privacy policy
        </Link>
      </p>
    </form>
  )
}
