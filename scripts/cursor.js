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

    // Anchor both elements to the viewport origin so translate3d() maps 1:1 to
    // pointer coordinates (fixed elements with auto insets sit at their static
    // in-flow position, which would otherwise offset the transform).
    this.cursor.style.left = '0'
    this.cursor.style.top = '0'
    this.ring.style.left = '0'
    this.ring.style.top = '0'

    this.mouse = { x: 0, y: 0 }
    this.cursorPos = { x: 0, y: 0 }
    this.ringPos = { x: 0, y: 0 }

    this.lerp = {
      cursor: 0.85,
      ring: 0.15
    }

    // Honor OS-level reduced-motion: skip the smoothed lag and snap to the pointer
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)')
    this.reduceMotion = this.reduce.matches
    this.reduce.addEventListener('change', (e) => {
      this.reduceMotion = e.matches
    })

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
    if (this.reduceMotion) {
      // Reduced motion: snap directly to the pointer, no trailing lag
      this.cursorPos.x = this.mouse.x
      this.cursorPos.y = this.mouse.y
      this.ringPos.x = this.mouse.x
      this.ringPos.y = this.mouse.y
    } else {
      this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * this.lerp.cursor
      this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * this.lerp.cursor

      this.ringPos.x += (this.mouse.x - this.ringPos.x) * this.lerp.ring
      this.ringPos.y += (this.mouse.y - this.ringPos.y) * this.lerp.ring
    }

    // Composite-only positioning via transform. The trailing translate() keeps
    // the CSS centering offset (cursor -10%/-10%, ring -50%/-50%) intact so the
    // nib tip stays under the pointer and the ring stays concentric.
    this.cursor.style.transform = `translate3d(${this.cursorPos.x}px, ${this.cursorPos.y}px, 0) translate(-10%, -10%)`
    this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`

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
