import { createClient } from '@/lib/supabase/server'
import type { Shop } from '@/types'

export async function getUserShops(): Promise<Shop[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .or(`owner_id.eq.${user.id},shop_members.user_id.eq.${user.id}`)

  if (error) {
    console.error('getUserShops error:', error)
    return []
  }

  return (data ?? []) as Shop[]
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) return null
  return data as Shop
}

export async function getShopById(id: string): Promise<Shop | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Shop
}
