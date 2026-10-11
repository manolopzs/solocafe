import { chromium, devices } from 'playwright'

const baseUrl = 'https://solo-cafe-nine.vercel.app'

const browser = await chromium.launch({ headless: true })

// Customer phone screenshot
const phoneContext = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  deviceScaleFactor: 2,
})
const phonePage = await phoneContext.newPage()
await phonePage.goto(`${baseUrl}/demo`, { waitUntil: 'domcontentloaded', timeout: 20000 })
await phonePage.waitForTimeout(3000)
await phonePage.addStyleTag({ content: '* { font-family: system-ui, -apple-system, sans-serif !important; }' })
await phonePage.screenshot({ path: 'public/screenshots/customer-phone.png', fullPage: false })
await phoneContext.close()

// KDS / dashboard screenshot
const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
})
const desktopPage = await desktopContext.newPage()
await desktopPage.goto(`${baseUrl}/demo/kds`, { waitUntil: 'domcontentloaded', timeout: 20000 })
await desktopPage.waitForTimeout(4000)
await desktopPage.addStyleTag({ content: '* { font-family: system-ui, -apple-system, sans-serif !important; }' })
await desktopPage.screenshot({ path: 'public/screenshots/kds-desktop.png', fullPage: false })
await desktopContext.close()

await browser.close()
console.log('Screenshots saved')
