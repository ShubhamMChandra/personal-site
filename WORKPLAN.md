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

## The Concept

An immersive bookshelf experience - not a styled website, but a **place you explore**.

**Home state:** A wooden bookshelf with your name engraved. Books stand vertically with section titles on spines (Work, About, Contact).

**Interaction:** Click a book → it pulls out and opens. You're now "inside" the book, flipping through pages.

**Navigation:** Bookshelf collapses to a top bar so you can always jump between books.

**Vibe:** Skyrim inventory UI. Tactile, physical, immersive. You're browsing a collection, not scrolling a page.

---

## Core Principles

- **One memorable thing:** The bookshelf IS the concept
- **Small delights:** 3D tilt on spines, magnetic cursor, smooth animations
- **Restraint:** Everything on the shelf has meaning - no decorative clutter
- **Warmth:** Dark wood, personal library feel, not cold gallery

---

## Visual Design

### Color Palette (kept from original)
- Background: `#0a1614` (dark forest)
- Wood: Rich dark walnut tones
- Accent: `#4ecdc4` (aquamarine) - for highlights, active states
- Text: `#e8f4f2` (light)

### Typography
- Book spines: Bold, vertical text
- Page content: Clean serif or sans for readability (textbook feel)
- Engraved name: Slightly embossed/debossed look

---

## States & Transitions

### 1. Home State (Bookshelf)
```
┌──────────────────────────────────────────────┐
│                                              │
│              ~ atmospheric space ~           │
│      (dark gradient, subtle warm glow        │
│       from above, no text - just mood)       │
│                                              │
│    ┌──────┬──────┬──────┬──────┐            │
│    │  W   │  A   │  C   │      │            │
│    │  O   │  B   │  O   │      │  ← spines  │
│    │  R   │  O   │  N   │      │            │
│    │  K   │  U   │  T   │      │            │
│    │      │  T   │  A   │      │            │
│    │      │      │  C   │      │            │
│    │      │      │  T   │      │            │
│    └──────┴──────┴──────┴──────┘            │
│    ════════════════════════════════          │
│       SHUBHAM CHANDRA                        │
│       Developer & Designer                   │
│    ════════════════════════════════          │
│              (engraved into shelf)           │
└──────────────────────────────────────────────┘
```

**Atmosphere above shelf:**
- Dark gradient suggesting depth
- Subtle warm light source from above (soft glow on shelf top)
- No floating text - the shelf IS the interface
- Feels like you're in a cozy, dimly lit library

**Interactions:**
- Hover on spine: 3D tilt toward cursor, subtle glow
- Magnetic cursor: Elements lean slightly toward mouse
- Click: Book pulls out animation → opens

### 2. Transition (Book Opening)
- Selected book slides out from shelf
- Book rotates and opens (like opening a real book)
- Shelf slides up and collapses into top nav bar
- Book pages fill the viewport

### 3. Book Open State

The open book should visually read as an **actual open book** - with a spine divider down the center, page edges visible, maybe subtle page curl shadows.

```
┌──────────────────────────────────────────────────┐
│ [📚 shelf icon] Work | About | Contact           │  ← collapsed nav
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────┬─────────────────────┐   │
│  │                     │                     │   │
│  │                    ┃│┃   Project Title    │   │
│  │                    ┃│┃   ══════════════   │   │
│  │    [left page      ┃│┃                    │   │
│  │     or prev        ┃│┃   Description...   │   │
│  │     content]       ┃│┃                    │   │
│  │                    ┃│┃   ┌──────────┐     │   │
│  │                    ┃│┃   │screenshot│     │   │
│  │                    ┃│┃   └──────────┘     │   │
│  │                    ┃│┃                    │   │
│  │                    ┃│┃   Tech: React...   │   │
│  │                    ┃│┃                    │   │
│  └─────────────────────┴─────────────────────┘   │
│         spine divider ↑                          │
│                   ‹  Page 1 of 4  ›              │
└──────────────────────────────────────────────────┘
```

**Visual details for "open book" feel:**
- Center spine: Visible binding/divider with slight shadow
- Page edges: Subtle stacked pages visible on outer edges
- Paper texture: Very light texture or off-white tint
- Page curl: Slight shadow near the spine suggesting curvature
- Corner: Maybe a subtle dog-ear or page lift on hover

**Page content style:** Textbook - mixed media
- Headers, body text
- Screenshots, mockups
- Code snippets (if relevant)
- Margin notes / annotations
- Links to live projects

