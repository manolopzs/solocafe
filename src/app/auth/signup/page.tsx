'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { SignupError } from '@/components/auth/signup-error'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      <section className="flex flex-col justify-center bg-surface px-5 pb-8 pt-4 lg:px-16 lg:py-12 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Solo Café, home">
            <SoloCafeWordmark height={24} />
          </Link>

          <h1 className="mt-10 text-h1 text-heading sm:text-4xl">
            Open your direct sales channel
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Create your account and your coffee shop. Then confirm the menu, Stripe and hours before publishing.
          </p>

          <div className="mt-6" aria-label="Step 1 of 3: create your account">
            <p className="text-body-sm font-semibold text-foreground">
              Step 1 of 3 <span className="text-muted-foreground">·</span> Create your account
            </p>
            <p className="mt-0.5 text-caption text-muted-foreground">Next: prepare to open and publish.</p>
            <div className="mt-3 grid grid-cols-3 gap-1" aria-hidden="true">
              <span className="h-1.5 rounded-full bg-foreground" />
              <span className="h-1.5 rounded-full bg-pill" />
              <span className="h-1.5 rounded-full bg-pill" />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-start justify-center px-5 pb-10 pt-6 lg:items-center lg:px-16 lg:py-12 xl:px-24">
        <div className="w-full max-w-sm">
          <Card variant="outline" className="max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent">
            <CardHeader className="max-sm:px-0 max-sm:pt-0 sm:text-center">
              <CardTitle className="!text-h2 text-heading">Create your account</CardTitle>
              <CardDescription className="mt-2 text-body-sm">Sign up to start receiving orders.</CardDescription>
            </CardHeader>
            <CardContent className="max-sm:px-0 max-sm:pb-0">
              <form action={formAction} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Alex Smith"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@cafeteria.com"
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
                      placeholder="********"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="shopName">Coffee shop name</Label>
                  <Input
                    id="shopName"
                    name="shopName"
                    type="text"
                    required
                    placeholder="Corner Café"
                    className="mt-1.5"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    We create the coffee shop with this name. The URL, currency and hours are adjusted afterwards.
                  </p>
                </div>

                {state?.error && <SignupError state={state} loginHref="/auth/login" recoverHref="/auth/forgot-password" />}

                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? 'Creating account...' : 'Sign up free'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
