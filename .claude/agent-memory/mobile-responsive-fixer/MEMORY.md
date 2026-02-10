# Mobile Responsive Fixer - Agent Memory

## Project Structure
- Single CSS file `styles.css` (~3612 lines), no preprocessor
- Mobile breakpoint: `@media (max-width: 900px)` at line ~3319
- Additional breakpoint: `@media (max-width: 600px)` at line ~3452
- iPhone SE breakpoint: `@media (max-width: 375px)` at line ~3565
- Reduced motion: `@media (prefers-reduced-motion)` at line ~3583
- Custom cursor hidden via `@media (hover: none) and (pointer: coarse)` at line ~227

## Key Architecture Decisions
- Mobile shows single page (right page only), desktop shows two-page spread
- `book.js` checks `window.innerWidth <= 900` to decide layout mode
- `main.js` sets `--mobile-book-height` CSS variable from JS for iOS Safari viewport fix
- Book height on mobile: `clamp(400px, 65svh, 580px)` with JS override
- Page navigation is fixed at bottom on mobile, inline on desktop

## Known Undefined CSS Custom Properties (as of 2026-02-05)
- `--accent-gold` used in references quote styling (lines 3108, 3125, 3132) but never defined
- `--page-edge` used in `.about-headshot` border (line 2651) but never defined
- `--font-display` used in `.quote-author` (line 3144) but never defined
- These silently fail (no visible breakage, but borders/colors will be transparent/default)

## Touch Target Issues Found
- `.nav-shelf-btn`: 87x36px (height below 44px minimum)
- `.social-link`: ~59x23px (height below 44px minimum)
- Page nav buttons and page curls are properly sized (44px+)

## Viewport Unit Strategy
- Uses `svh` (smallest viewport height) as primary CSS unit
- JS fallback via `--mobile-book-height` custom property computed from `window.innerHeight`
- Previous `dvh` units were replaced with `clamp()` per commit history

## iOS Safari Considerations Already Handled
- `viewport-fit=cover` in meta tag
- `env(safe-area-inset-*)` for notched devices in mobile book-view and page-nav
- `-webkit-overflow-scrolling: touch` on `.page-right` mobile
- `touch-action: manipulation` on buttons
- `-webkit-tap-highlight-color: transparent` on book buttons
- `min-height: 0` Safari flexbox fix applied in multiple places

## Critical Overflow Chain Bug (Fixed 2026-02-05)
The #1 mobile issue was text being clipped/cut off inside book pages. Root cause:
- `.spread-right` had `overflow: hidden` + `height: 100%` as GLOBAL (desktop) rules
- On mobile, `.page-right` set `overflow-y: auto` to enable scrolling
- BUT `.spread-right` INSIDE `.page-right` clipped content before it could overflow
- Fix: In mobile media query, set `.spread-right` to `height: auto; overflow: visible`
- Also set `.page-content` to `flex: none; overflow: visible` on mobile
- This lets content grow naturally so `.page-right`'s scroll container activates
- Key lesson: overflow cascades -- a parent with `overflow-y:auto` is useless if a child clips

## Horizontal Scroll Prevention
- `html` and `body` both have `overflow-x: hidden` but iOS Safari rubber-banding can still expose it
- Added `overflow-x: hidden` + `max-width: 100%` to `.bookshelf-scene`, `.book-view`, `.book-container` in mobile MQ
- The 900px `.bulb-glow` and 800px `.light-overlay` are centered via transform but extend past viewport on mobile -- contained by parent `overflow: hidden`

## Previous Fix History (from git log)
- `738c9a4` - Increased References page text size by 17%
- `2de3de3` - Fixed page box resizing and halo line on real iOS Safari
- `be24683` - Used svh instead of vh for Safari toolbar resize
- `ba3eadb` - Replaced dvh units with clamp() for consistent iOS Safari sizing
