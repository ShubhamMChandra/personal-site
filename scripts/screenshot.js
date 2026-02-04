import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function takeScreenshots() {
  // Ensure screenshots directory exists
  const screenshotsDir = path.join(__dirname, '..', 'screenshots')
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  
  const filePath = 'file://' + path.join(__dirname, '..', 'index.html')
  await page.goto(filePath)
  await page.waitForTimeout(2000) // Wait for initial animations
  
  // Screenshot 1: Bookshelf view
  await page.screenshot({ path: path.join(screenshotsDir, '1-bookshelf.png') })
  console.log('Captured: bookshelf')
  
  // Screenshot 2: Work book - ToC
  await page.click('[data-book="work"]', { force: true })
  await page.waitForTimeout(1500) // Wait for book open animation
  await page.screenshot({ path: path.join(screenshotsDir, '2-work-toc.png') })
  console.log('Captured: work ToC')
  
  // Screenshot 3: Work book - page 2 (Consulting)
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '3-work-consulting.png') })
  console.log('Captured: work consulting')
  
  // Screenshot 4: Work book - page 3 (Garner)
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '4-work-garner.png') })
  console.log('Captured: work garner')
  
  // Screenshot 5: NJOY
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '5-work-njoy.png') })
  console.log('Captured: work njoy')
  
  // Screenshot 6: L.E.K.
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '6-work-lek.png') })
  console.log('Captured: work lek')
  
  // Go back to shelf
  await page.click('[data-action="return-to-shelf"]', { force: true })
  await page.waitForTimeout(1500)
  
  // Screenshot 7: About book - page 1
  await page.click('[data-book="about"]', { force: true })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(screenshotsDir, '7-about-intro.png') })
  console.log('Captured: about intro')
  
  // Navigate through about pages
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '8-about-technical.png') })
  console.log('Captured: about technical')
  
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '9-about-currently.png') })
  console.log('Captured: about currently')
  
  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '10-about-personal.png') })
  console.log('Captured: about personal')

  // Go back to shelf
  await page.click('[data-action="return-to-shelf"]', { force: true })
  await page.waitForTimeout(1500)

  // Screenshot 11: Contact book
  await page.click('[data-book="contact"]', { force: true })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(screenshotsDir, '11-contact.png') })
  console.log('Captured: contact')

  // Go back to shelf
  await page.click('[data-action="return-to-shelf"]', { force: true })
  await page.waitForTimeout(1500)

  // Screenshot 12-14: References book
  await page.click('[data-book="references"]', { force: true })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(screenshotsDir, '12-references-1.png') })
  console.log('Captured: references page 1 (Greg)')

  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '13-references-2.png') })
  console.log('Captured: references page 2 (Geremy)')

  await page.click('.page-next', { force: true })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(screenshotsDir, '14-references-3.png') })
  console.log('Captured: references page 3 (Stephanie)')

  await browser.close()
  console.log('\nAll screenshots saved to screenshots/')
}

takeScreenshots().catch(console.error)
