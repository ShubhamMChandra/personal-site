/**
 * ============================================================
 * SHELF AUDIT - Screenshot the bookshelf homepage
 * ============================================================
 * 
 * WHEN TO USE:
 * - After making changes to bookshelf layout or styling
 * - When adjusting book spine designs or colors
 * - To verify the "closed books" state looks correct
 * - When debugging shelf positioning issues
 * 
 * WHAT IT CAPTURES:
 * - Full bookshelf view at desktop width (1440px)
 * - All book spines visible in their default positions
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:shelf
 * 
 * OUTPUT:
 * - ./audit-screenshots/shelf.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('📚 Shelf audit\n')

await page.goto('http://localhost:3847')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUTPUT}/shelf.png`, fullPage: true })

console.log(`✓ shelf.png`)
console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
