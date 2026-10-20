'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost, apiPatch } from '@/lib/api/server'
import { z } from 'zod'

const sampleMenu = {
  categories: [
    { name: 'Bebidas calientes', sort_order: 1 },
    { name: 'Bebidas frias', sort_order: 2 },
    { name: 'Panaderia', sort_order: 3 },
  ],
  modifierGroups: [
    {
      name: 'Leche',
      min_select: 0,
      max_select: 1,
      sort_order: 1,
      options: [
        { name: 'Entera', price_cents: 0, sort_order: 1 },
        { name: 'Deslactosada', price_cents: 500, sort_order: 2 },
        { name: 'Almendra', price_cents: 1500, sort_order: 3 },
      ],
    },
    {
      name: 'Tamano',
      min_select: 1,
      max_select: 1,
      sort_order: 2,
      options: [
        { name: 'Chico', price_cents: 0, sort_order: 1 },
        { name: 'Mediano', price_cents: 1000, sort_order: 2 },
        { name: 'Grande', price_cents: 2000, sort_order: 3 },
      ],
    },
  ],
  items: [
    {
      name: 'Cappuccino',
      description: 'Espresso doble con leche vaporizada y espuma cremosa.',
      price_cents: 5500,
      category_index: 0,
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop',
      prep_time_min: 4,
      modifier_group_names: ['Leche', 'Tamano'],
    },
    {
      name: 'Latte Vainilla',
      description: 'Cafe suave con leche caliente y un toque de vainilla.',
      price_cents: 6200,
      category_index: 0,
      image_url: 'https://images.unsplash.com/photo-1461023058943-48dbf1399192?w=600&auto=format&fit=crop',
      prep_time_min: 4,
      modifier_group_names: ['Tamano'],
    },
    {
      name: 'Americano',
      description: 'Espresso con agua caliente, intenso y ligero.',
      price_cents: 4200,
      category_index: 0,
      prep_time_min: 3,
      modifier_group_names: ['Tamano'],
    },
    {
      name: 'Cold Brew',
      description: 'Cafe infusionado en frio por 18 horas. Suave y refrescante.',
      price_cents: 6800,
      category_index: 1,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
      prep_time_min: 2,
      modifier_group_names: ['Tamano'],
    },
    {
      name: 'Frappe Mocha',
      description: 'Cafe, hielo, chocolate y crema batida.',
      price_cents: 7500,
      category_index: 1,
      image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop',
      prep_time_min: 5,
      modifier_group_names: ['Tamano'],
    },
    {
      name: 'Croissant de Mantequilla',
      description: 'Hojaldre dorado y crujiente, horneado diario.',
      price_cents: 4800,
      category_index: 2,
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop',
      prep_time_min: 1,
      modifier_group_names: [],
    },
    {
      name: 'Muffin de Arandanos',
      description: 'Esponjoso con arandanos frescos y un toque de limon.',
      price_cents: 5200,
      category_index: 2,
      prep_time_min: 1,
      modifier_group_names: [],
    },
  ],
}

const onboardingSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(1),
  currency: z.enum(['MXN', 'EUR']),
  locale: z.enum(['es', 'en']),
  address: z.string().optional(),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

const operatingHoursDaySchema = z.object({
  is_open: z.boolean(),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
})

const shopSettingsSchema = z.object({
  operating_hours: z.object({
    mon: operatingHoursDaySchema,
    tue: operatingHoursDaySchema,
    wed: operatingHoursDaySchema,
    thu: operatingHoursDaySchema,
    fri: operatingHoursDaySchema,
    sat: operatingHoursDaySchema,
    sun: operatingHoursDaySchema,
  }),
  slot_duration_minutes: z.number().int().min(5).max(120),
  slot_capacity: z.number().int().min(1).max(500),
  prep_time_buffer_minutes: z.number().int().min(0).max(120),
  max_days_ahead: z.number().int().min(1).max(30),
  accepting_pickup: z.boolean(),
})

export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>

export async function updateShopSettings(shopId: string, input: ShopSettingsInput) {
  const parsed = shopSettingsSchema.parse(input)

  await apiPatch(`/shops/${shopId}`, {
    shop: {
      operating_hours: parsed.operating_hours,
      slot_duration_minutes: parsed.slot_duration_minutes,
      slot_capacity: parsed.slot_capacity,
      prep_time_buffer_minutes: parsed.prep_time_buffer_minutes,
      max_days_ahead: parsed.max_days_ahead,
      accepting_pickup: parsed.accepting_pickup,
    },
  })

  revalidatePath(`/dashboard/${shopId}/settings`)
  revalidatePath(`/${shopId}`)
}

export async function createShop(input: OnboardingInput) {
  const parsed = onboardingSchema.parse(input)

  const data = await apiPost<{ shop: { id: string } }>('/shops', {
    shop: parsed,
  })

  await seedSampleMenu(data.shop.id)

  revalidatePath('/dashboard')
  redirect(`/dashboard/${data.shop.id}`)
}

async function seedSampleMenu(shopId: string) {
  try {
    const categoryResults = await Promise.all(
      sampleMenu.categories.map((category) =>
        apiPost<{ category: { id: string } }>(`/shops/${shopId}/menu_categories`, {
          menu_category: category,
        })
      )
    )
    const categoryIds = categoryResults.map((r) => r.category.id)

    const groupResults: { name: string; id: string; optionIds: Record<string, string> }[] = []
    for (const group of sampleMenu.modifierGroups) {
      const groupResult = await apiPost<{ modifier_group: { id: string } }>(
        `/shops/${shopId}/modifier_groups`,
        {
          modifier_group: {
            name: group.name,
            min_select: group.min_select,
            max_select: group.max_select,
            sort_order: group.sort_order,
          },
        }
      )

      const optionIds: Record<string, string> = {}
      for (const option of group.options) {
        const optionResult = await apiPost<{ modifier_option: { id: string } }>(
          `/shops/${shopId}/modifier_groups/${groupResult.modifier_group.id}/modifier_options`,
          { modifier_option: option }
        )
        optionIds[option.name] = optionResult.modifier_option.id
      }

      groupResults.push({ name: group.name, id: groupResult.modifier_group.id, optionIds })
    }

    const groupMap = new Map(groupResults.map((g) => [g.name, g]))

    for (const item of sampleMenu.items) {
      const itemResult = await apiPost<{ item: { id: string } }>(`/shops/${shopId}/menu_items`, {
        menu_item: {
          name: item.name,
          description: item.description,
          price_cents: item.price_cents,
          category_id: categoryIds[item.category_index],
          image_url: item.image_url,
          prep_time_min: item.prep_time_min,
          sort_order: 0,
        },
      })

      for (const groupName of item.modifier_group_names) {
        const group = groupMap.get(groupName)
        if (group) {
          await apiPost(`/shops/${shopId}/item_modifier_links`, {
            item_id: itemResult.item.id,
            group_id: group.id,
            is_required: false,
          })
        }
      }
    }
  } catch (err) {
    console.error('Failed to seed sample menu:', err)
  }
}
