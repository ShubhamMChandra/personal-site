/**
 * ═══════════════════════════════════════════════════════════
 * bookshelf.js - Bookshelf Scene
 * ═══════════════════════════════════════════════════════════
 *
 * WHAT:         Controls bookshelf display and book selection
 * WHY:          Main navigation hub, books pull out when clicked
 * DEPENDENCIES: None (standalone class, instantiated by main.js)
 * HOW:          Handles clicks, animates selection, manages collapsed nav
 *
 * ═══════════════════════════════════════════════════════════
 */

class Bookshelf {
  constructor(options = {}) {
    this.scene = document.querySelector('.bookshelf-scene')
    this.books = document.querySelectorAll('.book')
    this.collapsedNav = document.querySelector('.collapsed-nav')
    this.navBookBtns = document.querySelectorAll('.nav-book-btn')
    this.shelfBtn = document.querySelector('.nav-shelf-btn')

    this.onBookSelect = options.onBookSelect || (() => {})
    this.onReturnToShelf = options.onReturnToShelf || (() => {})

    this.selectedBook = null
    this.isAnimating = false

    this.init()
  }

  init() {
    this.bindEvents()
  }

  bindEvents() {
    // Book click handlers
    this.books.forEach(book => {
      book.addEventListener('click', () => {
        if (this.isAnimating) return
        const bookId = book.dataset.book
        this.selectBook(bookId)
      })
    })

    // Nav book buttons
    this.navBookBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isAnimating) return
        const bookId = btn.dataset.book
        this.selectBook(bookId)
      })
    })

    // Return to shelf button
    if (this.shelfBtn) {
      this.shelfBtn.addEventListener('click', () => {
        if (this.isAnimating) return
        this.returnToShelf()
      })
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.selectedBook) {
        this.returnToShelf()
      }
    })
  }

  selectBook(bookId) {
    if (this.selectedBook === bookId) return

    this.isAnimating = true
    this.selectedBook = bookId

    // Update nav active state
    this.navBookBtns.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.book === bookId)
    })

    // Animate book selection
    const book = document.querySelector(`.book[data-book="${bookId}"]`)
    if (book) {
      book.classList.add('is-selected')
    }

    // Hide bookshelf, show nav
    setTimeout(() => {
      this.scene.classList.add('is-hidden')
      this.collapsedNav.classList.add('is-visible')

      // Remove selection class after animation
      if (book) {
        book.classList.remove('is-selected')
      }

      this.onBookSelect(bookId)
      this.isAnimating = false
    }, 300)
  }

  returnToShelf() {
    this.isAnimating = true
    this.selectedBook = null

    // Update nav
    this.navBookBtns.forEach(btn => {
      btn.classList.remove('is-active')
    })

    // Hide nav
    this.collapsedNav.classList.remove('is-visible')

    // Start closing the book
    this.onReturnToShelf()

    // Show shelf after brief delay
    setTimeout(() => {
      this.scene.classList.remove('is-hidden')
      this.isAnimating = false
    }, 100)
  }

  getCurrentBook() {
    return this.selectedBook
  }
}

window.Bookshelf = Bookshelf
