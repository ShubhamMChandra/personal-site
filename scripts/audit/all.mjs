/**
 * Quick audit: Screenshot everything (shelf + all books, first page only)
 * Usage: npm run audit:all
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Shelf
await page.goto('http://localhost:3847')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUTPUT}/all-shelf.png`, fullPage: true })
console.log(`✓ all-shelf.png`)

// Each book (first page)
const books = ['work', 'about', 'contact', 'references']
for (const book of books) {
  await page.goto(`http://localhost:3847/#${book}`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT}/all-${book}.png`, fullPage: true })
  console.log(`✓ all-${book}.png`)
}

console.log(`\nSaved to: ${OUTPUT}/`)
await browser.close()
