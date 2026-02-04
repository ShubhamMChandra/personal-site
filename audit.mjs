import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT_DIR = './audit-screenshots'

async function audit() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  })
  const page = await context.newPage()

  console.log('=== VISUAL & UX AUDIT ===\n')

  // 1. Homepage / Bookshelf state
  console.log('1. HOMEPAGE / BOOKSHELF STATE')
  await page.goto('http://localhost:3847')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${OUTPUT_DIR}/01-homepage.png`, fullPage: true })
  console.log('   Screenshot: 01-homepage.png')

  // 2. Open Work book via URL
  console.log('\n2. WORK BOOK')
  await page.goto('http://localhost:3847/#work')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUTPUT_DIR}/02-work.png`, fullPage: true })
  console.log('   Screenshot: 02-work.png')

  // Page turn via keyboard
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUTPUT_DIR}/03-work-page2.png` })
  console.log('   Screenshot: 03-work-page2.png')

  // 3. About book
  console.log('\n3. ABOUT BOOK')
  await page.goto('http://localhost:3847/#about')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/04-about.png`, fullPage: true })

  // 4. Contact book
  console.log('\n4. CONTACT BOOK')
  await page.goto('http://localhost:3847/#contact')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/05-contact.png`, fullPage: true })

  // 5. References book
  console.log('\n5. REFERENCES BOOK')
  await page.goto('http://localhost:3847/#references')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/06-references.png`, fullPage: true })

  // 6. Mobile viewport
  console.log('\n6. MOBILE VIEWPORT (375px)')
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('http://localhost:3847')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUTPUT_DIR}/07-mobile-home.png`, fullPage: true })

  await page.goto('http://localhost:3847/#work')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/08-mobile-work.png`, fullPage: true })

  await page.goto('http://localhost:3847/#about')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/09-mobile-about.png`, fullPage: true })

  // 7. Tablet viewport
  console.log('\n7. TABLET VIEWPORT (768px)')
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('http://localhost:3847')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/10-tablet-home.png`, fullPage: true })

  await page.goto('http://localhost:3847/#work')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUTPUT_DIR}/11-tablet-work.png`, fullPage: true })

  // 8. Focus states (accessibility)
  console.log('\n8. ACCESSIBILITY AUDIT')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:3847')
  await page.waitForTimeout(800)

  // Tab through elements
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(150)
  }
  await page.screenshot({ path: `${OUTPUT_DIR}/12-focus-state.png` })

  // ARIA and semantic HTML check
  const ariaLabels = await page.$$eval('[aria-label]', els => els.length)
  const roles = await page.$$eval('[role]', els => els.map(e => e.getAttribute('role')))
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(e => ({ tag: e.tagName, text: e.textContent?.slice(0, 50) })))
  const altTexts = await page.$$eval('img', imgs => imgs.map(i => ({ src: i.src.split('/').pop(), alt: i.alt || 'MISSING' })))
  const buttons = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent?.slice(0, 20), ariaLabel: b.getAttribute('aria-label') })))

  console.log(`   aria-label count: ${ariaLabels}`)
  console.log(`   Roles: ${JSON.stringify(roles)}`)
  console.log(`   Headings: ${JSON.stringify(headings)}`)
  console.log(`   Images: ${JSON.stringify(altTexts)}`)
  console.log(`   Buttons: ${JSON.stringify(buttons)}`)

  // 9. Animation/transition analysis
  console.log('\n9. ANIMATIONS & TRANSITIONS')
  const animations = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    const animatedEls = []
    allElements.forEach(el => {
      const style = getComputedStyle(el)
      if (style.transition && style.transition !== 'all 0s ease 0s' && style.transition !== 'none') {
        animatedEls.push({
          tag: el.tagName,
          class: el.className?.toString().slice(0, 40),
          transition: style.transition?.slice(0, 100)
        })
      }
    })
    return animatedEls
  })
  console.log(`   Animated elements (${animations.length}):`)
  animations.slice(0, 8).forEach(a => console.log(`     - ${a.tag}.${a.class}: ${a.transition}`))

  // 10. Color analysis
  console.log('\n10. COLOR PALETTE IN USE')
  const colors = await page.evaluate(() => {
    const colorSet = new Set()
    const bgSet = new Set()
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el)
      if (style.color && style.color !== 'rgba(0, 0, 0, 0)') colorSet.add(style.color)
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') bgSet.add(style.backgroundColor)
    })
    return { textColors: [...colorSet].slice(0, 10), bgColors: [...bgSet].slice(0, 10) }
  })
  console.log(`   Text colors: ${JSON.stringify(colors.textColors)}`)
  console.log(`   Background colors: ${JSON.stringify(colors.bgColors)}`)

  // 11. Typography analysis
  console.log('\n11. TYPOGRAPHY')
  const fonts = await page.evaluate(() => {
    const fontSet = new Set()
    const sizes = new Set()
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el)
      if (el.textContent?.trim()) {
        fontSet.add(style.fontFamily?.split(',')[0])
        sizes.add(style.fontSize)
      }
    })
    return { fonts: [...fontSet].slice(0, 5), sizes: [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b)) }
  })
  console.log(`   Font families: ${JSON.stringify(fonts.fonts)}`)
  console.log(`   Font sizes: ${JSON.stringify(fonts.sizes)}`)

  // 12. Touch target analysis
  console.log('\n12. TOUCH TARGETS')
  const touchTargets = await page.$$eval('button, a, [role="button"], .book, .nav-book, .page-curl', els => {
    return els.map(el => {
      const rect = el.getBoundingClientRect()
      const tooSmall = rect.width < 44 || rect.height < 44
      return {
        el: el.tagName + (el.className ? '.' + el.className.toString().split(' ')[0] : ''),
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        tooSmall
      }
    }).filter(t => t.tooSmall)
  })
  if (touchTargets.length > 0) {
    console.log(`   ⚠️ Small touch targets found:`)
    touchTargets.forEach(t => console.log(`     - ${t.el}: ${t.size}`))
  } else {
    console.log(`   ✓ All touch targets >= 44x44px`)
  }

  // 13. Link analysis
  console.log('\n13. LINKS')
  const links = await page.$$eval('a', anchors => anchors.map(a => ({
    text: a.textContent?.trim().slice(0, 30) || '[no text]',
    href: a.href,
    hasAriaLabel: !!a.getAttribute('aria-label'),
    opensNewTab: a.target === '_blank'
  })))
  console.log(`   Total links: ${links.length}`)
  const externalLinks = links.filter(l => l.opensNewTab)
  if (externalLinks.length > 0) {
    console.log(`   External links (target=_blank): ${externalLinks.length}`)
    externalLinks.forEach(l => console.log(`     - "${l.text}" → has aria-label: ${l.hasAriaLabel}`))
  }

  // 14. Check CSS custom properties
  console.log('\n14. CSS CUSTOM PROPERTIES')
  const cssVars = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const vars = []
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root') {
            const text = rule.cssText
            const matches = text.match(/--[\w-]+/g)
            if (matches) vars.push(...matches)
          }
        }
      } catch (e) {}
    }
    return [...new Set(vars)].slice(0, 15)
  })
  console.log(`   Custom properties: ${cssVars.join(', ')}`)

  await browser.close()
  console.log('\n=== AUDIT COMPLETE ===')
  console.log(`Screenshots saved to: ${OUTPUT_DIR}`)
}

audit().catch(console.error)
