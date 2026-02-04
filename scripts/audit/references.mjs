/**
 * ============================================================
 * REFERENCES BOOK AUDIT - Screenshot all pages of References
 * ============================================================
 * 
 * WHEN TO USE:
 * - After editing reference quotes or attributions
 * - When changing reference card layout or styling
 * - To verify testimonial content displays correctly
 * - After adding or removing references
 * 
 * WHAT IT CAPTURES:
 * - Reference 1 (Greg)
 * - Reference 2 (Geremy)
 * - Reference 3 (Stephanie)
 * 
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 * 
 * RUN:
 * - npm run audit:references
 * 
 * OUTPUT:
 * - ./audit-screenshots/references-1.png through references-3.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('📝 References book audit\n')

await page.goto('http://localhost:3847/#references')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUTPUT}/references-1.png` })
console.log(`✓ references-1.png (Greg)`)

const refs = ['Geremy', 'Stephanie']
for (let i = 0; i < refs.length; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUTPUT}/references-${i + 2}.png` })
  console.log(`✓ references-${i + 2}.png (${refs[i]})`)
}

console.log(`\n📁 Saved to: ${OUTPUT}/`)
await browser.close()