**Navigation within book:**
- Left/right arrows or click edges to turn pages
- Simple slide transition for v1 (fancy page-curl later)
- Page indicator at bottom

### 4. Collapsed Shelf (Top Nav)
- Minimal bar showing book icons or titles
- Click any to close current book, open that one
- Click shelf icon to return to full bookshelf view

---

## Content Structure

### Work Book
- Each project = 1 page
- 3-5 projects (curated, not comprehensive)
- Mixed media per page

### About Book
- Page 1: Who you are, what you do
- Page 2: Experience / background
- Page 3: Currently exploring (the "Currently" widget idea)

### Contact Book
- Single page
- Email, social links
- Maybe a small personal note

---

## Interactions & Polish

### The "One Thing" (Bookshelf + Pull-out)
- Smooth, satisfying book extraction animation
- Physical feeling - like actually pulling a book

### Small Delights
- **3D tilt on spines:** Hover tilts book toward cursor (5-10°)
- **Magnetic cursor:** Interactive elements lean toward mouse (3-5px)
- **Custom cursor:** Changes state on different elements
- **Page turn sound?** (optional, respect preferences)
- **Subtle wood grain animation:** Very slight shift on mouse move

### Accessibility
- Keyboard navigation (arrow keys for pages, tab for books)
- Reduced motion mode (instant transitions, no physics)
- Screen reader friendly (proper headings, aria labels)

---

## Technical Implementation

### File Structure
```
/personal-site
├── index.html              (single page app structure)
├── styles.css              (all styles including animations)
└── scripts/
    ├── main.js             (init, state management, routing)
    ├── bookshelf.js        (shelf rendering, book selection)
    ├── book.js             (page navigation, content rendering)
    └── cursor.js           (custom cursor system)
```

### State Machine
```
SHELF → (click book) → OPENING → BOOK_OPEN
BOOK_OPEN → (click different book) → OPENING → BOOK_OPEN
BOOK_OPEN → (click shelf icon) → CLOSING → SHELF
```

### Key Technical Pieces

1. **Bookshelf rendering**
   - CSS 3D transforms for shelf perspective
   - Individual book elements with tilt on hover
   - Wood texture (CSS gradient or subtle image)

2. **Book open animation**
   - CSS keyframes or JS-driven animation
   - Book slides out → rotates → opens
   - Shelf simultaneously slides up

3. **Page system**
   - Pages as sections/divs, show one at a time
   - Horizontal slide transition between pages
   - Preserve state when switching books

4. **Collapsed nav**
   - Fixed position top bar
   - Smooth transition from full shelf

### Mobile Approach
- Shelf becomes horizontal scroll of spines
- Or: vertical list of book covers
- Tap to open, swipe to turn pages
- Simpler animations for performance

---

## Implementation Phases

### Phase 1: Static Bookshelf
- HTML structure for shelf + books
- CSS for wood texture, book spines
- Basic layout without animations
- **Verify:** Looks like a bookshelf, books are clickable areas

### Phase 2: Book Open State
- Page content structure
- Collapsed nav bar
- Simple show/hide (no animation yet)
- **Verify:** Can click book, see content, navigate pages

### Phase 3: Animations
- Book pull-out animation
- Shelf collapse animation
- Page turn transitions
- **Verify:** Smooth 60fps transitions

### Phase 4: Interactions
- 3D tilt on hover
- Magnetic cursor effect
- Custom cursor states
- **Verify:** Interactions feel satisfying and responsive

### Phase 5: Content & Polish
- Real project content
- About/Contact content
- Typography refinement
- Small detail polish
- **Verify:** Content reads well, feels complete

### Phase 6: Mobile & Accessibility
- Responsive layout
- Touch interactions
- Keyboard navigation
- Reduced motion support
- **Verify:** Works on phone, accessible

---

## Verification Plan

1. **Visual:** Does it look like a bookshelf? Is the wood warm, not cold?
2. **Interaction:** Does pulling out a book feel satisfying?
3. **Navigation:** Can you always get back? Is it clear where you are?
4. **Content:** Do the textbook-style pages read well?
5. **Performance:** 60fps animations, no jank
6. **Mobile:** Does the alternative layout work?
7. **Accessibility:** Keyboard works, reduced motion works

---

## Open Questions (can figure out during build)

- Exact number of projects to include? (3-5 feels right)
- Sound effects: yes or no? (leaning no for v1, can add later)
