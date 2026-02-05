/**
 * ═══════════════════════════════════════════════════════════
 * main.js - Portfolio Entry Point
 * ═══════════════════════════════════════════════════════════
 *
 * WHAT:         Initializes and coordinates all portfolio modules
 * WHY:          Central orchestrator connecting cursor, bookshelf, book
 * DEPENDENCIES: cursor.js, bookshelf.js, book.js (loaded before this)
 * HOW:          Creates instances, wires callbacks, handles URL routing
 *
 * ═══════════════════════════════════════════════════════════
 */

/* global CustomCursor, Book, Bookshelf */

// Mobile book height — bypasses viewport unit bugs on real iOS Safari
// Computes once from window.innerHeight (always correct) and locks it
function setMobileBookHeight () {
  if (window.innerWidth > 900) return
  var h = Math.min(580, Math.max(400, window.innerHeight * 0.65))
  document.documentElement.style.setProperty('--mobile-book-height', h + 'px')
}
setMobileBookHeight()

class Portfolio {
  constructor() {
    this.cursor = null
    this.bookshelf = null
    this.book = null

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init())
    } else {
      this.init()
    }
  }

  init() {
    this.initCursor()
    this.initBook()
    this.initBookshelf()
    this.handleUrlHash()
  }

  initCursor() {
    if (window.CustomCursor) {
      this.cursor = new CustomCursor()
    }
  }

  initBook() {
    if (window.Book) {
      this.book = new Book()
    }
  }

  initBookshelf() {
    if (window.Bookshelf) {
      this.bookshelf = new Bookshelf({
        onBookSelect: (bookId) => {
          if (this.book) {
            this.book.openBook(bookId)
          }
          // Update URL hash
          history.pushState(null, '', `#${bookId}`)
        },
        onReturnToShelf: () => {
          if (this.book) {
            this.book.closeBook()
          }
          // Clear URL hash
          history.pushState(null, '', window.location.pathname)
        }
      })

      // Connect book close callback to return to shelf
      if (this.book) {
        this.book.setOnCloseBook(() => {
          if (this.bookshelf && this.bookshelf.getCurrentBook()) {
            this.bookshelf.returnToShelf()
          }
        })
      }
    }
  }

  handleUrlHash() {
    const hash = window.location.hash.slice(1)
    if (hash && ['work', 'about', 'contact', 'references'].includes(hash)) {
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        if (this.bookshelf) {
          this.bookshelf.selectBook(hash)
        }
      }, 100)
    }

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      const newHash = window.location.hash.slice(1)
      if (newHash && ['work', 'about', 'contact', 'references'].includes(newHash)) {
        if (this.bookshelf) {
          this.bookshelf.selectBook(newHash)
        }
      } else {
        if (this.bookshelf && this.bookshelf.getCurrentBook()) {
          this.bookshelf.returnToShelf()
        }
      }
    })
  }

  refresh() {
    if (this.cursor) {
      this.cursor.refresh()
    }
  }
}

// Initialize (exposed on window for debugging)
window.portfolio = new Portfolio()
