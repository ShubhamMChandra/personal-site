/**
 * Quick audit: Screenshot the Contact book
 * Usage: npm run audit:contact
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:3847/#contact')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/contact.png`, fullPage: true })

console.log(`✓ Saved: ${OUTPUT}/contact.png`)
await browser.close()
