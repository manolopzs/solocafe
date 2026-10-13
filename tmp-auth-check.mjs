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

const cust = await api('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ user: { email: 'cust' + Math.random() + '@e.com', password: 'password123' } }),
})
console.log('token length', cust.token.length)

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['iPhone 14 Pro'] })
await context.addCookies([
  {
    name: 'token',
    value: cust.token,
    domain: 'solo-cafe-nine.vercel.app',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  },
])
console.log('cookies before', await context.cookies())
const page = await context.newPage()
await page.goto(`${APP}/account`)
await page.waitForTimeout(3000)
console.log('url:', page.url())
console.log('body:', (await page.textContent('body')).slice(0, 200))
await browser.close()
