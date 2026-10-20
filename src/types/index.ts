export type ShopRole = 'owner' | 'manager' | 'barista'

export type OrderStatus = 'pending_payment' | 'received' | 'preparing' | 'ready' | 'picked_up' | 'cancelled'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export type PickupType = 'asap' | 'scheduled'

export interface OperatingHoursDay {
  is_open: boolean
  open: string
  close: string
}

export interface OperatingHours {
  mon: OperatingHoursDay
  tue: OperatingHoursDay
  wed: OperatingHoursDay
  thu: OperatingHoursDay
  fri: OperatingHoursDay
  sat: OperatingHoursDay
  sun: OperatingHoursDay
}

export interface ShopOrdering {
  open_now: boolean
  accepting_pickup: boolean
  asap_available: boolean
  status: 'open' | 'closed' | 'not_accepting'
  today: {
    is_open: boolean
    open: string | null
    close: string | null
  }
}

export interface PickupSlot {
  start_time: string
  end_time: string
  capacity: number
  reserved: number
  available: number
}

export interface ShopOnboardingStep {
  key: string
  done: boolean
}

export interface ShopStripeState {
  status: string
  charges_enabled: boolean
  details_submitted: boolean
}

export interface ShopOnboarding {
  status: string
  live: boolean
  can_go_live: boolean
  blockers: string[]
  hours_confirmed: boolean
  steps: ShopOnboardingStep[]
  stripe: ShopStripeState
}

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
  operating_hours: OperatingHours
  slot_duration_minutes: number
  slot_capacity: number
  prep_time_buffer_minutes: number
  max_days_ahead: number
  accepting_pickup?: boolean
  ordering?: ShopOrdering
  estimated_ready_minutes?: number
  owner_id: string | null
  status: string
  onboarding?: ShopOnboarding
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

export interface OrderShopSummary {
  id: string
  name: string
  slug: string
  address: string | null
  lat: number | null
  lng: number | null
  timezone: string
  directions_url: string | null
}

export interface Order {
  id: string
  shop_id: string
  shop_name?: string
  shop_slug?: string
  shop?: OrderShopSummary
  customer_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal_cents: number
  tax_cents: number
  tip_cents: number
  total_cents: number
  currency: string
  pickup_type: PickupType
  pickup_slot_id?: string | null
  pickup_time: string | null
  customer_name: string | null
  customer_phone?: string | null
  special_instructions: string | null
  estimated_ready_minutes?: number
  pickup_window_starts_at?: string | null
  pickup_window_ends_at?: string | null
  item_count?: number
  access_token?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface UsualOrderItem {
  menu_item_id: string
  name: string
  image_url: string | null
  quantity: number
  modifier_option_ids: string[]
  modifier_names: string[]
  label: string
  available: boolean
  unavailable_reason: string | null
}

export interface UsualOrder {
  source_order_id: string
  times_ordered: number
  label: string
  can_reorder: boolean
  items: UsualOrderItem[]
}

export interface CartPreviewLine {
  menu_item_id: string
  quantity: number
  modifier_option_ids: string[]
  name: string | null
  image_url: string | null
  available: boolean
  unavailable_reason: string | null
  unit_price_cents: number
  line_total_cents: number
}

export interface CartPreview {
  ordering: ShopOrdering
  estimated_ready_minutes: number
  pickup_window_starts_at: string
  pickup_window_ends_at: string
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  currency: string
  lines: CartPreviewLine[]
  can_checkout: boolean
  checkout_blocked_reason: string | null
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

export interface PeakHour {
  hour: number
  count: number
}

export interface TopItem {
  name: string
  quantity: number
  revenue_cents: number
}

export interface ShopAnalytics {
  order_count: number
  revenue_cents: number
  average_ticket_cents: number
  peak_hours: PeakHour[]
  top_items: TopItem[]
  repeat_customer_rate: number
}
