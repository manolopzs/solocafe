'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = onboardingSchema.parse(input)

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('shops')
    .select('id')
    .eq('slug', parsed.slug)
    .maybeSingle()

  if (existing) {
    throw new Error('Slug already taken')
  }

  const { data: freeTier } = await admin
    .from('subscription_tiers')
    .select('id')
    .eq('name', 'Free')
    .single()

  if (!freeTier) {
    throw new Error('Free tier not found')
  }

  const { data: shop, error: shopError } = await admin
    .from('shops')
    .insert({
      ...parsed,
      owner_id: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (shopError || !shop) {
    throw new Error(shopError?.message ?? 'Failed to create shop')
  }

  const { error: memberError } = await admin
    .from('shop_members')
    .insert({
      shop_id: shop.id,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    throw new Error(memberError.message)
  }

  const { error: subscriptionError } = await admin
    .from('shop_subscriptions')
    .insert({
      shop_id: shop.id,
      tier_id: freeTier.id,
      status: 'active',
    })

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/${shop.id}`)
}
