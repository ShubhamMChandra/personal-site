/**
 * Custom onReady script for BackstopJS book-opening scenarios.
 *
 * Reads scenario.bookId to determine which book to open,
 * clicks the corresponding .book[data-book="<id>"] button,
 * then waits for the book-open animation to finish before
 * handing control back to the screenshot capture.
 */
module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label)

  const bookId = scenario.bookId
  if (!bookId) {
    console.log('  No bookId specified — capturing shelf view.')
    return
  }

  const selector = `.book[data-book="${bookId}"]`
  console.log(`  Opening book: ${bookId} via ${selector}`)

  // Wait for the book button to be present in the DOM
  await page.waitForSelector(selector, { timeout: 5000 })

  // Click the book spine to trigger the open animation
  await page.click(selector)

  // Wait for the book-open animation to complete.
  // The bookshelf scene hides after 300ms, then the book view
  // renders. We wait 1200ms total to be safe for all transitions.
  await new Promise(resolve => setTimeout(resolve, 1200))

  // Additionally wait for the open book container to be visible
  await page.waitForSelector('.book-view[aria-hidden="false"]', { timeout: 5000 })
    .catch(() => {
      console.log('  Warning: .book-view[aria-hidden="false"] not found, continuing anyway.')
    })

  // Extra settle time for any CSS transitions / font rendering
  await new Promise(resolve => setTimeout(resolve, 300))
}
