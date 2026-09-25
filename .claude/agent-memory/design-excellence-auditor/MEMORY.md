# Design Excellence Auditor - System Knowledge

## Quick Reference
- [Bugs & issues](./bugs-found.md) — Confirmed bugs + anti-pattern violations
- [Improvement ideas](./ideas.md) — Prioritized enhancement brainstorm
- [User design preferences](./user-preferences.md) — Creative direction constraints

## Audit Status (last: 2026-02-05)
- All bugs fixed (3/3), code hygiene done (~10 anti-patterns resolved)
- Focus-visible states added to toc-entry, social-link, contact-email
- Page depth + whitespace fixes applied and committed
- Remaining idea: book-cover opening animation (user interested but deferred)

## Book Order (critical for nth-child CSS)
1=Work(red), 2=About(blue), 3=Contact(green), 4=References(purple), 5=Mystery(grey)

## Design Tokens (`:root` in styles.css)

### Colors
| Token | Value | Role |
|-------|-------|------|
| `--bg` | #0a0908 | Main background (very dark brown-black) |
| `--accent` | #c4956a | Golden bronze — interactive highlights, focus rings |
| `--accent-dim` | rgba(196,149,106,0.15) | Subtle accent wash |
| `--accent-glow` | rgba(196,149,106,0.3) | Glow effects |
| `--accent-maroon` | #800000 | Link hover color (UChicago maroon) |
| `--accent-gold` | #d4a855 | Quote marks, reference borders (added) |
| `--page-bg` | #f8f5ef | Cream page surface |
| `--page-text` | #1a1714 | Dark brown (page reading text) |
| `--page-secondary` | #3d3832 | Secondary page text |
| `--page-tertiary` | #5a554c | Tertiary page text |
| `--page-rule` | rgba(26,23,20,0.12) | Subtle dividers |

Book covers: `--book-work` (#952626), `--book-about` (#2a4d8c), `--book-contact` (#34684a), `--book-references` (#4a3060), `--book-mystery` (#553d62)

### Spacing Scale (8px base grid)
`--space-xs` 0.5rem (8px) · `--space-sm` 1rem (16px) · `--space-md` 1.5rem (24px) · `--space-lg` 2.5rem (40px) · `--space-xl` 4rem (64px)

### Typography Families
- `--font-serif`: Cormorant Garamond, Georgia, serif
- `--font-sans`: Space Grotesk, -apple-system, sans-serif
- `--font-mono`: Space Mono, monospace

### Timing & Easing
`--duration-fast` 0.2s · `--duration-medium` 0.4s · `--duration-slow` 0.8s · `--duration-book` 1.2s
`--ease-out-expo` (snappy) · `--ease-out-back` (bouncy) · `--ease-in-out` (smooth)

## Page Layout Math (critical for whitespace)
- Page width ~580px → padding 34px → page-content 440px (centered) → padding 20px → **400px text**
- `.spread-right` has `padding: 0.85rem 0` (NO horizontal, just vertical)
- Reference pages keep their own padding: `var(--space-md)` horizontal (user preference)
- Body text at 1.05rem gives ~55-65 chars/line at 400px (ideal)

## Page Depth Cues (current values)
- **Spine shadows**: `rgba(0,0,0,0.22)` broad + `rgba(0,0,0,0.12)` tight crease
- **Page rotation**: `rotateY(±5deg)` at perspective 1200px (reduced from 1800px for stronger V)
- **Light falloff**: Gradient from #f8f4ec → #ebe5da toward spine (per page)
- Mobile: all disabled (transform: none, single page)

## Established Interaction Treatments
- **Book hover**: translateY(-12px) + drop-shadow, ease-out-back bounce
- **Book focus**: 2px solid var(--accent), 4px offset
- **Links on pages**: dotted border-bottom → solid + accent-maroon on hover
- **TOC entries**: translateX(2px) + title color → accent-maroon on hover
- **Page curls**: scale(1.1) + directional rotation (-3deg left, +3deg right)
- **Nav buttons**: squared off (border-radius: 2px), consistent focus rings

## Layout Constraints
- `.page-content` max-width: 440px (optimal reading width)
- Mobile breakpoint: 900px (single-column layout)
- Page padding: 2.125rem, Sharp edges throughout (no border-radius)
- Labels unified at 0.7rem / 0.12em letter-spacing
- Metric-label: 0.62rem (bumped from 0.55rem minimum)
- Headshot: rectangular 110x132px, desaturated, thin outline

## Audit Infrastructure
| `npm run audit:mobile` | 393x852 (iPhone 16) Chrome + Safari |
| `npm run audit:all` | 1440x900 desktop |
| `npm run audit:tablet` | 768x1024 iPad |
| `npm run audit:work` | Desktop, all 5 Work pages |
Output: `./audit-screenshots/`

## Commits Made This Session
1. `fix(style): resolve 3 bugs, unify typography, harden accessibility`
2. `style(book): reshape headshot from circle to rectangular book portrait`
3. `style(book): fix excessive margin whitespace on Work pages`
4. `style(book): add physical depth to pages and fix reference margins`
5. `style(book): increase page depth intensity and revert reference margins`
