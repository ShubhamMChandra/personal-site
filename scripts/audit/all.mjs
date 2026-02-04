/**
 * ============================================================
 * ALL BOOKS AUDIT - Quick overview of entire site
 * ============================================================
 * 
 * WHEN TO USE:
 * - For a quick visual check of the whole site
 * - After making global CSS changes (fonts, colors, spacing)
 * - To get a baseline before starting work
 * - When you need a fast sanity check (doesn't page through)
 * 
 * WHAT IT CAPTURES:
 * - Bookshelf homepage
 * - First page of each book (Work, About, Contact, References)
 * - Does NOT capture subsequent pages (use individual audits for that)
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:all
 * 
 * OUTPUT:
 * - ./audit-screenshots/all-shelf.png
 * - ./audit-screenshots/all-work.png
 * - ./audit-screenshots/all-about.png
 * - ./audit-screenshots/all-contact.png
 * - ./audit-screenshots/all-references.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('🔍 Full site audit (first page of each)\n')

// Shelf
await page.goto('http://localhost:3847')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUTPUT}/all-shelf.png`, fullPage: true })
console.log(`✓ all-shelf.png (bookshelf)`)

// Each book (first page only)
const books = [
  { hash: 'work', name: 'Work' },
  { hash: 'about', name: 'About' },
  { hash: 'contact', name: 'Contact' },
  { hash: 'references', name: 'References' }
]

for (const book of books) {
  await page.goto(`http://localhost:3847/#${book.hash}`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT}/all-${book.hash}.png`, fullPage: true })
  console.log(`✓ all-${book.hash}.png (${book.name} book)`)
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
