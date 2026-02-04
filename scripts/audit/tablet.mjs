/**
 * ============================================================
 * TABLET AUDIT - iPad viewport (768x1024)
 * ============================================================
 * 
 * WHEN TO USE:
 * - After making CSS changes near the 900px breakpoint
 * - When testing the "in-between" responsive state
 * - To verify tablet-specific layouts
 * - When books might render differently at medium widths
 * 
 * WHAT IT CAPTURES:
 * - Bookshelf view on tablet
 * - Each book's first page on tablet
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:tablet
 * 
 * OUTPUT:
 * - ./audit-screenshots/tablet-shelf.png
 * - ./audit-screenshots/tablet-work.png
 * - ./audit-screenshots/tablet-about.png
 * - ./audit-screenshots/tablet-contact.png
 * - ./audit-screenshots/tablet-references.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()

// iPad viewport
const page = await browser.newPage({ viewport: { width: 768, height: 1024 } })

const books = [
  { hash: '', name: 'shelf', desc: 'bookshelf homepage' },
  { hash: 'work', name: 'work', desc: 'Work book' },
  { hash: 'about', name: 'about', desc: 'About book' },
  { hash: 'contact', name: 'contact', desc: 'Contact book' },
  { hash: 'references', name: 'references', desc: 'References book' }
]

console.log('📱 Tablet audit (768x1024 - iPad)\n')

for (const book of books) {
  const url = book.hash ? `http://localhost:3847/#${book.hash}` : 'http://localhost:3847'
  await page.goto(url)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT}/tablet-${book.name}.png`, fullPage: true })
  console.log(`✓ tablet-${book.name}.png (${book.desc})`)
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
