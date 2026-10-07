export type ShopRole = 'owner' | 'manager' | 'barista'

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'picked_up' | 'cancelled'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export type PickupType = 'asap' | 'scheduled'

export interface Shop {
  id: string
  slug: string
  name: string
  legal_name: string | null
  timezone: string
  currency: string
  locale: string
  tax_included: boolean
  tax_rate: number
  address: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  brand_color: string
  stripe_account_id: string | null
  stripe_connect_status: string
  owner_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  shop_id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  shop_id: string
  category_id: string | null
  name: string
  description: string | null
  price_cents: number
  image_url: string | null
  is_active: boolean
  is_86ed: boolean
  prep_time_min: number
  sort_order: number
  created_at: string
  updated_at: string
  modifier_groups?: ModifierGroup[]
}

export interface ModifierGroup {
  id: string
  shop_id: string
  name: string
  min_select: number
  max_select: number
  sort_order: number
  created_at: string
  options?: ModifierOption[]
  item_modifier_links?: { is_required: boolean }[]
}

export interface ModifierOption {
  id: string
  group_id: string
  name: string
  price_cents: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ItemModifierLink {
  id: string
  item_id: string
  group_id: string
  is_required: boolean
  created_at: string
}

export interface Order {
  id: string
  shop_id: string
  customer_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal_cents: number
  tax_cents: number
  tip_cents: number
  total_cents: number
  currency: string
  pickup_type: PickupType
  pickup_slot_id: string | null
  pickup_time: string | null
  customer_name: string | null
  customer_phone: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string
  item_name_snapshot: string
  unit_price_cents: number
  quantity: number
  subtotal_cents: number
  modifiers?: OrderItemModifier[]
}

export interface OrderItemModifier {
  id: string
  order_item_id: string
  option_id: string
  option_name_snapshot: string
  price_cents: number
}

export interface Payment {
  id: string
  order_id: string
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  amount_cents: number
  platform_fee_cents: number
  currency: string
  status: PaymentStatus
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string | null
  name: string | null
  phone: string | null
  email: string | null
  created_at: string
}
