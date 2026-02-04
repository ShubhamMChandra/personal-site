# Quick Audit Scripts

Simple Playwright scripts for getting screenshots. **Server must be running on port 3847.**

## Prerequisites

```bash
# Start server first (in another terminal)
npx serve -p 3847
```

---

## Quick Reference: Which Script to Use

| Changed This... | Run This |
|-----------------|----------|
| Bookshelf layout, book spines | `npm run audit:shelf` |
| Work book content/jobs | `npm run audit:work` |
| About book content/bio | `npm run audit:about` |
| Contact page/links | `npm run audit:contact` |
| References/testimonials | `npm run audit:references` |
| Global CSS (fonts, colors) | `npm run audit:all` |
| Mobile layout | `npm run audit:mobile` |
| Tablet layout | `npm run audit:tablet` |
| One book at ALL sizes | `npm run audit:responsive work` |

---

## Desktop Audits (1440px)

### `npm run audit:shelf`
Screenshot the bookshelf homepage. Use after changing shelf layout or book spine designs.

### `npm run audit:work`
All 5 pages of Work book (ToC + 4 jobs). Use after editing work history content.

### `npm run audit:about`
All 4 pages of About book. Use after editing bio, skills, or personal content.

### `npm run audit:contact`
Contact page. Use after editing contact info or social links.

### `npm run audit:references`
All 3 reference pages. Use after editing testimonials.

### `npm run audit:all`
Quick overview - shelf + first page of each book. Use for fast sanity check after global changes.

---

## Responsive Audits

### `npm run audit:mobile`
All books at iPhone size (375x812). Use after CSS changes that might break mobile.

### `npm run audit:tablet`
All books at iPad size (768x1024). Use after changes near the 900px breakpoint.

### `npm run audit:responsive [book]`
One specific book at desktop + tablet + mobile. Examples:
```bash
npm run audit:responsive          # shelf at all sizes
npm run audit:responsive work     # work book at all sizes
npm run audit:responsive about    # about book at all sizes
```

---

## Output

All screenshots go to `./audit-screenshots/`

| Script | Files Created |
|--------|---------------|
| `audit:shelf` | `shelf.png` |
| `audit:work` | `work-1.png` ... `work-5.png` |
| `audit:about` | `about-1.png` ... `about-4.png` |
| `audit:contact` | `contact.png` |
| `audit:references` | `references-1.png` ... `references-3.png` |
| `audit:mobile` | `mobile-shelf.png`, `mobile-work.png`, etc. |
| `audit:tablet` | `tablet-shelf.png`, `tablet-work.png`, etc. |
| `audit:responsive` | `responsive-{book}-desktop.png`, `-tablet.png`, `-mobile.png` |
| `audit:all` | `all-shelf.png`, `all-work.png`, etc. |

---

## Full Audit (Original)

```bash
npm run audit
```
Runs the comprehensive audit with accessibility checks, color analysis, typography analysis, etc. Takes longer but provides detailed analysis.
