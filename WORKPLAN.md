<!--
  ═══════════════════════════════════════════════════════════
  WORKPLAN.md - Project Design Document
  ═══════════════════════════════════════════════════════════

  WHAT:         Design spec and implementation plan for portfolio
  WHY:          Documents the bookshelf concept, states, and phases
  DEPENDENCIES: None (reference document)
  HOW:          Read for context on design decisions and goals

  ═══════════════════════════════════════════════════════════
-->

# Personal Portfolio Redesign: The Bookshelf

## Status: ✅ IMPLEMENTED

Last updated: February 2026

---

## The Concept

An immersive bookshelf experience - not a styled website, but a **place you explore**.

**Home state:** A wooden bookshelf with your name engraved. Books stand vertically with section titles on spines.

**Interaction:** Click a book → it pulls out and opens. You're now "inside" the book, flipping through pages.

**Navigation:** Bookshelf collapses to a top bar so you can always jump between books.

**Vibe:** Skyrim inventory UI. Tactile, physical, immersive. You're browsing a collection, not scrolling a page.

---

## Current Implementation

### Books on the Shelf

| Book | Color | Content | Pages |
|------|-------|---------|-------|
| **Work** | Crimson red | Project case studies | 5 (TOC + 4 projects) |
| **About** | Navy blue | Personal intro, beyond work, currently, technical | 4 |
| **Contact** | Forest green | Email, LinkedIn, availability | 1 |
| **References** | Warm brown | Testimonials from colleagues | 3 |
| **Mystery** | Purple | Placeholder for future content | — |

### Features Implemented

- ✅ 3D bookshelf with warm wood aesthetic
- ✅ SVG book spines with gold foil lettering
- ✅ Warm overhead lighting (SVG point light filter)
- ✅ Book hover effects (3D tilt, glow)
- ✅ Custom cursor with context-aware states
- ✅ Book open/close transitions
- ✅ Two-page spread layout (left/right pages)
- ✅ Page turn animations (3D lift effect)
- ✅ Clickable page curls for navigation
- ✅ Click outside book to close
- ✅ Collapsed navigation bar when book is open
- ✅ URL routing (#work, #about, #contact, #references)
- ✅ Keyboard navigation (arrow keys for pages)
- ✅ Responsive mobile layout

---

## Content Structure

### Work Book
- **Page 0:** Table of Contents with clickable entries
- **Page 1:** Independent Consulting (Point72, early-stage advisory)
- **Page 2:** Garner Health (GTM strategy, $1B+ growth)
- **Page 3:** NJOY (Corporate development, $2.8B acquisition)
- **Page 4:** L.E.K. Consulting (Strategy consulting foundation)

### About Book
- **Page 1:** Introduction with headshot
- **Page 2:** Beyond Work (personal interests, travel, craft)
- **Page 3:** Currently (studying, advising, building, location)
- **Page 4:** Technical (languages, systems, methods)

### Contact Book
- **Page 1:** Email, LinkedIn, availability status

### References Book
- **Page 1:** Greg Doyle (Former CFO, NJOY)
- **Page 2:** Geremy Bass (Colleague & Friend, Former interim CPO of Zoho)
- **Page 3:** Stephanie Fogle (CHRO, Parsley Health)

---

## Visual Design

### Color Palette
- Background: `#0a1614` (dark forest)
- Wood: Rich dark walnut tones
- Page: `#f5f1e8` (warm cream paper)
- Text: `#2a2520` (warm dark brown)
- Accent: Gold foil (`#daa520`, `#ffd700`)

### Typography
- Display: Cormorant Garamond (serif, elegant)
- Body: Space Grotesk (clean sans-serif)
- Mono: Space Mono (code, labels)

### Book Spine Colors
- Work: Crimson red (`#a52a2a`)
- About: Navy blue (`#2a4d8c`)
- Contact: Forest green (`#3d7a57`)
- References: Warm brown (`#5c3d2a`)
- Mystery: Purple (`#553d62`)

---

## File Structure

```
/personal-site
├── index.html              # Main HTML + book templates
├── styles.css              # All styles (~2800 lines)
├── assets/
│   ├── headshot.jpg        # About page photo
│   ├── book-work.svg       # Crimson spine
│   ├── book-about.svg      # Navy spine
│   ├── book-contact.svg    # Green spine
│   ├── book-references.svg # Brown spine
│   └── book-mystery.svg    # Purple spine
├── scripts/
│   ├── main.js             # Entry point, orchestration
│   ├── bookshelf.js        # Shelf interactions
│   ├── book.js             # Page navigation
│   └── cursor.js           # Custom cursor
├── WORKPLAN.md             # This document
├── CLAUDE.md               # AI assistant guidelines
└── .cursorrules            # Cursor IDE guidelines
```

---

## Future Enhancements

### Content
- [ ] Add project screenshots/mockups to Work book
- [ ] Mystery book content (blog? side projects?)
- [ ] More references as collected

### Polish
- [ ] Page turn sound effects (optional, respect preferences)
- [ ] Subtle wood grain parallax on mouse move
- [ ] Loading state for initial page load
- [ ] Print stylesheet for book pages

### Technical
- [ ] Image optimization (WebP, lazy loading)
- [ ] Service worker for offline support
- [ ] Analytics integration
- [ ] Contact form (currently email link only)

---

## Design Principles

1. **One memorable thing:** The bookshelf IS the concept
2. **Small delights:** 3D tilt, smooth animations, warm lighting
3. **Restraint:** Everything on the shelf has meaning
4. **Warmth:** Dark wood, personal library feel
5. **Accessibility:** Keyboard nav, reduced motion support

---

## Verification Checklist

- [x] Looks like a real bookshelf
- [x] Pulling out a book feels satisfying
- [x] Can always navigate back to shelf
- [x] Content reads well on book pages
- [x] 60fps animations
- [x] Works on mobile
- [x] Keyboard navigation works
