'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import { z } from 'zod'

const onboardingSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(1),
  currency: z.enum(['MXN', 'EUR']),
  locale: z.enum(['es', 'en']),
  address: z.string().optional(),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

export async function createShop(input: OnboardingInput) {
  const parsed = onboardingSchema.parse(input)

  const data = await apiPost<{ shop: { id: string } }>('/shops', {
    shop: parsed,
  })

  revalidatePath('/dashboard')
  redirect(`/dashboard/${data.shop.id}`)
}
