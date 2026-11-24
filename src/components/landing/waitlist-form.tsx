'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api/client'
import { RATE_LIMITED_MESSAGE } from '@/lib/api/errors'

const INVALID_EMAIL_MESSAGE = 'Enter a valid email address.'
const FALLBACK_MESSAGE = "We couldn't add you to the list. Please try again."
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (status === 'success') statusRef.current?.focus()
  }, [status])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setMessage(INVALID_EMAIL_MESSAGE)
      setStatus('error')
      return
    }

    setStatus('submitting')
    setMessage('')

    try {
      const response = await api.post<{ message: string }>(
        '/waitlist',
        { waitlist_signup: { email: trimmedEmail, source: 'landing' } },
        false,
      )
      setMessage(response.message)
      setStatus('success')
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setMessage(RATE_LIMITED_MESSAGE)
      } else if (error instanceof ApiError && error.status === 422) {
        setMessage(INVALID_EMAIL_MESSAGE)
      } else {
        setMessage(FALLBACK_MESSAGE)
      }
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto mt-5 w-full max-w-xl">
      {status === 'success' ? (
        <p ref={statusRef} role="status" tabIndex={-1} className="text-lg text-background outline-none">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-busy={status === 'submitting'}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <Input
                id="waitlist-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (status === 'error') {
                    setStatus('idle')
                    setMessage('')
                  }
                }}
                disabled={status === 'submitting'}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'waitlist-email-error' : undefined}
              />
            </div>
            <Button
              type="submit"
              variant="cta"
              size="lg"
              disabled={status === 'submitting'}
              aria-busy={status === 'submitting'}
              className="w-full shrink-0 sm:w-auto"
            >
              {status === 'submitting' ? 'Joining...' : 'Join waitlist'}
            </Button>
          </div>
          {status === 'error' && (
            <>
              {/* The danger token does not provide enough contrast on the dark espresso band. */}
              <p id="waitlist-email-error" role="alert" className="mt-3 text-center text-sm text-red-300">
                {message}
              </p>
            </>
          )}
        </form>
      )}
      <p className="mt-4 text-center text-sm text-background/60">
        We only use your email to tell you when the app is out.{' '}
        <Link href="/privacidad" className="underline underline-offset-4 hover:text-background">
          Privacy policy
        </Link>
      </p>
    </div>
  )
}
