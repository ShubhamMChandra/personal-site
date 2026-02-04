/**
 * Quick audit: Screenshot the Work book (all pages)
 * Usage: npm run audit:work
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:3847/#work')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/work-1.png` })
console.log(`✓ work-1.png (ToC)`)

// Navigate through pages
for (let i = 2; i <= 5; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/work-${i}.png` })
  console.log(`✓ work-${i}.png`)
}

console.log(`\nSaved to: ${OUTPUT}/`)
await browser.close()
