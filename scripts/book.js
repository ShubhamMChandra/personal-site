/**
 * ═══════════════════════════════════════════════════════════
 * book.js - Open Book View
 * ═══════════════════════════════════════════════════════════
 *
 * WHAT:         Manages open book display, pages, and navigation
 * WHY:          Renders book content with page-turn animations
 * DEPENDENCIES: None (standalone class, instantiated by main.js)
 * HOW:          Loads templates, renders spreads, animates page turns
 *
 * ═══════════════════════════════════════════════════════════
 */

class Book {
  constructor() {
    this.bookView = document.querySelector('.book-view')
    this.leftPage = document.querySelector('.page-content[data-page="left"]')
    this.rightPage = document.querySelector('.page-content[data-page="right"]')
    this.prevBtn = document.querySelector('.page-prev')
    this.nextBtn = document.querySelector('.page-next')
    this.currentPageEl = document.querySelector('.current-page')
    this.totalPagesEl = document.querySelector('.total-pages')

    // Page elements for 3D turn animation
    this.leftPageEl = document.querySelector('.page-left')
    this.rightPageEl = document.querySelector('.page-right')

    // Page curl elements for click-to-turn
    this.leftPageCurl = document.querySelector('.page-left .page-curl')
    this.rightPageCurl = document.querySelector('.page-right .page-curl')

    // Page-turn leaf engine elements
    this.openBookEl = document.querySelector('.open-book')
    this.turnLeaf = document.querySelector('.turn-leaf')
    this.frontFace = document.querySelector('.turn-leaf-front')
    this.backFace = document.querySelector('.turn-leaf-back')
    this.frontContent = document.querySelector('.turn-leaf-front .page-content')
    this.backContent = document.querySelector('.turn-leaf-back .page-content')
    this.leafShade = document.querySelector('.turn-leaf-shade')
    this.shadowLeft = document.querySelector('.page-shadow-left')
    this.shadowRight = document.querySelector('.page-shadow-right')

    // Timing — single source of truth lives in CSS (:root tokens)
    const rootStyles = getComputedStyle(document.documentElement)
    this.turnMs = (parseFloat(rootStyles.getPropertyValue('--duration-turn')) || 0.72) * 1000
    this.turnEase = (rootStyles.getPropertyValue('--ease-page-turn') || 'ease').trim() || 'ease'

    // Capability + motion preference
    this.supportsLeaf = typeof CSS !== 'undefined' && !!CSS.supports &&
      CSS.supports('backface-visibility', 'hidden')
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
    this.reduceMotion = motionQuery.matches
    motionQuery.addEventListener('change', (e) => { this.reduceMotion = e.matches })

    this.currentBook = null
    this.pages = []
    this.currentPage = 0
    this.targetPage = 0
    this.chasing = false

    // Callback for closing book (set by main.js)
    this.onCloseBook = null

    this.init()
  }

  init() {
    this.bindEvents()
  }

