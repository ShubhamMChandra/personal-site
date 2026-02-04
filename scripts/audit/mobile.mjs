/**
 * Quick audit: Mobile viewport screenshots (all books)
 * Usage: npm run audit:mobile
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 375, height: 812 } })

const books = ['', 'work', 'about', 'contact', 'references']

for (const book of books) {
  const name = book || 'shelf'
  const url = book ? `http://localhost:3847/#${book}` : 'http://localhost:3847'
  
  await page.goto(url)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT}/mobile-${name}.png`, fullPage: true })
  console.log(`✓ mobile-${name}.png`)
}

console.log(`\nSaved to: ${OUTPUT}/`)
await browser.close()
