import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const fails = []
page.on('response', (r) => {
  if (r.status() >= 400) fails.push(`${r.status()} ${r.url()}`)
})
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CON', m.text())
})

await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4000)
console.log('FAILS:\n' + fails.join('\n'))
const text = await page.locator('body').innerText()
console.log('TEXT:\n' + text.slice(0, 900))

try {
  await page.getByRole('button', { name: /Зрозуміло/ }).click({ timeout: 2500 })
  await page.waitForTimeout(500)
} catch {
  console.log('no onboarding button')
}

await page.screenshot({ path: 'public/gui-desktop.png' })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(600)
await page.screenshot({ path: 'public/gui-mobile.png' })

await browser.close()
console.log('done')
