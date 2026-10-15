/**
 * ============================================================
 * DESIGN SPOT-CHECKS - Targeted Playwright verification
 * ============================================================
 *
 * WHEN TO USE:
 * - After changing scroll-fade, chapter markers, Beyond Work typography
 * - After mystery tooltip or custom cursor behavior
 *
 * PREREQUISITES:
 * - Server running: npx serve -p 3847
 *
 * RUN:
 * - npm run audit:design-verify
 *
 * OUTPUT:
 * - ./audit-screenshots/verify-01-initial.png … verify-09-work-spread3.png
 * ============================================================
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots'
const BASE = 'http://localhost:3847'

fs.mkdirSync(OUTPUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})
const page = await context.newPage()
page.setDefaultTimeout(15000)

console.log('🔍 Design verification (spot checks)\n')

try {
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(2000)

  console.log('📸 Screenshot 1: Initial bookshelf view')
  await page.screenshot({ path: `${OUTPUT}/verify-01-initial.png` })
  await page.waitForTimeout(300)

  console.log('\n🔍 Mystery book tooltip')
  await page.evaluate(() => {
    const mysteryBook = document.querySelector('.book-mystery')
    if (mysteryBook) {
      mysteryBook.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      const tooltip = mysteryBook.querySelector('.mystery-tooltip')
      if (tooltip) {
        tooltip.style.opacity = '1'
        tooltip.style.transform = 'translateX(-50%) translateY(0)'
      }
    }
  })
  await page.waitForTimeout(500)

  const tooltip = page.locator('.mystery-tooltip')
  const tooltipVisible = await tooltip.isVisible()
  const tooltipText = await tooltip.textContent()
  console.log(`  ✓ Tooltip visible: ${tooltipVisible}`)
  console.log(`  ✓ Tooltip text: "${tooltipText}"`)
  console.log('📸 Screenshot 2: Mystery book tooltip')
  await page.screenshot({ path: `${OUTPUT}/verify-02-mystery-tooltip.png` })

  console.log('\n🔍 Custom cursor element')
  const cursorElement = page.locator('.cursor')
  const cursorExists = await cursorElement.count() > 0
  console.log(`  ✓ Custom cursor element exists: ${cursorExists}`)

  console.log('\n📖 Opening About book...')
  await page.click('[data-book="about"]', { force: true })
  await page.waitForTimeout(1500)

  console.log('📸 Screenshot 3: About book page 1')
  await page.screenshot({ path: `${OUTPUT}/verify-03-about-page1.png` })

  console.log('\n📖 Navigating to page 2 (Beyond Work)...')
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(800)

  console.log('\n🔍 Beyond Work text formatting (drop cap / rules)')
  const personalContent = page.locator('.personal-content')
  const firstParagraph = personalContent.locator('p').first()
  const firstLetterStyle = await firstParagraph.evaluate(el => {
    const styles = window.getComputedStyle(el, '::first-letter')
    return {
      fontSize: styles.fontSize,
      float: styles.float,
      fontFamily: styles.fontFamily
    }
  })
  console.log(`  ✓ First letter font-size: ${firstLetterStyle.fontSize}`)
  console.log(`  ✓ First letter float: ${firstLetterStyle.float}`)
  const paragraphs = await personalContent.locator('p').count()
  console.log(`  ✓ Number of paragraphs: ${paragraphs}`)

  console.log('📸 Screenshot 4: Beyond Work page (desktop)')
  await page.screenshot({ path: `${OUTPUT}/verify-04-beyond-work-desktop.png` })

  console.log('\n🔍 Mobile scroll-fade indicator')
  await page.setViewportSize({ width: 393, height: 852 })
  await page.waitForTimeout(1000)

  const scrollFadeExists = await page.evaluate(() => {
    const pageRight = document.querySelector('.page-right')
    if (!pageRight) return null
    const afterStyles = window.getComputedStyle(pageRight, '::after')
    return {
      hasContent: afterStyles.content !== 'none',
      hasGradient: afterStyles.background.includes('gradient'),
      height: afterStyles.height
    }
  })
  if (scrollFadeExists) {
    console.log(`  ✓ ::after present: ${scrollFadeExists.hasContent}`)
    console.log(`  ✓ gradient background: ${scrollFadeExists.hasGradient}`)
    console.log(`  ✓ height: ${scrollFadeExists.height}`)
  } else {
    console.log('  ⚠ .page-right not found')
  }

  console.log('📸 Screenshot 5: Beyond Work page (mobile)')
  await page.screenshot({ path: `${OUTPUT}/verify-05-beyond-work-mobile.png` })

  console.log('\nScrolling .page-right to surface fade...')
  await page.locator('.page-right').evaluate(el => { el.scrollTop = 100 })
  await page.waitForTimeout(500)

  console.log('📸 Screenshot 6: Beyond Work scrolled (mobile)')
  await page.screenshot({ path: `${OUTPUT}/verify-06-beyond-work-scrolled.png` })

  console.log('\n📖 Returning to shelf...')
  await page.click('.nav-shelf-btn', { force: true })
  await page.waitForTimeout(1000)

  console.log('\n🔍 Chapter watermarks (desktop)')
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.waitForTimeout(1000)

  console.log('📖 Opening Work book...')
  await page.click('[data-book="work"]', { force: true })
  await page.waitForTimeout(1500)

  console.log('📸 Screenshot 7: Work book — first spread')
  await page.screenshot({ path: `${OUTPUT}/verify-07-work-spread1.png` })

  const chapterWatermark = await page.evaluate(() => {
    const chapterDivider = document.querySelector('.chapter-divider[data-chapter]')
    if (!chapterDivider) return { exists: false }
    const beforeStyles = window.getComputedStyle(chapterDivider, '::before')
    return {
      exists: true,
      content: beforeStyles.content.replace(/"/g, ''),
      fontSize: beforeStyles.fontSize,
      opacity: beforeStyles.opacity,
      color: beforeStyles.color
    }
  })
  console.log(`  ✓ Chapter watermark exists: ${chapterWatermark.exists}`)
  if (chapterWatermark.exists) {
    console.log(`  ✓ Content: "${chapterWatermark.content}"`)
    console.log(`  ✓ Font size: ${chapterWatermark.fontSize}`)
    console.log(`  ✓ Opacity: ${chapterWatermark.opacity}`)
  }

  console.log('\n📖 Next spread...')
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(800)
  console.log('📸 Screenshot 8: Work book — second spread')
  await page.screenshot({ path: `${OUTPUT}/verify-08-work-spread2.png` })

  console.log('\n📖 Next spread...')
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(800)
  console.log('📸 Screenshot 9: Work book — third spread')
  await page.screenshot({ path: `${OUTPUT}/verify-09-work-spread3.png` })

  console.log('\n✅ Done. Files: verify-01 … verify-09 in', `${OUTPUT}/`)
} catch (error) {
  console.error('❌ Error during verification:', error)
  process.exitCode = 1
} finally {
  await browser.close()
}
