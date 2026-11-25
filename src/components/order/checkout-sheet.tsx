'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Sheet } from '@/components/ui/sheet'
import { checkoutBlockedCopy } from '@/lib/ordering'
import { dialPrefixForLocale } from '@/lib/phone'
import { QuantityStepper } from '@/components/order/quantity-stepper'
import { MenuTileImage } from '@/components/order/menu-tile-image'
import { updateCustomerProfile } from '@/server/actions/customers'
import type { CartViewLine } from '@/components/order/cart-sheet'
import type { Customer, Shop } from '@/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isTestStripeKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  return key.startsWith('pk_test')
}

function PhoneField({
  value,
  onChange,
  locale,
  required = false,
}: {
  value: string
  onChange: (value: string) => void
  locale?: string | null
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor="customerPhone" className="block text-body-sm font-semibold text-foreground">
        Phone {required && <span className="text-muted-foreground">*</span>}
      </label>
      <p id="customerPhone-help" className="mt-1 text-body-sm text-muted-foreground">
        So we can tell you when it&apos;s ready
      </p>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base text-muted-foreground" aria-hidden="true">
          {dialPrefixForLocale(locale)}
        </span>
        <Input
          id="customerPhone"
          type="tel"
          autoComplete="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="612 345 678"
          aria-describedby="customerPhone-help"
          className="pl-16"
        />
      </div>
    </div>
  )
}

