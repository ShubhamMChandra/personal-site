/**
 * Quick audit: Screenshot the References book (all pages)
 * Usage: npm run audit:references
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:3847/#references')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/references-1.png` })
console.log(`✓ references-1.png`)

// Navigate through pages
for (let i = 2; i <= 3; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/references-${i}.png` })
  console.log(`✓ references-${i}.png`)
}

console.log(`\nSaved to: ${OUTPUT}/`)
await browser.close()
