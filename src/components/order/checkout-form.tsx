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
      <div className="rounded-xl border border-warm-200 bg-cream/50 p-4">
        <PaymentElement />
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <Button type="submit" disabled={!stripe || loading} size="lg" className="w-full">
        {loading ? 'Procesando...' : 'Pagar ahora'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
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
