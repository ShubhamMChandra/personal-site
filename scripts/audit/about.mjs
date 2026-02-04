/**
 * Quick audit: Screenshot the About book (all pages)
 * Usage: npm run audit:about
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:3847/#about')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/about-1.png` })
console.log(`✓ about-1.png`)

// Navigate through pages
for (let i = 2; i <= 4; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/about-${i}.png` })
  console.log(`✓ about-${i}.png`)
}

console.log(`\nSaved to: ${OUTPUT}/`)
await browser.close()
