/**
 * Mobile Layout Diagnosis Script
 * Usage: npm run audit:mobile-diagnosis
 * 
 * Comprehensive Playwright diagnostic for mobile book page layouts.
 * Tests all books, all pages, at multiple viewport sizes.
 * Screenshots are capped at viewport height (no fullPage) to stay under 2000px.
 */
import { chromium } from 'playwright'
import fs from 'fs'

const OUTPUT = './audit-screenshots/mobile-diagnosis'
fs.mkdirSync(OUTPUT, { recursive: true })

// Viewports to test - iPhone 16, Samsung Galaxy S24, and desktop verification
const VIEWPORTS = [
  { name: 'iphone-16', width: 393, height: 852 },
  { name: 'iphone-16-pro-max', width: 440, height: 956 },
  { name: 'galaxy-s24', width: 360, height: 780 },
  { name: 'desktop-1200', width: 1200, height: 800 }
]

// Books and their expected page counts
const BOOKS = [
  { id: 'work', pages: 5 },
  { id: 'about', pages: 4 },
  { id: 'contact', pages: 1 },
  { id: 'references', pages: 3 }
]

async function diagnose () {
  const browser = await chromium.launch()
  const issues = []

  for (const viewport of VIEWPORTS) {
    console.log(`\n=== Testing ${viewport.name} (${viewport.width}x${viewport.height}) ===`)
    
    const page = await browser.newPage({ 
      viewport: { width: viewport.width, height: viewport.height }
    })

    for (const book of BOOKS) {
      console.log(`\n  📖 ${book.id} book`)
      
      // Navigate to book
      await page.goto(`http://localhost:3847/#${book.id}`)
      await page.waitForTimeout(800) // Wait for animations

      // Get layout diagnostics
      const layoutInfo = await page.evaluate(() => {
        const bookView = document.querySelector('.book-view')
        const openBook = document.querySelector('.open-book')
        const pageRight = document.querySelector('.page-right')
        const pageLeft = document.querySelector('.page-left')
        const pageContent = document.querySelector('.page-content[data-page="right"]')
        const navBtn = document.querySelector('.nav-shelf-btn')
        const bookContainer = document.querySelector('.book-container')

        const getRect = el => el ? el.getBoundingClientRect() : null
        const getComputed = (el, props) => {
          if (!el) return null
          const style = window.getComputedStyle(el)
          const result = {}
          props.forEach(p => result[p] = style[p])
          return result
        }

        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          bookView: {
            visible: bookView?.classList.contains('is-visible'),
            rect: getRect(bookView)
          },
          openBook: {
            rect: getRect(openBook),
            styles: getComputed(openBook, ['width', 'maxWidth', 'margin', 'flexDirection'])
          },
          bookContainer: {
            rect: getRect(bookContainer),
            styles: getComputed(bookContainer, ['flexDirection', 'paddingTop', 'height'])
          },
          pageRight: {
            rect: getRect(pageRight),
            styles: getComputed(pageRight, ['display', 'padding', 'transform'])
          },
          pageLeft: {
            rect: getRect(pageLeft),
            styles: getComputed(pageLeft, ['display'])
          },
          pageContent: {
            rect: getRect(pageContent),
            styles: getComputed(pageContent, ['padding', 'paddingTop', 'overflow']),
            scrollHeight: pageContent?.scrollHeight,
            clientHeight: pageContent?.clientHeight,
            hasOverflow: pageContent ? pageContent.scrollHeight > pageContent.clientHeight : false
          },
          navBtn: {
            rect: getRect(navBtn),
            visible: navBtn ? window.getComputedStyle(navBtn).display !== 'none' : false
          }
        }
      })

      // Log key findings
      console.log(`    Book view visible: ${layoutInfo.bookView.visible}`)
      console.log(`    Page-left display: ${layoutInfo.pageLeft.styles?.display}`)
      console.log(`    Open book width: ${layoutInfo.openBook.styles?.width}`)
      console.log(`    Container padding-top: ${layoutInfo.bookContainer.styles?.paddingTop}`)
      console.log(`    Content has overflow: ${layoutInfo.pageContent.hasOverflow}`)
      
      // Check for issues
      if (layoutInfo.pageLeft.styles?.display !== 'none') {
        issues.push(`${viewport.name}/${book.id}: page-left not hidden`)
      }
      if (layoutInfo.pageContent.hasOverflow) {
        issues.push(`${viewport.name}/${book.id}: content overflow detected`)
      }
      
      // Check if page nav is outside viewport
      const pageNav = await page.$('.page-nav')
      if (pageNav) {
        const navRect = await pageNav.boundingBox()
        if (navRect && navRect.y + navRect.height > viewport.height) {
          issues.push(`${viewport.name}/${book.id}: page navigation outside viewport (y=${Math.round(navRect.y)}, viewportHeight=${viewport.height})`)
        }
      }

      // Screenshot page 1
      await page.screenshot({ 
        path: `${OUTPUT}/${viewport.name}-${book.id}-p1.png`,
        fullPage: false // Keep under 2000px
      })
      console.log(`    ✓ ${viewport.name}-${book.id}-p1.png`)

      // Navigate through remaining pages using keyboard (ArrowRight)
      // This works even when nav buttons are outside viewport
      for (let p = 2; p <= book.pages; p++) {
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(500) // Wait for page turn animation
        
        // Screenshot this page
        await page.screenshot({
          path: `${OUTPUT}/${viewport.name}-${book.id}-p${p}.png`,
          fullPage: false
        })
        console.log(`    ✓ ${viewport.name}-${book.id}-p${p}.png`)

        // Check for overflow on this page too
        const pageOverflow = await page.evaluate(() => {
          const content = document.querySelector('.page-content[data-page="right"]')
          return content ? content.scrollHeight > content.clientHeight : false
        })
        if (pageOverflow) {
          issues.push(`${viewport.name}/${book.id}/p${p}: content overflow`)
        }
      }
    }

    await page.close()
  }

  await browser.close()

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('DIAGNOSIS SUMMARY')
  console.log('='.repeat(50))
  
  if (issues.length === 0) {
    console.log('✅ No major issues detected')
  } else {
    console.log(`⚠️  Found ${issues.length} potential issues:`)
    issues.forEach(issue => console.log(`   - ${issue}`))
  }

  console.log(`\nScreenshots saved to: ${OUTPUT}/`)
  console.log(`Total files: ${VIEWPORTS.length * BOOKS.reduce((sum, b) => sum + b.pages, 0)}`)
}

diagnose().catch(console.error)