  setOnCloseBook(callback) {
    this.onCloseBook = callback
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevPage())
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextPage())
    }

    // Page curl click handlers
    if (this.leftPageCurl) {
      this.leftPageCurl.addEventListener('click', () => this.prevPage())
      this.leftPageCurl.setAttribute('role', 'button')
      this.leftPageCurl.setAttribute('aria-label', 'Previous page')
      this.leftPageCurl.setAttribute('tabindex', '0')
      this.leftPageCurl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.prevPage()
        }
      })
    }

    if (this.rightPageCurl) {
      this.rightPageCurl.addEventListener('click', () => this.nextPage())
      this.rightPageCurl.setAttribute('role', 'button')
      this.rightPageCurl.setAttribute('aria-label', 'Next page')
      this.rightPageCurl.setAttribute('tabindex', '0')
      this.rightPageCurl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.nextPage()
        }
      })
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.bookView.classList.contains('is-visible')) return

      if (e.key === 'ArrowLeft') {
        this.prevPage()
      } else if (e.key === 'ArrowRight') {
        this.nextPage()
      }
    })

    // Click outside book to close (click on dark backdrop)
    if (this.bookView) {
      this.bookView.addEventListener('click', (e) => {
        // Only close if clicking the backdrop itself, not children
        if (e.target === this.bookView && this.onCloseBook) {
          this.onCloseBook()
        }
      })
    }

    // Table of Contents click handler (event delegation)
    if (this.rightPage) {
      this.rightPage.addEventListener('click', (e) => {
        const tocEntry = e.target.closest('[data-goto-page]')
        if (tocEntry) {
          const pageNum = parseInt(tocEntry.dataset.gotoPage, 10)
          if (!isNaN(pageNum)) {
            this.goToPage(pageNum)
          }
        }
      })
    }
  }

  openBook(bookId) {
    this.currentBook = bookId
    this.loadBookContent(bookId)
    this.currentPage = 0
    this.targetPage = 0
    this.renderPage()
    this.bookView.classList.add('is-visible')
    this.bookView.setAttribute('aria-hidden', 'false')
    this.bookView.dataset.activeBook = bookId
  }

  closeBook() {
    this.bookView.classList.remove('is-visible')
    this.bookView.classList.remove('is-turning')
    this.bookView.setAttribute('aria-hidden', 'true')
    delete this.bookView.dataset.activeBook
    // Reset any in-flight turn so the next open starts clean
    if (this.turnLeaf) {
      this.turnLeaf.getAnimations().forEach((a) => a.cancel())
      this.turnLeaf.hidden = true
      this.turnLeaf.style.willChange = ''
    }
    this.currentBook = null
    this.pages = []
    this.currentPage = 0
    this.targetPage = 0
    this.chasing = false
  }

  loadBookContent(bookId) {
    const template = document.querySelector(`#${bookId}-book`)
    if (!template) {
      console.warn(`No template found for book: ${bookId}`)
      this.pages = []
      return
    }

    const content = template.content.cloneNode(true)
    const pageElements = content.querySelectorAll('.book-page')
    this.pages = Array.from(pageElements)
  }

  renderPage() {
    if (this.pages.length === 0) {
      this.leftPage.innerHTML = '<p>No content available</p>'
      this.rightPage.innerHTML = ''
      this.updatePageIndicator()
      this.updateNavButtons()
      return
    }

    const isMobile = window.innerWidth <= 900
    const currentSpread = this.pages[this.currentPage]

    this.leftPage.innerHTML = ''
    this.rightPage.innerHTML = ''

    if (!currentSpread) return

    // Check if this is a two-page spread (has .spread-left and .spread-right)
    const leftContent = currentSpread.querySelector('.spread-left')
    const rightContent = currentSpread.querySelector('.spread-right')

    if (leftContent && rightContent) {
      // Two-page spread layout
      if (isMobile) {
        // Mobile single column: fold the left page in above the right so
        // its headshot / chapter intro isn't dropped. A rule separates them.
        const leftClone = leftContent.cloneNode(true)
        leftClone.classList.add('mobile-left-inline')
        this.rightPage.appendChild(leftClone)
        this.rightPage.appendChild(rightContent.cloneNode(true))
      } else {
        this.leftPage.appendChild(leftContent.cloneNode(true))
        this.rightPage.appendChild(rightContent.cloneNode(true))
      }
    } else {
      // Legacy single-page layout (fallback)
      if (isMobile) {
        this.rightPage.appendChild(currentSpread.cloneNode(true))
      } else {
        this.rightPage.appendChild(currentSpread.cloneNode(true))
        // Show chapter title on left for first page
        if (this.currentPage === 0 && this.currentBook) {
          const titleDiv = document.createElement('div')
          titleDiv.className = 'book-title-page'
          titleDiv.innerHTML = `
            <span class="book-chapter">Chapter ${this.currentPage + 1}</span>
            <h2 class="book-section-title">${this.formatBookTitle(this.currentBook)}</h2>
          `
          this.leftPage.appendChild(titleDiv)
        }
      }
    }

    // Add page furniture (page numbers and running header)
    this.addPageFurniture(isMobile)

    this.updatePageIndicator()
    this.updateNavButtons()
  }

  addPageFurniture(isMobile) {
    const leftPageNum = (this.currentPage * 2) + 1
    const rightPageNum = leftPageNum + 1
    const bookTitle = this.formatBookTitle(this.currentBook)

    // Remove existing furniture
    document.querySelectorAll('.page-number, .running-header').forEach(el => el.remove())

    if (!isMobile) {
      // Left page: page number bottom-left
      const leftNum = document.createElement('span')
      leftNum.className = 'page-number page-number-left'
      leftNum.textContent = leftPageNum
      this.leftPageEl.appendChild(leftNum)

      // Right page: page number bottom-right, running header top-right
      const rightNum = document.createElement('span')
      rightNum.className = 'page-number page-number-right'
      rightNum.textContent = rightPageNum
      this.rightPageEl.appendChild(rightNum)

      const header = document.createElement('span')
      header.className = 'running-header'
      header.textContent = bookTitle
      this.rightPageEl.appendChild(header)
    } else {
      // Mobile: single page number
      const pageNum = document.createElement('span')
      pageNum.className = 'page-number page-number-right'
      pageNum.textContent = this.currentPage + 1
      this.rightPageEl.appendChild(pageNum)
    }
  }

  formatBookTitle(bookId) {
    const titles = {
      work: 'Selected Work',
      about: 'About Me',
      contact: 'Get in Touch',
      references: 'References',
      colophon: 'Colophon'
    }
    return titles[bookId] || bookId
  }

  updatePageIndicator() {
    const total = this.pages.length || 1
    const current = this.currentPage + 1

    if (this.currentPageEl) {
      this.currentPageEl.textContent = current
    }
    if (this.totalPagesEl) {
      this.totalPagesEl.textContent = total
    }
  }

  updateNavButtons() {
    const isFirstPage = this.currentPage === 0
    const isLastPage = this.currentPage >= this.pages.length - 1

    if (this.prevBtn) {
      this.prevBtn.disabled = isFirstPage
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = isLastPage
    }

    // Update page curl states
    if (this.leftPageCurl) {
      this.leftPageCurl.classList.toggle('is-disabled', isFirstPage)
      this.leftPageCurl.setAttribute('aria-disabled', isFirstPage)
    }
    if (this.rightPageCurl) {
      this.rightPageCurl.classList.toggle('is-disabled', isLastPage)
      this.rightPageCurl.setAttribute('aria-disabled', isLastPage)
    }
  }

  // ─── Navigation intent (target-chasing queue) ──────────────────
  // Clicks/keys update a target; the chase loop turns one leaf at a
  // time toward it, so rapid input riffles and settles on the right
  // spread instead of stacking or dropping turns.

  prevPage() {
    if (this.targetPage <= 0) return
    this.targetPage--
    this.runChase()
  }

  nextPage() {
    if (this.targetPage >= this.pages.length - 1) return
    this.targetPage++
    this.runChase()
  }

  async runChase() {
    if (this.chasing) return
    this.chasing = true
    try {
      while (this.currentPage !== this.targetPage) {
        const direction = this.targetPage > this.currentPage ? 'next' : 'prev'
        await this.turnTo(direction)
      }
    } finally {
      this.chasing = false
    }
  }

  // Dispatch a single one-step turn by the best available technique.
  // Reduced motion still gets the leaf flip, just a flatter/quicker one
  // (gentle=true) — the crossfade is only a last resort when the 3D leaf
  // is unsupported.
  async turnTo(direction) {
    if (window.innerWidth <= 900) return this.slideTo(direction)
    if (!this.supportsLeaf || !this.turnLeaf) {
      return this.reduceMotion ? this.crossfade(direction) : this.instantTurn(direction)
    }
    try {
      await this.leafTo(direction, this.reduceMotion)
    } catch (err) {
      // 3D flip failed (older engine) — fall back to an instant swap
      console.warn('Page-turn leaf failed, using instant swap', err)
      this.instantTurn(direction)
    }
  }

  instantTurn(direction) {
    this.currentPage += direction === 'next' ? 1 : -1
    this.renderPage()
  }

  // Fill an arbitrary content element with one side of a given spread
  fillSide(contentEl, spreadIndex, side) {
    if (!contentEl) return
    contentEl.innerHTML = ''
    const spread = this.pages[spreadIndex]
    if (!spread) return
    const leftContent = spread.querySelector('.spread-left')
    const rightContent = spread.querySelector('.spread-right')
    if (leftContent && rightContent) {
      const src = side === 'left' ? leftContent : rightContent
      contentEl.appendChild(src.cloneNode(true))
    } else if (side === 'right') {
      // Legacy single-content spread lives on the right side
      contentEl.appendChild(spread.cloneNode(true))
    }
  }

  // ─── Desktop: real single-leaf 3D flip via the Web Animations API ──
  // gentle=true (reduced motion) flattens the arc and shortens it.
  async leafTo(direction, gentle = false) {
    const from = this.currentPage
    const isNext = direction === 'next'
    const to = isNext ? from + 1 : from - 1
    const leaf = this.turnLeaf

    const frontSide = isNext ? 'right' : 'left'
    const backSide = isNext ? 'left' : 'right'

    // Front = the half we turn from; back = the half we land on.
    this.frontFace.className = 'turn-leaf-face turn-leaf-front is-' + frontSide
    this.backFace.className = 'turn-leaf-face turn-leaf-back is-' + backSide
    this.fillSide(this.frontContent, from, frontSide)
    this.fillSide(this.backContent, to, backSide)

    // Pre-swap the static half hidden behind the leaf so it is correct
    // the instant the leaf lifts away from it (kills the reveal snap).
    this.fillSide(isNext ? this.rightPage : this.leftPage, to, isNext ? 'right' : 'left')

    // Clear any lingering fills, then position + reveal the leaf.
    ;[leaf, this.leafShade, this.shadowLeft, this.shadowRight]
      .forEach((el) => el && el.getAnimations().forEach((a) => a.cancel()))
    leaf.classList.remove('turn-leaf--next', 'turn-leaf--prev')
    leaf.classList.add(isNext ? 'turn-leaf--next' : 'turn-leaf--prev')
    leaf.style.willChange = 'transform'
    leaf.hidden = false
    this.bookView.classList.add('is-turning')
    void leaf.offsetWidth // flush layout so the start transform applies

    const endDeg = isNext ? -180 : 180
    const midDeg = endDeg / 2
    // Full motion arcs the leaf toward the reader at mid-flight (translateZ
    // lift) so it reads as paper peeling off the spine, not a flat pivot.
    // Reduced motion keeps it flat and quick.
    const lift = gentle ? 1 : 62
    const dur = gentle ? Math.round(this.turnMs * 0.6) : this.turnMs
    const shadePeak = gentle ? 0.4 : 0.6
    const anims = [
      leaf.animate(
        [
          { transform: 'translateZ(1px) rotateY(0deg)', offset: 0 },
          { transform: `translateZ(${lift}px) rotateY(${midDeg}deg)`, offset: 0.5 },
          { transform: `translateZ(1px) rotateY(${endDeg}deg)`, offset: 1 }
        ],
        { duration: dur, easing: this.turnEase, fill: 'forwards' }
      ),
      this.leafShade.animate(
        [{ opacity: 0 }, { opacity: shadePeak, offset: 0.45 }, { opacity: 0 }],
        { duration: dur, easing: 'ease-in-out' }
      )
    ]
    // The revealed half darkens early; the covered half darkens late.
    const liftShadow = isNext ? this.shadowRight : this.shadowLeft
    const landShadow = isNext ? this.shadowLeft : this.shadowRight
    if (liftShadow) {
      anims.push(liftShadow.animate(
        [{ opacity: 0 }, { opacity: 0.5, offset: 0.25 }, { opacity: 0, offset: 0.62 }],
        { duration: dur, easing: 'ease-out' }
      ))
    }
    if (landShadow) {
      anims.push(landShadow.animate(
        [{ opacity: 0, offset: 0.38 }, { opacity: 0.5, offset: 0.82 }, { opacity: 0 }],
        { duration: dur, easing: 'ease-in' }
      ))
    }

    await Promise.all(anims.map((a) => a.finished))

    // Commit the destination while the leaf still covers the landing
    // half, then retire the leaf — nothing changes in view instantly.
    this.currentPage = to
    this.renderPage()
    leaf.hidden = true
    leaf.style.willChange = ''
    leaf.classList.remove('turn-leaf--next', 'turn-leaf--prev')
    this.bookView.classList.remove('is-turning')
  }

  // ─── Mobile: direction-aware slide + fade (single visible page) ──
  async slideTo(direction) {
    const isNext = direction === 'next'
    const to = isNext ? this.currentPage + 1 : this.currentPage - 1
    const outX = isNext ? -24 : 24
    const inX = isNext ? 24 : -24
    const page = this.rightPage

    const outAnim = page.animate(
      [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: `translateX(${outX}px)` }
      ],
      { duration: 180, easing: 'ease-in', fill: 'forwards' }
    )
    await outAnim.finished
    this.currentPage = to
    this.renderPage()
    outAnim.cancel()
    await page.animate(
      [
        { opacity: 0, transform: `translateX(${inX}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      { duration: 200, easing: 'ease-out' }
    ).finished
  }

  // ─── Reduced motion: dissolve the page CONTENT on the stable cream
  // pages. Never fade the whole book to opacity 0 — that reveals the dark
  // backdrop and reads as a black flash. Only the ink crossfades. ──────
  async crossfade(direction) {
    const to = direction === 'next' ? this.currentPage + 1 : this.currentPage - 1
    const targets = [this.leftPage, this.rightPage].filter(Boolean)
    await Promise.all(targets.map((t) =>
      t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in', fill: 'forwards' }).finished
    ))
    this.currentPage = to
    this.renderPage()
    targets.forEach((t) => t.getAnimations().forEach((a) => a.cancel()))
    await Promise.all(targets.map((t) =>
      t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }).finished
    ))
  }

  goToPage(pageNum) {
    if (pageNum < 0 || pageNum >= this.pages.length) return
    this.currentPage = pageNum
    this.targetPage = pageNum
    this.renderPage()
  }

  getCurrentPage() {
    return this.currentPage
  }

  getTotalPages() {
    return this.pages.length
  }
}

window.Book = Book
