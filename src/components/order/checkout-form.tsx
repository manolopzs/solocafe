'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'

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
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="rounded-xl border border-warm-200 bg-warm-50/50 p-4">
        <PaymentElement />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={!stripe || loading} size="lg" className="w-full">
        {loading ? 'Procesando...' : 'Pagar ahora'}
      </Button>
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
