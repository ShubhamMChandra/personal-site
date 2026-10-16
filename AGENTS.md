## Cursor Cloud specific instructions

### Project overview

Vanilla HTML/CSS/JS personal portfolio site (no build step, no backend). See `README.md` for full details.

### Running locally

Serve static files on port **3847** (all test tooling expects this port):

```
npx serve -p 3847
```

Then open `http://localhost:3847`.

### Lint / Test / Audit

| Task | Command | Notes |
|------|---------|-------|
| Lint (app JS) | `npm run lint` | Pre-existing lint errors exist in `scripts/audit/*.mjs` and `scripts/percy-snapshots.mjs` due to missing Node.js globals in ESLint config; the main app files (`scripts/main.js`, `bookshelf.js`, `book.js`, `cursor.js`) lint clean. |
| Audit screenshots | `npm run audit:shelf`, `npm run audit:all`, etc. | Requires static server on port 3847 and Playwright Chromium (`npx playwright install chromium`). |
| BackstopJS visual regression | `npm run backstop:test` | Requires static server on port 3847. |
| Percy snapshots | `npm run percy:test` | Requires `PERCY_TOKEN` env var for cloud uploads; runs dry-run without it. |

### Gotchas

- There is no build step. Source files are served directly.
- All npm packages are devDependencies only (ESLint, Playwright, BackstopJS, Percy).
- Google Fonts are loaded from CDN at runtime, so internet access is required for proper font rendering.
