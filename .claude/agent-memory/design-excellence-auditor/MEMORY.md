# Design Excellence Auditor - System Knowledge

## Design Tokens (`:root` in styles.css)

### Colors
| Token | Value | Role |
|-------|-------|------|
| `--bg` | #0a0908 | Main background (very dark brown-black) |
| `--bg-warm` | #12100c | Warm dark fallback |
| `--accent` | #c4956a | Golden bronze — interactive highlights, focus rings |
| `--accent-dim` | rgba(196,149,106,0.15) | Subtle accent wash |
| `--accent-glow` | rgba(196,149,106,0.3) | Glow effects |
| `--text` | #f5f0e8 | Light cream (shelf text) |
| `--text-secondary` | #c4b8a8 | Muted secondary |
| `--text-tertiary` | #8a7a6a | Very muted |
| `--accent-maroon` | #800000 | Link hover color (UChicago maroon) |
| `--page-bg` | #f8f5ef | Cream page surface |
| `--page-text` | #1a1714 | Dark brown (page reading text) |
| `--page-secondary` | #3d3832 | Secondary page text |
| `--page-tertiary` | #5a554c | Tertiary page text |
| `--page-rule` | rgba(26,23,20,0.12) | Subtle dividers |

Wood palette: `--wood-dark` (#1a0f0a), `--wood-mid` (#2d1810), `--wood-light` (#4a2c1a), `--wood-highlight` (#5c3a24)
Book covers: `--book-work` (#952626), `--book-about` (#2a4d8c), `--book-contact` (#34684a), `--book-references` (#4a3060), `--book-mystery` (#553d62)

### Spacing Scale (8px base grid)
| Token | Value | Pixels |
|-------|-------|--------|
| `--space-xs` | 0.5rem | 8px |
| `--space-sm` | 1rem | 16px |
| `--space-md` | 1.5rem | 24px |
| `--space-lg` | 2.5rem | 40px |
| `--space-xl` | 4rem | 64px |

Custom deviations: page padding 2.125rem (34px), page-content padding 1.25rem (20px)

### Typography Families
- `--font-serif`: Cormorant Garamond, Georgia, serif
- `--font-sans`: Space Grotesk, -apple-system, sans-serif
- `--font-mono`: Space Mono, monospace

### Timing & Easing
| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 0.2s | Hover feedback |
| `--duration-medium` | 0.4s | Book transitions |
| `--duration-slow` | 0.8s | Nav entrance |
| `--duration-book` | 1.2s | Page turns, view toggle |
| `--ease-out-expo` | cubic-bezier(0.16,1,0.3,1) | Snappy responses |
| `--ease-out-back` | cubic-bezier(0.34,1.56,0.64,1) | Bouncy overshoot |
| `--ease-in-out` | cubic-bezier(0.76,0,0.24,1) | Smooth symmetrical |

## Typography Hierarchy

| Role | Font | Size | Weight | Details |
|------|------|------|--------|---------|
| Display headings | serif | 2.2-2.5rem | 400-600 | -0.01 to -0.02em tracking |
| Company names | serif | 1.87rem | 600 | .chapter-company |
| Role tagline | serif | 1.27rem | 500 | 1.35 line-height |
| Body text | serif | ~1rem | — | 1.5-1.7 line-height |
| Contact email | serif | 1.15rem | — | Underlined, prominent |
| Engagement desc | serif | 0.83rem | — | 1.5 line-height |
| Labels/metadata | serif small-caps | 0.6-0.77rem | — | 0.08-0.2em letter-spacing |
| Navigation/UI | mono | 0.7-0.75rem | — | Uppercase, 0.08-0.1em tracking |

## Established Interaction Treatments

- **Book hover**: translateY(-12px) + drop-shadow, ease-out-back bounce
- **Book focus**: 2px solid var(--accent), 4px offset
- **Book active**: translateY(-6px) — compressed bounce
- **Links on pages**: dotted border-bottom → solid + accent-maroon on hover
- **TOC entries**: translateX(2px) + title color → accent-maroon on hover
- **Page curls**: scale(1.1) + directional rotation (-3deg left, +3deg right)
- **Page nav buttons**: color → accent + scale(1.1) on hover
- **Custom cursor**: golden quill SVG, drop-shadow glow on interactive elements
- **Collapsed nav**: translateX(-10px→0) + opacity(0→1), duration-slow

## Layout Constraints
- `.page-content` max-width: 440px (optimal reading width)
- Mobile breakpoint: 900px (single-column layout)
- Page padding: 2.125rem
- Sharp edges throughout — no border-radius (literary aesthetic)
- Two-page spreads collapse to right-page-only on mobile

## Class Pattern Families
- `.book-*` (44+): Shelf interaction, spine images, edge textures
- `.page-*` (30+): Page containers, content, curls, navigation
- `.chapter-*` (8): Company sections with period, role, location, summary
- `.reference-*` (5): Quote blocks with attribution
- `.toc-*` (8): Table of contents with dot leaders
- `.engagement-*` (5): Client/project blocks with metrics
- `.nameplate-*` (5): Brass plate header with screws
- `.contact-*` (3): Email CTA and intro text
- `.about-*` (5): Headshot and chapter sections

## Audit Infrastructure
| Command | Viewport | Captures |
|---------|----------|----------|
| `npm run audit:mobile` | 393x852 (iPhone 16) | Shelf + first page of each book, Chrome + Safari |
| `npm run audit:all` | 1440x900 (desktop) | Shelf + first page of each book |
| `npm run audit:tablet` | 768x1024 (iPad) | Tablet layouts |
| `npm run audit:work` | Desktop | All 5 Work pages |
| `npm run backstop:test` | Multiple | Visual regression vs references |
Output: `./audit-screenshots/`. Passing = no horizontal overflow, all content visible, no layout shifts.

## Email CTA Details
- Located in Contact book template, `.contact-email` class
- Serif 1.15rem, full email address displayed (not a generic "Contact Me")
- Underline (solid border-bottom), hover → accent-maroon
- 40px margin below (--space-lg) for breathing room
