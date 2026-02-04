<!--
  ═══════════════════════════════════════════════════════════
  README.md - Project Overview
  ═══════════════════════════════════════════════════════════

  WHAT:         Public-facing documentation for the portfolio
  WHY:          Explains the project to visitors and contributors
  DEPENDENCIES: None
  HOW:          Read for setup, structure, and contribution info

  ═══════════════════════════════════════════════════════════
-->

# The Bookshelf

A personal portfolio built as an immersive bookshelf experience.

**Live:** [shubhamchandra.com](https://shubhamchandra.com)

---

## Concept

Not a styled website—a **place you explore**.

Click a book. It pulls out and opens. You're inside, flipping through pages. The bookshelf collapses to a nav bar. Click outside the book to put it back. Repeat.

Inspired by Skyrim's inventory UI. Tactile, warm, physical.

---

## Tech Stack

- **HTML/CSS/JS** — No frameworks, no build step
- **CSS Custom Properties** — Theming and consistency
- **CSS 3D Transforms** — Book animations, shelf perspective
- **SVG** — Book spine graphics with gradients and lighting
- **Google Fonts** — Cormorant Garamond, Space Grotesk, Space Mono

---

## Structure

```
├── index.html          # Single-page app + book templates
├── styles.css          # All styles (~2800 lines)
├── scripts/
│   ├── main.js         # Entry point
│   ├── bookshelf.js    # Shelf interactions
│   ├── book.js         # Page navigation
│   └── cursor.js       # Custom cursor
├── assets/
│   ├── headshot.jpg
│   └── book-*.svg      # Spine graphics
└── WORKPLAN.md         # Design documentation
```

---

## Running Locally

No build step required. Just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

---

## Deployment

Hosted on **Vercel**. No build step—just static files.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys on push.

---

## Books

| Book | Content |
|------|---------|
| **Work** | Project case studies |
| **About** | Personal intro, interests, skills |
| **Contact** | Email and LinkedIn |
| **References** | Testimonials |
| **Mystery** | Coming soon |

---

## Features

- 3D bookshelf with warm wood aesthetic
- Book hover effects (tilt, glow)
- Custom animated cursor
- Page turn animations
- Clickable page curls
- Click outside to close
- URL routing (`#work`, `#about`, etc.)
- Keyboard navigation (arrow keys)
- Responsive mobile layout

---

## Author

**Shubham Chandra**
Strategy consulting → Startup operations → Software engineering

[LinkedIn](https://linkedin.com/in/shubhamchandra/) · [Email](mailto:shubham.m.chandra@gmail.com)
