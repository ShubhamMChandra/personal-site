# Portfolio Bookshelf - Technical Documentation

## Project Overview

A personal portfolio website using a bookshelf metaphor. Books on a shelf represent different sections (Work, About, Contact), and clicking a book opens it to reveal content. The design evokes a cozy study atmosphere with an Edison bulb providing warm ambient lighting.

## File Structure

```
personal-site/
├── index.html              # Main HTML structure
├── styles.css              # All styling (1900+ lines)
├── assets/
│   ├── book-work.svg       # Red/maroon book - Work section
│   ├── book-about.svg      # Blue book - About section
│   ├── book-contact.svg    # Green book - Contact section
│   └── book-mystery.svg    # Purple book - Coming soon placeholder
├── scripts/
│   ├── cursor.js           # Custom golden quill cursor
│   ├── bookshelf.js        # Shelf interactions
│   ├── book.js             # Book open/close logic
│   └── main.js             # App initialization
└── _bmad-output/           # Documentation and BMAD artifacts
```

## Design Concept

### The Bookshelf Metaphor
- **Books as navigation**: Each book spine is a clickable section
- **Physical realism**: Books have slight rotations, weathered textures, gold foil lettering
- **Edison bulb**: Central hanging light creates warm atmosphere and lighting reference point
- **Rich wood shelf**: Mahogany shelf with brass nameplate grounds the scene

### Visual Hierarchy
1. Edison bulb (light source, draws eye)
2. Book spines (primary interaction targets)
3. Shelf surface with nameplate (identity)
4. Atmospheric elements (dust particles, glow)

## SVG Book Assets

Each book is a standalone SVG with baked-in lighting to simulate being lit by the central Edison bulb.

### Lighting Approach
We use `radialGradient` positioned at the corner closest to the light source:

| Book | Position | Light Origin | Gradient Settings |
|------|----------|--------------|-------------------|
| Work | Left | Top-right | `cx="100%" cy="0%"` |
| About | Center-left | Top-center-right | `cx="60%" cy="0%"` |
| Contact | Center-right | Top-center-left | `cx="40%" cy="0%"` |
| Mystery | Right | Top-left | `cx="0%" cy="0%"` |

### SVG Structure (example: book-work.svg)
```svg
<defs>
  <!-- Base spine gradient -->
  <linearGradient id="spine-work">...</linearGradient>

  <!-- Metallic accent (gold) -->
  <linearGradient id="gold">...</linearGradient>

  <!-- Corner-based lighting overlay -->
  <radialGradient id="corner-light-work" cx="100%" cy="0%" r="150%">
    <stop offset="0%" style="stop-color:rgba(255,220,180,0.2)"/>    <!-- Bright -->
    <stop offset="40%" style="stop-color:rgba(255,200,150,0.08)"/>  <!-- Fade -->
    <stop offset="70%" style="stop-color:rgba(0,0,0,0)"/>           <!-- Neutral -->
    <stop offset="100%" style="stop-color:rgba(0,0,0,0.3)"/>        <!-- Shadow -->
  </radialGradient>
</defs>

<!-- Main spine with lighting applied -->
<rect fill="url(#spine-work)"/>
<rect fill="url(#corner-light-work)"/>  <!-- Lighting overlay -->
```

### Book Dimensions
- Work: 65x320px (largest, leftmost)
- About: 58x290px
- Contact: 52x260px
- Mystery: 48x300px (rightmost)

## CSS Architecture

### CSS Custom Properties
```css
:root {
  /* Colors */
  --bg: #0a0908;
  --accent: #c4956a;
  --text: #f5f0e8;

  /* Typography */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Space Grotesk', sans-serif;
  --font-mono: 'Space Mono', monospace;

  /* Animation */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-medium: 0.4s;
}
```

### Key CSS Sections
1. **Custom Cursor** (lines 86-180): Golden quill nib using CSS borders
2. **Bookshelf Scene** (lines 260-486): Main layout, atmosphere, Edison bulb
3. **Books Container** (lines 540-606): Flexbox layout, hover states
4. **Shelf Surface** (lines 1030-1190): Wood textures, nameplate
5. **Book View** (lines 1275-1430): Open book state, page layout
6. **Animations** (lines 940-1025): Entrance, breathing, hover effects

### Edison Bulb Structure
```css
.edison-bulb
├── .bulb-cord      /* Hanging wire */
├── .bulb-socket    /* Metal socket with ridges */
├── .bulb-glass     /* Glass envelope */
│   └── .filament
│       ├── .filament-stem
│       └── .filament-coil  /* Animated glow */
└── .bulb-glow      /* Light emanation */
```

### Book Hover Behavior
```css
.book:hover {
  transform: translateY(-12px) rotate(0deg);
  filter: drop-shadow(4px 12px 20px rgba(0, 0, 0, 0.6));
  z-index: 10;
}
```

## Interactions

### Book Selection Flow
1. User hovers book → lifts slightly, shadow deepens
2. User clicks book → `is-selected` class added
3. Bookshelf scene fades out (`is-hidden` class)
4. Book view fades in (`is-visible` class)
5. Navigation bar appears at top

### Navigation
- **Return to shelf**: Click bookshelf icon in nav
- **Switch books**: Click book name buttons in nav
- **Page turn**: Previous/next arrows, keyboard arrows

### Custom Cursor
- Default: Golden quill nib pointing down-right
- Hover: Brightens with glow effect
- Book hover: Additional glow intensity
- Touch devices: Falls back to system cursor

## Responsive Behavior

### Breakpoints
- `900px`: Book view switches to single-page mobile layout
- `600px`: Scaled-down books, simplified shelf

### Mobile Adaptations
- Books scale to `max-height: 180px`
- Left page hidden, only right page shown
- Page edges and spine hidden
- Shelf front reduced to 60px

## Animation Timing

| Animation | Duration | Easing | Delay |
|-----------|----------|--------|-------|
| Book slide in | 0.8s | ease-out-expo | staggered 0.1-0.5s |
| Book hover | 0.4s | ease-out-back | - |
| Filament flicker | 4s | ease-in-out | infinite |
| Dust float | 20s | ease-in-out | infinite |
| Book breathe | 4s | ease-in-out | 1.5s, infinite |

## Design Decisions

### Why SVG-Baked Lighting?
We tried several CSS approaches for lighting:
1. **CSS filters (brightness)** - Affected entire element uniformly
2. **Inset box-shadows** - Created "behind glass" effect
3. **Overlay gradients** - Felt like light on top, not on the books

**Solution**: Bake lighting directly into SVG using `radialGradient` positioned at corners. This allows each part of the book to have different light levels.

### Why No CSS Gradient Across Books?
Attempted a `.books::after` overlay to darken outer books. Created visible edge artifacts. Removed in favor of per-book SVG lighting only.

### Typography Choices
- **Cormorant Garamond**: Elegant serif for headings, evokes classic books
- **Space Grotesk**: Modern sans for body, readable on screens
- **Space Mono**: Technical feel for labels and metadata

## Future Improvements

### Lighting (Deferred)
- Position-based brightness across books (center brighter, edges darker)
- More realistic light falloff based on physics
- Potentially use SVG filters or canvas for dynamic lighting

### Content
- Replace placeholder project images
- Add actual project links
- Populate social media URLs

### Mystery Book
- Placeholder for future section
- Currently disabled with reduced opacity
- Has unique teal glow on hover

---

*Documentation generated: 2026-02-03*
*Part of BMAD project workflow*
