import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://localhost:3000/demo', { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.waitForTimeout(3000)
await page.addStyleTag({ content: '* { font-family: system-ui, -apple-system, sans-serif !important; }' })
await page.screenshot({ path: 'public/screenshots/test.png', fullPage: false })
await browser.close()
console.log('test screenshot saved')
