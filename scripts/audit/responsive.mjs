/**
 * ============================================================
 * RESPONSIVE AUDIT - All viewports for one book or shelf
 * ============================================================
 * 
 * WHEN TO USE:
 * - When you need to see how ONE specific book looks at all sizes
 * - After making changes to a single book's layout
 * - To compare desktop vs tablet vs mobile for same content
 * 
 * HOW TO USE:
 * - npm run audit:responsive           (defaults to shelf)
 * - npm run audit:responsive work      (Work book at all sizes)
 * - npm run audit:responsive about     (About book at all sizes)
 * - npm run audit:responsive contact
 * - npm run audit:responsive references
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * OUTPUT:
 * - ./audit-screenshots/responsive-{book}-desktop.png (1440px)
 * - ./audit-screenshots/responsive-{book}-tablet.png (768px)
 * - ./audit-screenshots/responsive-{book}-mobile.png (375px)
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

// Get book from command line args (default: shelf)
const book = process.argv[2] || ''
const bookName = book || 'shelf'
const url = book ? `http://localhost:3847/#${book}` : 'http://localhost:3847'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
]

console.log(`📐 Responsive audit for: ${bookName}\n`)

const browser = await chromium.launch()

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(url)
  await page.waitForTimeout(1000)
  const filename = `responsive-${bookName}-${vp.name}.png`
  await page.screenshot({ path: `${OUTPUT}/${filename}`, fullPage: true })
  console.log(`✓ ${filename} (${vp.width}x${vp.height})`)
  await page.close()
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
