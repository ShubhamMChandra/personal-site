/**
 * ============================================================
 * snapshots.cjs - Percy snapshot definitions
 * ============================================================
 *
 * WHAT:         Defines pages and states for Percy visual regression testing
 * WHY:          Captures all key views at multiple widths for diff comparison
 * DEPENDENCIES: Percy CLI, local server running on port 3847
 * HOW:          Run via: npx percy snapshot snapshots.cjs
 *
 * NOTE: The widths are configured in .percy.yml (320, 393, 440, 900, 901, 1200)
 *       so they do not need to be repeated here.
 *
 * ============================================================
 */

const BASE_URL = 'http://localhost:3847'

// Time (ms) to wait for page animations to settle after load
const SETTLE_DELAY = 1500

// Time (ms) to wait after opening a book via hash navigation
const BOOK_OPEN_DELAY = 2000

module.exports = [
  // ── Bookshelf (home) view ──────────────────────────────
  {
    name: 'Shelf - Home',
    url: BASE_URL,
    waitForTimeout: SETTLE_DELAY
  },

  // ── Work book ──────────────────────────────────────────
  {
    name: 'Work - Table of Contents',
    url: `${BASE_URL}/#work`,
    waitForTimeout: BOOK_OPEN_DELAY
  },

  // ── About book ─────────────────────────────────────────
  {
    name: 'About - Introduction',
    url: `${BASE_URL}/#about`,
    waitForTimeout: BOOK_OPEN_DELAY
  },

  // ── Contact book ───────────────────────────────────────
  {
    name: 'Contact',
    url: `${BASE_URL}/#contact`,
    waitForTimeout: BOOK_OPEN_DELAY
  },

  // ── References book ────────────────────────────────────
  {
    name: 'References - Greg Doyle',
    url: `${BASE_URL}/#references`,
    waitForTimeout: BOOK_OPEN_DELAY
  }
]
