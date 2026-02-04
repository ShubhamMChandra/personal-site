/**
 * Quick audit: Screenshot the bookshelf (homepage)
 * Usage: npm run audit:shelf
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:3847')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUTPUT}/shelf.png`, fullPage: true })

console.log(`✓ Saved: ${OUTPUT}/shelf.png`)
await browser.close()
