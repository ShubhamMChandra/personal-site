/**
 * ============================================================
 * CONTACT BOOK AUDIT - Screenshot the Contact book
 * ============================================================
 * 
 * WHEN TO USE:
 * - After editing contact info (email, LinkedIn, GitHub links)
 * - When changing contact page layout or styling
 * - To verify social links display correctly
 * - After updating contact CTA text
 * 
 * WHAT IT CAPTURES:
 * - Contact page with all social/contact links
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:contact
 * 
 * OUTPUT:
 * - ./audit-screenshots/contact.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('📧 Contact book audit\n')

await page.goto('http://localhost:3847/#contact')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/contact.png`, fullPage: true })

console.log(`✓ contact.png`)
console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
