'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { STRIPE_NOT_CONFIGURED_MESSAGE } from '@/lib/stripe/keys'
import { payWithSavedCard, syncPayment, syncSaveCard } from '@/server/actions/payments'
import { cardExpiry, cardTitle } from '@/lib/cards'
import type { CustomerPaymentMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

function successUrl(orderId: string, accessToken: string, sync: boolean) {
  const token = encodeURIComponent(accessToken)
  const syncFlag = sync ? '&sync=1' : ''
  return `${window.location.origin}/checkout/${orderId}/success?token=${token}${syncFlag}`
}

function PaymentForm({
  orderId,
  accessToken,
  canSaveCard,
}: {
  orderId: string
  accessToken: string
  canSaveCard: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setLoading(false)
      setError(submitError.message ?? 'Error en el pago')
      return
    }

    if (canSaveCard && saveCard) {
      try {
        await syncSaveCard(orderId, accessToken, true)
        const { error: updateError } = await elements.fetchUpdates()
        if (updateError) {
          setLoading(false)
          setError(updateError.message ?? 'No pudimos preparar el guardado de la tarjeta.')
          return
        }
      } catch {
        setLoading(false)
        setError('No pudimos preparar el guardado de la tarjeta.')
        return
      }
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: successUrl(orderId, accessToken, false),
      },
    })

    setLoading(false)
    if (confirmError) {
      setError(confirmError.message ?? 'Error en el pago')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-4">
        <PaymentElement />
      </div>
      {canSaveCard && (
        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(event) => setSaveCard(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>Guardar tarjeta para la próxima</span>
        </label>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <Button type="submit" disabled={!stripe || loading} size="lg" className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Procesando...
          </span>
        ) : (
          'Pagar ahora'
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Icon name="credit-card" className="h-3.5 w-3.5" />
        Pago seguro procesado por Stripe. Apple Pay y Google Pay siguen disponibles.
      </p>
    </form>
  )
}

function SavedCardList({
  orderId,
  accessToken,
  savedCards,
}: {
  orderId: string
  accessToken: string
  savedCards: CustomerPaymentMethod[]
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pay = async (cardId: string) => {
    setLoadingId(cardId)
    setError(null)
    const returnUrl = successUrl(orderId, accessToken, true)

    try {
      const result = await payWithSavedCard(orderId, cardId, returnUrl, accessToken)
      if (result.status === 'requires_action' && result.client_secret) {
        const stripe = await getStripe(result.stripe_account_id)
        if (!stripe) {
          setError('No pudimos abrir la confirmación del banco.')
          setLoadingId(null)
          return
        }
        const next = await stripe.handleNextAction({ clientSecret: result.client_secret })
        if (next.error) {
          setError(next.error.message ?? 'Confirma el pago con tu banco.')
          setLoadingId(null)
          return
        }
        await syncPayment(orderId, accessToken)
        window.location.assign(returnUrl)
        return
      }

      if (result.status === 'succeeded') {
        window.location.assign(returnUrl)
        return
      }

      setError('No pudimos cobrar la tarjeta guardada.')
      setLoadingId(null)
    } catch {
      setError('No pudimos cobrar la tarjeta guardada.')
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Tarjetas guardadas</p>
      <ul className="space-y-2">
        {savedCards.map((card) => {
          const expiry = cardExpiry(card)
          const loading = loadingId === card.id
          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => pay(card.id)}
                disabled={loadingId !== null}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-shadow hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{cardTitle(card)}</span>
                  {expiry && <span className="block text-sm text-muted-foreground">{expiry}</span>}
                </span>
                <span className="shrink-0 text-sm font-medium text-foreground">
                  {loading ? 'Procesando...' : 'Pagar'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

export function CheckoutForm({
  orderId,
  clientSecret,
  accessToken,
  savedCards = [],
  canSaveCard = false,
}: {
  orderId: string
  clientSecret: string
  accessToken: string
  savedCards?: CustomerPaymentMethod[]
  canSaveCard?: boolean
}) {
  const stripePromise = getStripe()
  if (!stripePromise) {
    return <p className="text-sm text-danger">{STRIPE_NOT_CONFIGURED_MESSAGE}</p>
  }

  return (
    <div className="space-y-6">
      {canSaveCard && savedCards.length > 0 && (
        <SavedCardList orderId={orderId} accessToken={accessToken} savedCards={savedCards} />
      )}
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm orderId={orderId} accessToken={accessToken} canSaveCard={canSaveCard} />
      </Elements>
    </div>
  )
}
