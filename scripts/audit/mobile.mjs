/**
 * ============================================================
 * MOBILE AUDIT - iPhone 16 viewport, Chrome + Safari
 * ============================================================
 *
 * WHEN TO USE:
 * - After making CSS changes that might affect mobile layout
 * - When fixing mobile-specific bugs
 * - To verify responsive design works on phones
 * - When user reports mobile display issues
 *
 * WHAT IT CAPTURES:
 * - Bookshelf view on mobile (both engines)
 * - Each book's first page on mobile (both engines)
 *
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * - Playwright browsers: npx playwright install chromium webkit
 *
 * RUN:
 * - npm run audit:mobile
 *
 * OUTPUT:
 * - ./audit-screenshots/mobile-chrome-*.png
 * - ./audit-screenshots/mobile-safari-*.png
 * ============================================================
 */
import { chromium, webkit } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const books = [
  { hash: '', name: 'shelf', desc: 'bookshelf homepage' },
  { hash: 'work', name: 'work', desc: 'Work book' },
  { hash: 'about', name: 'about', desc: 'About book' },
  { hash: 'contact', name: 'contact', desc: 'Contact book' },
  { hash: 'references', name: 'references', desc: 'References book' }
]

// iPhone 16 viewport
const mobileContext = {
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
}

const engines = [
  { name: 'chrome', launcher: chromium },
  { name: 'safari', launcher: webkit }
]

for (const engine of engines) {
  const browser = await engine.launcher.launch()
  const context = await browser.newContext(mobileContext)
  const page = await context.newPage()

  console.log(`📱 Mobile audit — ${engine.name} (iPhone 16, 393x852)\n`)

  for (const book of books) {
    const url = book.hash ? `http://localhost:3847/#${book.hash}` : 'http://localhost:3847'
    await page.goto(url)
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${OUTPUT}/mobile-${engine.name}-${book.name}.png` })
    console.log(`  ✓ mobile-${engine.name}-${book.name}.png (${book.desc})`)
  }

  // Check horizontal overflow
  await page.goto('http://localhost:3847')
  await page.waitForTimeout(800)
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  console.log(`  Horizontal overflow: ${overflow}px\n`)

  await browser.close()
}

console.log(`📁 Saved to: ${OUTPUT}/`)
