/**
 * ============================================================
 * WORK BOOK AUDIT - Screenshot all pages of Work book
 * ============================================================
 * 
 * WHEN TO USE:
 * - After editing Work book content (jobs, descriptions)
 * - When changing page layout or typography for work entries
 * - To verify page turn animations work correctly
 * - After updating resume/work history content
 * 
 * WHAT IT CAPTURES:
 * - Table of Contents (page 1)
 * - Consulting page (page 2)
 * - Garner Health page (page 3)
 * - NJOY page (page 4)
 * - L.E.K. page (page 5)
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:work
 * 
 * OUTPUT:
 * - ./audit-screenshots/work-1.png through work-5.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('💼 Work book audit\n')

await page.goto('http://localhost:3847/#work')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/work-1.png` })
console.log(`✓ work-1.png (Table of Contents)`)

const pages = ['Consulting', 'Garner Health', 'NJOY', 'L.E.K.']
for (let i = 0; i < pages.length; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/work-${i + 2}.png` })
  console.log(`✓ work-${i + 2}.png (${pages[i]})`)
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
