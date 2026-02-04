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

    // For desktop: show two pages (left and right)
    // For mobile: only right page is visible
    const isMobile = window.innerWidth <= 900

    if (isMobile) {
      // Mobile: single page view
      this.rightPage.innerHTML = ''
      if (this.pages[this.currentPage]) {
        this.rightPage.appendChild(this.pages[this.currentPage].cloneNode(true))
      }
    } else {
      // Desktop: two page spread
      // Left page shows nothing on first page, or previous info
      this.leftPage.innerHTML = ''
      this.rightPage.innerHTML = ''

      if (this.pages[this.currentPage]) {
        this.rightPage.appendChild(this.pages[this.currentPage].cloneNode(true))
      }

      // Optionally show book title or chapter info on left
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
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentPage === 0
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentPage >= this.pages.length - 1
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
