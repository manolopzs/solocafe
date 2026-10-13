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

const ownerSignup = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email: 'owner' + Math.random() + '@e.com', password: 'password123' } }),
})

const shop = await api('/shops', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + ownerSignup.token },
  body: JSON.stringify({
    shop: {
      name: 'Café Reorder Test',
      slug: 'reorder-' + Math.random().toString(36).slice(2),
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      locale: 'es',
      tax_included: true,
      tax_rate: 0,
      address: 'Test Address',
      brand_color: '#c17c5b',
    },
  }),
})

const cat = await api('/shops/' + shop.shop.id + '/menu_categories', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + ownerSignup.token },
  body: JSON.stringify({ menu_category: { name: 'Bebidas', sort_order: 1, is_active: true } }),
})

const item = await api('/shops/' + shop.shop.id + '/menu_items', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + ownerSignup.token },
  body: JSON.stringify({
    menu_item: {
      category_id: cat.category.id,
      name: 'Cappuccino',
      description: '',
      price_cents: 5500,
      is_active: true,
      is_86ed: false,
      prep_time_min: 5,
      sort_order: 1,
    },
  }),
})

const order = await api('/shops/' + shop.shop.id + '/orders', {
  method: 'POST',
  body: JSON.stringify({
    order: {
      customer_name: 'Guest',
      customer_phone: phone,
      pickup_type: 'asap',
      items: [{ menu_item_id: item.item.id, quantity: 1, modifier_option_ids: [] }],
    },
  }),
})
console.log('guest order', order.order.id)

const custSignup = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email: 'cust' + Math.random() + '@e.com', password: 'password123' } }),
})

await api('/customers/me', {
  method: 'PATCH',
  headers: { Authorization: 'Bearer ' + custSignup.token },
  body: JSON.stringify({ customer: { name: 'Customer', phone } }),
})

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 14 Pro'] })
await context.addCookies([
  {
    name: 'token',
    value: custSignup.token,
    domain: 'solo-cafe-nine.vercel.app',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  },
])

const page = await context.newPage()
page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()))
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message))
await page.goto(`${APP}/account/orders`)
await page.waitForTimeout(3000)

console.log('orders page url:', page.url())
const bodyText = await page.textContent('body')
console.log('orders page body:', bodyText.slice(0, 300))

if (!bodyText.includes('Reordenar')) {
  console.error('ERROR: no reorder button found')
  await browser.close()
  process.exit(1)
}

await page.click('text=Reordenar')
await page.waitForTimeout(4000)

console.log('shop page url:', page.url())
const shopBody = await page.textContent('body')
console.log('shop page body:', shopBody.slice(0, 400))

const cartButtonText = await page.locator('button:has-text("Ver pedido")').textContent()
console.log('cart button:', cartButtonText)

const hasBanner = shopBody.includes('Se agregaron') && shopBody.includes('productos de tu pedido anterior')
const hasTotal = /MXN\s+55\.00/.test(cartButtonText)

console.log('banner visible:', hasBanner)
console.log('cart total correct:', hasTotal)

if (!hasTotal) {
  console.error('ERROR: cart total not pre-filled')
  await browser.close()
  process.exit(1)
}

console.log('PASS')
await browser.close()