export function CheckoutSheet({
  open,
  onClose,
  shop,
  customer,
  lines,
  total,
  etaMinutes,
  blockedReason,
  previewError,
  onRefreshPreview,
  loading,
  error,
  rewardText,
  redeemLoyalty,
  onRedeemLoyalty,
  onQuantity,
  onRemove,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  shop: Shop
  customer: Customer | null
  lines: CartViewLine[]
  total: string
  etaMinutes?: number
  blockedReason: string | null
  previewError?: string | null
  onRefreshPreview?: () => void
  loading: boolean
  error: string | null
  rewardText?: string | null
  redeemLoyalty?: boolean
  onRedeemLoyalty?: (value: boolean) => void
  onQuantity: (index: number, quantity: number) => void
  onRemove: (index: number) => void
  onSubmit: (input: {
    customerName: string
    customerPhone: string
    customerEmail: string
    specialInstructions: string
    pickupType: 'asap'
    redeemLoyalty?: boolean
  }) => void
}) {
  const isSignedIn = customer !== null
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
  const [customerEmail, setCustomerEmail] = useState(customer?.email ?? '')
  const [editingIdentity, setEditingIdentity] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [savingPhone, setSavingPhone] = useState(false)

  const displayName = customer?.name?.trim() || customer?.email || 'your account'
  const needsPhone = isSignedIn && !customer?.phone && !customerPhone.trim()
  const asapBlocked = shop.ordering?.asap_available === false
  const testMode = isTestStripeKey()
  const blockedCopy = checkoutBlockedCopy(blockedReason)

  const validateEmail = (email: string) => {
    if (!email) return true
    return EMAIL_PATTERN.test(email)
  }

  const submit = async () => {
    setLocalError(null)

    const name = customerName.trim()
    const phone = customerPhone.trim()
    const email = customerEmail.trim()

    if (!isSignedIn || editingIdentity) {
      if (!name) {
        setLocalError('Enter your name to continue')
        return
      }
    }

    if (!isSignedIn) {
      if (!phone && !email) {
        setLocalError('Enter a phone number or contact email')
        return
      }
    } else if (needsPhone) {
      if (!phone) {
        setLocalError('Add your phone so we can tell you when it\'s ready')
        return
      }
    }

    if (!validateEmail(email)) {
      setLocalError('The email isn\'t valid')
      return
    }

    if (isSignedIn && customer && !customer.phone && phone) {
      setSavingPhone(true)
      try {
        const formData = new FormData()
        formData.set('name', name || customer.name || '')
        formData.set('phone', phone)
        await updateCustomerProfile(formData)
      } catch (err) {
        setSavingPhone(false)
        setLocalError(err instanceof Error ? err.message : "We couldn't save your phone")
        return
      }
      setSavingPhone(false)
    }

    const resolvedName =
      isSignedIn && !editingIdentity
        ? (customer?.name?.trim() || customer?.email || name)
        : name
    const resolvedPhone =
      isSignedIn && !editingIdentity ? (customer?.phone ?? phone) : phone

    onSubmit({
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      customerEmail: isSignedIn && !editingIdentity ? (email || customer?.email || '') : email,
      specialInstructions: '',
      pickupType: 'asap',
      redeemLoyalty,
    })
  }

  const canSubmit =
    lines.length > 0 && !loading && !savingPhone && !blockedReason && !asapBlocked

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Your order"
      position="bottom"
      className="!bg-background sm:left-1/2 sm:right-auto sm:top-auto sm:w-full sm:max-w-[var(--phone-col)] sm:-translate-x-1/2 sm:rounded-t-[24px]"
      footer={
        <div className="space-y-3">
          {testMode && (
            <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-5 text-foreground">
              Test card payment. No real charge is made.
            </p>
          )}
          {(localError || error || previewError) && (
            <Notice tone="danger">
              {localError || error || previewError}
            </Notice>
          )}
          {previewError && onRefreshPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefreshPreview}
              className="w-full"
            >
              Retry
            </Button>
          )}
          {lines.length > 0 && (
            <p className="flex items-baseline justify-between pb-1">
              <span className="text-body text-muted-foreground">Total</span>
              <span className="text-[40px] font-semibold leading-[48px] tracking-[-0.02em] tabular-nums text-foreground">{total}</span>
            </p>
          )}
          <Button
            onClick={() => void submit()}
            disabled={!canSubmit}
            loading={loading || savingPhone}
            variant="cta"
            size="lg"
            className="w-full touch-manipulation"
          >
            Pay {total}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {lines.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-body text-foreground">Your bag is empty</p>
            <p className="mt-1 text-body-sm text-muted-foreground">Add something from the menu.</p>
            <Button asChild variant="espresso" size="lg" className="mt-6 w-full">
              <Link href={`/${shop.slug}`}>Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((line, index) => (
              <li key={line.key} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated py-3 pl-3 pr-4 shadow-card">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-thumb bg-surface">
                  {line.thumb && <MenuTileImage item={line.thumb} sizes="40px" iconClassName="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold leading-[22px] text-foreground">{line.name}</p>
                  {line.detail && <p className="truncate text-body-sm text-muted-foreground">{line.detail}</p>}
                  {line.unavailable && (
                    <span className="mt-1 inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                      No longer available
                    </span>
                  )}
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">{line.lineTotal}</p>
                </div>
                <QuantityStepper
                  value={line.quantity}
                  onDecrease={() => onQuantity(index, line.quantity - 1)}
                  onIncrease={() => onQuantity(index, line.quantity + 1)}
                  removeAtOne={{ label: `Remove ${line.name}`, onRemove: () => onRemove(index) }}
                />
              </li>
            ))}
          </ul>
        )}

        {!isSignedIn && lines.length > 0 && (
          <div className="rounded-2xl bg-sky-tint px-4 py-3 text-body-sm text-foreground">
            Want to order faster next time?{' '}
            <Link href="/account/signup" className="font-semibold text-foreground underline underline-offset-2">
              Sign up
            </Link>
          </div>
        )}

        {lines.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-4 shadow-card">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pill text-on-pill">
              <PhosphorIcon name="clock" className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-caption text-muted-foreground">Pickup</p>
              <p className="text-body-sm font-semibold text-foreground">
                As soon as possible
                {etaMinutes !== undefined && etaMinutes > 0 && ` · ~${etaMinutes} min`}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-3">
          {isSignedIn && !editingIdentity ? (
            <>
              <p className="rounded-2xl bg-surface px-4 py-3.5 text-sm text-foreground">
                Order for <span className="font-medium">{displayName}</span>
                {' · '}
                <button
                  type="button"
                  onClick={() => setEditingIdentity(true)}
                  className="font-medium text-accent underline underline-offset-2"
                >
                  change
                </button>
              </p>
              {needsPhone && (
                <PhoneField value={customerPhone} onChange={setCustomerPhone} locale={shop.locale} required />
              )}
            </>
          ) : (
            <>
              <div>
                <label htmlFor="customerName" className="block text-body-sm font-semibold text-foreground">
                  Name
                </label>
                <Input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="What is your name?"
                  className="mt-1.5"
                />
              </div>
              <PhoneField value={customerPhone} onChange={setCustomerPhone} locale={shop.locale} />
            </>
          )}

          {(!isSignedIn || editingIdentity) && (
            <div>
              <label htmlFor="customerEmail" className="block text-body-sm font-semibold text-foreground">
                Receipt email
              </label>
              <Input
                id="customerEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>
          )}

          {isSignedIn && editingIdentity && (
            <button
              type="button"
              onClick={() => {
                setEditingIdentity(false)
                setCustomerName(customer?.name ?? '')
                setCustomerPhone(customer?.phone ?? '')
                setCustomerEmail(customer?.email ?? '')
              }}
              className="text-sm font-medium text-accent underline underline-offset-2"
            >
              Use saved details
            </button>
          )}
        </div>

        {rewardText && (
          <label className="flex min-h-14 items-start gap-3 rounded-2xl bg-surface p-4 text-sm">
            <input
              type="checkbox"
              checked={redeemLoyalty === true}
              onChange={(event) => onRedeemLoyalty?.(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-border accent-[var(--primary)]"
            />
            <span>
              <span className="block font-semibold text-foreground">Redeem reward</span>
              <span className="block text-muted-foreground">{rewardText}. The discount is calculated when the order is created.</span>
            </span>
          </label>
        )}

        {blockedCopy && (
          <Notice tone="danger">{blockedCopy}</Notice>
        )}
      </div>
    </Sheet>
  )
}
