# Quick Audit Scripts

Simple Playwright scripts for getting screenshots. **Server must be running on port 3847.**

## Usage

```bash
# Start server first (in another terminal)
npx serve -p 3847

# Then run any audit:
npm run audit:shelf       # Bookshelf homepage
npm run audit:work        # Work book (all pages)
npm run audit:about       # About book (all pages)
npm run audit:contact     # Contact book
npm run audit:references  # References book (all pages)
npm run audit:mobile      # All books at 375px mobile
npm run audit:all         # Quick overview (first page of each)
npm run audit             # Full detailed audit (original)
```

## Output

All screenshots go to `./audit-screenshots/`

| Script | Files Created |
|--------|---------------|
| `audit:shelf` | `shelf.png` |
| `audit:work` | `work-1.png` through `work-5.png` |
| `audit:about` | `about-1.png` through `about-4.png` |
| `audit:contact` | `contact.png` |
| `audit:references` | `references-1.png` through `references-3.png` |
| `audit:mobile` | `mobile-shelf.png`, `mobile-work.png`, etc. |
| `audit:all` | `all-shelf.png`, `all-work.png`, etc. |
