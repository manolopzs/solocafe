'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
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

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/${orderId}/success`,
      },
    })

    setLoading(false)
    if (confirmError) {
      setError(confirmError.message ?? 'Error en el pago')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-border bg-surface p-4">
        <PaymentElement />
      </div>
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
        Pago seguro procesado por Stripe.
      </p>
    </form>
  )
}

export function CheckoutForm({ orderId, clientSecret }: { orderId: string; clientSecret: string }) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} />
    </Elements>
  )
}
