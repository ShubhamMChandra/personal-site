/**
 * ============================================================
 * ABOUT BOOK AUDIT - Screenshot all pages of About book
 * ============================================================
 * 
 * WHEN TO USE:
 * - After editing About book content (bio, skills, interests)
 * - When changing headshot image or layout
 * - To verify the personal info displays correctly
 * - After updating skills or hobbies sections
 * 
 * WHAT IT CAPTURES:
 * - Intro/bio page (page 1)
 * - Technical skills page (page 2)
 * - Currently working on (page 3)
 * - Personal interests (page 4)
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:about
 * 
 * OUTPUT:
 * - ./audit-screenshots/about-1.png through about-4.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('👤 About book audit\n')

await page.goto('http://localhost:3847/#about')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/about-1.png` })
console.log(`✓ about-1.png (Intro/Bio)`)

const pages = ['Technical Skills', 'Currently', 'Personal']
for (let i = 0; i < pages.length; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/about-${i + 2}.png` })
  console.log(`✓ about-${i + 2}.png (${pages[i]})`)
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
