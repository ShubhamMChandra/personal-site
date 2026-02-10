# Bugs & Code Hygiene Issues

## ✅ Fixed Bugs (all resolved)

### 1. References book entrance animation — FIXED
- Was: `nth-child(4)` applied `bookSlideInMystery` (opacity 0.6) to References instead of Mystery
- Fix: Moved mystery animation to `nth-child(5)`, gave `nth-child(4)` normal animation

### 2. `--accent-gold` token undefined — FIXED
- Was: Used in `.reference-quote` but never declared
- Fix: Added `--accent-gold: #d4a855;` to `:root`

### 3. `--font-display` token undefined — FIXED
- Was: `.quote-author` used `var(--font-display)` which didn't exist
- Fix: Replaced with `var(--font-serif)`

## ✅ Fixed Code Hygiene

- Replaced 4 `transition: all` instances with specific properties
- Added focus-visible states to `.toc-entry`, `.social-link`, `.contact-email`
- Removed `!important` on `.role-note` (increased specificity instead)
- Fixed `.references-note` faux italic (mono → serif)
- Unified label sizes to 0.7rem / 0.12em letter-spacing
- Bumped `.metric-label` from 0.55rem to 0.62rem (was below minimum readable)
- Squared off nav buttons (border-radius: 2px)
- Fixed triple-nested padding on `.spread-right` (0.85rem 1.25rem → 0.85rem 0)

## Remaining Anti-Patterns (low priority)

### Hardcoded spacing (should use tokens or rem)
- `.nameplate` padding: 14px 40px
- `.chapter-meta` gap: 4px
- `.chapter-company` margin-bottom: 4px
- `.engagement-label` margin-bottom: 4px
- Multiple 2px/4px values — these are micro-spacing, arguably too small for tokens

### Raw hex colors (justified cases)
- Page gradients: #f8f4ec, #f6f2ea, #f4f0e6, #ebe5da — paper simulation, too many shades for tokens
- Cursor nib: `#d4a855` — matches `--accent-gold` but defined inline in SVG
- Shelf wood gradients — material rendering, justified

### Sharp edge violations (intentional exceptions)
- `.about-headshot` has `border-radius: 0` — FIXED (was 50%)
- `.shelf-top` has `border-radius: 4px 4px 0 0` — justified for shelf shape
- `.open-book` mobile has `border-radius: 4px 8px 8px 4px` — minor, justified for mobile
