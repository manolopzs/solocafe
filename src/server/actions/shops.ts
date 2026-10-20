'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPatch, apiForm } from '@/lib/api/server'
import type { OperatingHours, ShopOnboarding } from '@/types'

export interface OnboardingInput {
  name: string
  slug?: string
  timezone: string
  currency: 'MXN' | 'EUR'
  locale: 'es' | 'en'
  address?: string
}

export interface ShopSettingsInput {
  name: string
  slug: string
  timezone: string
  currency: string
  locale: string
  address?: string
  operating_hours: OperatingHours
  slot_duration_minutes: number
  slot_capacity: number
  prep_time_buffer_minutes: number
  max_days_ahead: number
  accepting_pickup: boolean
  loyalty_stamps_required: number
  loyalty_reward_text: string
}

export async function updateShopPersonality(shopId: string, slug: string, formData: FormData) {
  const body = new FormData()
  body.append('shop[brand_color]', String(formData.get('brand_color') ?? ''))
  body.append('shop[display_font]', String(formData.get('display_font') ?? ''))

  const hero = formData.get('hero_photo')
  if (hero instanceof File && hero.size > 0) {
    body.append('shop[hero_photo]', hero)
  }
  if (formData.get('remove_hero_photo') === '1') {
    body.append('shop[remove_hero_photo]', '1')
  }

  try {
    await apiForm(`/shops/${shopId}`, body, 'PATCH')
  } catch (error) {
    return { error: readableShopError(error) }
  }

  revalidatePath(`/dashboard/${shopId}/settings`)
  revalidatePath(`/${slug}`)
  return { ok: true as const }
}

function readableShopError(error: unknown) {
  const raw = error instanceof Error ? error.message : 'No se pudo guardar la personalidad.'
  const start = raw.indexOf('[')
  if (start >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(start))
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed.join(' ')
      }
    } catch {
      return raw
    }
  }
  return raw
}

export async function updateShopSettings(shopId: string, input: ShopSettingsInput) {
  await apiPatch(`/shops/${shopId}`, {
    shop: input,
  })

  revalidatePath(`/dashboard/${shopId}/settings`)
  revalidatePath(`/dashboard/${shopId}`)
}

export async function createShop(input: OnboardingInput) {
  const shop: {
    name: string
    timezone: string
    currency: 'MXN' | 'EUR'
    locale: 'es' | 'en'
    address?: string
    slug?: string
  } = {
    name: input.name,
    timezone: input.timezone,
    currency: input.currency,
    locale: input.locale,
    address: input.address,
  }
  if (input.slug?.trim()) shop.slug = input.slug.trim()

  const data = await apiPost<{ shop: { id: string } }>('/shops', {
    shop,
    seed_starter_menu: true,
  })

  revalidatePath('/dashboard')
  redirect(`/dashboard/${data.shop.id}`)
}

export async function goLive(shopId: string): Promise<{ error?: 'not_ready' | 'failed' }> {
  try {
    await apiPost<{ onboarding: ShopOnboarding }>(`/shops/${shopId}/onboarding/go_live`, {})
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('not_ready')) return { error: 'not_ready' }
    return { error: 'failed' }
  }

  revalidatePath(`/dashboard/${shopId}`)
  revalidatePath(`/dashboard/${shopId}/settings`)
  revalidatePath(`/dashboard/${shopId}/qr`)
  return {}
}
