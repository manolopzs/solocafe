const API = 'https://solocafe-api.onrender.com'

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) },
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`${path}: ${res.status} ${text}`)
  return body
}

const email = `test-${Date.now()}@example.com`
const password = 'password123'

console.log('1. signup')
const signup = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email, password } }),
})
const token = signup.token
console.log('token ok')

console.log('2. create shop')
const shop = await api('/shops', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    shop: {
      name: 'Test Cafe',
      slug: `test-cafe-${Date.now()}`,
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      locale: 'es',
      tax_included: true,
      tax_rate: 0,
      address: 'Calle Test 123',
      brand_color: '#c17c5b',
    },
  }),
}).then((r) => r.shop)
console.log('shop', shop.id)

console.log('3. create category')
const category = await api(`/shops/${shop.id}/menu_categories`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ menu_category: { name: 'Bebidas', sort_order: 1, is_active: true } }),
}).then((r) => r.category)

console.log('4. create item')
const item = await api(`/shops/${shop.id}/menu_items`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    menu_item: {
      category_id: category.id,
      name: 'Cappuccino',
      description: 'Espresso con leche',
      price_cents: 5500,
      is_active: true,
      is_86ed: false,
      prep_time_min: 5,
      sort_order: 1,
    },
  }),
}).then((r) => r.item)

const customerPhone = `555${Date.now()}`.slice(-10)

console.log('5. create order')
const order = await api(`/shops/${shop.id}/orders`, {
  method: 'POST',
  body: JSON.stringify({
    order: {
      customer_name: 'Test User',
      customer_phone: customerPhone,
      pickup_type: 'asap',
      items: [{ menu_item_id: item.id, quantity: 1, modifier_option_ids: [] }],
    },
  }),
}).then((r) => r.order)
console.log('order', order.id)

console.log('6. fetch customer order by id')
const customerOrder = await api(`/customers/me/orders/${order.id}`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.order)
console.log('customer order items:', customerOrder.items.length)

console.log('7. fetch public order')
const publicOrder = await api(`/public/orders/${order.id}?customer_phone=${encodeURIComponent(customerPhone)}`).then((r) => r.order)
console.log('public order status:', publicOrder.status)

console.log('8. update order status to ready')
const readyOrder = await api(`/shops/${shop.id}/orders/${order.id}`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ order: { status: 'ready' } }),
}).then((r) => r.order)
console.log('updated status:', readyOrder.status)

console.log('9. fetch public order again')
const publicReady = await api(`/public/orders/${order.id}?customer_phone=${encodeURIComponent(customerPhone)}`).then((r) => r.order)
console.log('public status after update:', publicReady.status)

console.log('All backend validations passed')
