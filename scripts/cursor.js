/**
 * ═══════════════════════════════════════════════════════════
 * cursor.js - Custom Cursor System
 * ═══════════════════════════════════════════════════════════
 *
 * WHAT:         Custom animated cursor with context-aware states
 * WHY:          Adds polish with smooth following and hover effects
 * DEPENDENCIES: None (standalone class, instantiated by main.js)
 * HOW:          Lerp interpolation, RAF loop, data-cursor attributes
 *
 * ═══════════════════════════════════════════════════════════
 */

class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.cursor')
    this.ring = document.querySelector('.cursor-ring')

    if (!this.cursor || !this.ring) return

    // Let CSS media queries handle hiding on touch devices
    // Don't bail out in JS - just let it run

    this.mouse = { x: 0, y: 0 }
    this.cursorPos = { x: 0, y: 0 }
    this.ringPos = { x: 0, y: 0 }

    this.lerp = {
      cursor: 0.85,
      ring: 0.15
    }

    this.state = 'default'
    this.isVisible = false
    this.rafId = null

    this.init()
  }

  init() {
    this.bindEvents()
    this.animate()

    // Make cursor visible after a short delay even without mouse movement
    // This handles cases where page loads with a section already open
    setTimeout(() => {
      if (!this.isVisible) {
        this.isVisible = true
        this.cursor.classList.add('is-visible')
        this.ring.classList.add('is-visible')
        document.body.classList.add('has-custom-cursor')
        // Position at center of screen as fallback
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        this.cursorPos = { ...this.mouse }
        this.ringPos = { ...this.mouse }
      }
    }, 500)
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY

      if (!this.isVisible) {
        this.isVisible = true
        this.cursorPos = { ...this.mouse }
        this.ringPos = { ...this.mouse }
        this.cursor.classList.add('is-visible')
        this.ring.classList.add('is-visible')
        document.body.classList.add('has-custom-cursor')
      }
    })

    document.addEventListener('mouseleave', () => {
      this.cursor.classList.remove('is-visible')
      this.ring.classList.remove('is-visible')
    })

    document.addEventListener('mouseenter', () => {
      if (this.isVisible) {
        this.cursor.classList.add('is-visible')
        this.ring.classList.add('is-visible')
      }
    })

    this.bindInteractiveElements()
  }

  bindInteractiveElements() {
    // Books - special state
    const books = document.querySelectorAll('.book')
    books.forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('book'))
      el.addEventListener('mouseleave', () => this.setState('default'))
    })

    // Generic interactive elements
    const interactiveEls = document.querySelectorAll('a, button, .nav-book-btn, .nav-shelf-btn, .page-nav-btn')
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('hovering'))
      el.addEventListener('mouseleave', () => this.setState('default'))
    })
  }

  setState(state) {
    this.state = state

    this.cursor.classList.remove('is-hovering', 'is-book')
    this.ring.classList.remove('is-hovering', 'is-book')

    switch (state) {
      case 'hovering':
        this.cursor.classList.add('is-hovering')
        this.ring.classList.add('is-hovering')
        break
      case 'book':
        this.cursor.classList.add('is-book')
        this.ring.classList.add('is-book')
        break
    }
  }

  animate() {
    this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * this.lerp.cursor
    this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * this.lerp.cursor

    this.ringPos.x += (this.mouse.x - this.ringPos.x) * this.lerp.ring
    this.ringPos.y += (this.mouse.y - this.ringPos.y) * this.lerp.ring

    this.cursor.style.left = `${this.cursorPos.x}px`
    this.cursor.style.top = `${this.cursorPos.y}px`

    this.ring.style.left = `${this.ringPos.x}px`
    this.ring.style.top = `${this.ringPos.y}px`

    this.rafId = requestAnimationFrame(() => this.animate())
  }

  refresh() {
    this.bindInteractiveElements()
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

window.CustomCursor = CustomCursor
