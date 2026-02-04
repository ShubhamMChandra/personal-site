/**
 * Book Module
 * Handles open book view, page navigation, and content rendering
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

    // Page curl elements for click-to-turn
    this.leftPageCurl = document.querySelector('.page-left .page-curl')
    this.rightPageCurl = document.querySelector('.page-right .page-curl')

    this.currentBook = null
    this.pages = []
    this.currentPage = 0
    this.isAnimating = false

    this.init()
  }

  init() {
    this.bindEvents()
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
  }

  openBook(bookId) {
    this.currentBook = bookId
    this.loadBookContent(bookId)
    this.currentPage = 0
    this.renderPage()
    this.bookView.classList.add('is-visible')
    this.bookView.setAttribute('aria-hidden', 'false')
  }

  closeBook() {
    this.bookView.classList.remove('is-visible')
    this.bookView.setAttribute('aria-hidden', 'true')
    this.currentBook = null
    this.pages = []
    this.currentPage = 0
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
        // Mobile: show right content only, or combine both
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

    this.updatePageIndicator()
    this.updateNavButtons()
  }

  formatBookTitle(bookId) {
    const titles = {
      work: 'Selected Work',
      about: 'About Me',
      contact: 'Get in Touch'
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

  prevPage() {
    if (this.currentPage <= 0 || this.isAnimating) return

    this.isAnimating = true
    this.animatePageTurn('prev', () => {
      this.currentPage--
      this.renderPage()
      this.isAnimating = false
    })
  }

  nextPage() {
    if (this.currentPage >= this.pages.length - 1 || this.isAnimating) return

    this.isAnimating = true
    this.animatePageTurn('next', () => {
      this.currentPage++
      this.renderPage()
      this.isAnimating = false
    })
  }

  animatePageTurn(direction, callback) {
    const outClass = direction === 'next' ? 'is-turning-out' : 'is-turning-in'
    const inClass = direction === 'next' ? 'is-turning-in' : 'is-turning-out'

    this.rightPage.classList.add(outClass)

    setTimeout(() => {
      callback()
      this.rightPage.classList.remove(outClass)
      this.rightPage.classList.add(inClass)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.rightPage.classList.remove(inClass)
        })
      })
    }, 200)
  }

  goToPage(pageNum) {
    if (pageNum < 0 || pageNum >= this.pages.length) return
    this.currentPage = pageNum
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
