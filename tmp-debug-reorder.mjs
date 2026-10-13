import { chromium, devices } from 'playwright'

const API = 'https://solocafe-api.onrender.com'
const APP = 'https://solo-cafe-nine.vercel.app'

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) },
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(path + ': ' + res.status + ' ' + JSON.stringify(body))
  return body
}

const phone = '555' + Math.floor(Math.random() * 1e7).toString().padStart(7, '0')
const owner = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email: 'owner' + Math.random() + '@e.com', password: 'password123' } }),
})
const shop = await api('/shops', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + owner.token },
  body: JSON.stringify({
    shop: {
      name: 'Reorder Test',
      slug: 't-' + Math.random().toString(36).slice(2),
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      locale: 'es',
      tax_included: true,
      tax_rate: 0,
      address: 'A',
      brand_color: '#c17c5b',
    },
  }),
}).then((r) => r.shop)
const cat = await api('/shops/' + shop.id + '/menu_categories', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + owner.token },
  body: JSON.stringify({ menu_category: { name: 'Bebidas', sort_order: 1, is_active: true } }),
}).then((r) => r.category)
const item = await api('/shops/' + shop.id + '/menu_items', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + owner.token },
  body: JSON.stringify({
    menu_item: {
      category_id: cat.id,
      name: 'Cappuccino',
      description: '',
      price_cents: 5500,
      is_active: true,
      is_86ed: false,
      prep_time_min: 5,
      sort_order: 1,
    },
  }),
}).then((r) => r.item)
const order = await api('/shops/' + shop.id + '/orders', {
  method: 'POST',
  body: JSON.stringify({
    order: {
      customer_name: 'G',
      customer_phone: phone,
      pickup_type: 'asap',
      items: [{ menu_item_id: item.id, quantity: 2, modifier_option_ids: [] }],
    },
  }),
}).then((r) => r.order)
const cust = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email: 'cust' + Math.random() + '@e.com', password: 'password123' } }),
})
await api('/customers/me', {
  method: 'PATCH',
  headers: { Authorization: 'Bearer ' + cust.token },
  body: JSON.stringify({ customer: { name: 'C', phone } }),
})

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  cookies: [
    {
      name: 'token',
      value: cust.token,
      domain: 'solo-cafe-nine.vercel.app',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ],
})
const page = await context.newPage()
const url = `${APP}/${shop.slug}?reorder=${order.id}`
await page.goto(url)
await page.waitForTimeout(4000)
console.log('title:', await page.title())
const body = await page.textContent('body')
console.log('contains Se agregaron:', body.includes('Se agregaron'))
console.log('contains Cappuccino:', body.includes('Cappuccino'))
const cart = await page.locator('button:has-text("Ver pedido")').first().innerText().catch(() => 'not found')
console.log('cart button:', cart)
await page.screenshot({ path: 'tmp-reorder-debug.png' })
await browser.close()
