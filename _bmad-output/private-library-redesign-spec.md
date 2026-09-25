# The Bookshelf Portfolio — Design & Implementation Spec (v3, "the private library")

Design lead synthesis of: shelf recon, book-view recon, technique brief, four critiques (motion director, art director, typographer, skeptic), and the two v2 adversarial reviews (creative director; engineering). Implementers build from this document only. Line numbers cite the pre-change working tree at `def4f23` (`styles.css` 3693 lines, `index.html` 764, `scripts/book.js` 539, `scripts/bookshelf.js` 129, `scripts/main.js` 107) and are orientation only: locate by selector, because WP1 shifts every later line.

Repo: `/Users/shubhamchandra/code/personal-site`. Server: `http://127.0.0.1:3847/`. Capture harness: `<scratchpad>/capture.mjs`, `<scratchpad>/capture-slow.mjs`, review probe `<scratchpad>/probe-review.mjs`, where `<scratchpad>` = `<session scratchpad>`.

Changes from v2 are summarised in §7 (Review dispositions). The short version: the composition is now a page with a shelf on it (shelf left, text right, at ≥ 1100 px), not a totem pole; the picture light, sheen, cover title, hint, pinstripes, pulsing dot, shelf recede and rest tilt are gone; the facts line is body-size; the leaf chain no longer overshoots; the open timeline no longer double-exposes; routing, ownership and interruption bugs from the engineering review are fixed.

---

## 0. North star

A skimming executive lands in a quiet private library: a page with one lit shelf on it, five real volumes lettered along their spines, and beside them the owner's name, role, three facts and the fast-path links, all readable within 300 ms, nothing breathing or glowing. Taking a book down is one continuous physical gesture (spine turns to cover, cover hinges open onto the page) that ends on a pixel-identical real spread, and every page after that turns as bending paper, not a card. Everything animates only `transform` and `opacity`, is interruptible by any input, and has a first-class reduced-motion path that never cuts or double-exposes.

**The signature moment:** click a spine → the room dims, that spine lifts from the shelf, turns to show its board as it grows to page size, and the board hinges open to reveal the first spread — 900 ms, one object, no cross-dissolve, the right page already readable at ~450 ms. Every open after the first in a session runs at 650 ms.

---

## 1. Guardrails and budgets (measurable; every WP is checked against these)

**Time to first fact**
- G1. Name, role, facts line, availability and the CV · LinkedIn · Email row are at computed opacity ≥ 0.9 within 300 ms of `DOMContentLoaded` (desktop and mobile) and at 0 ms under `prefers-reduced-motion: reduce`. No text element ever starts at opacity 0. The entrance is CSS-only (no JS-added class), so first paint is never bright-then-dark.
- G2. Three hard facts (the figures already in the `<meta name="description">`, `index.html:19`) are readable on the shelf without opening anything, at body size (≥ 15 px, `--text-secondary`), never as fine print.
- G3. A deep link (`/#work` etc.) paints the open book on the first JS-rendered frame (no shelf frame, no double exposure) and sets `document.title` to `"<Book> · Shubham Chandra"`.

**Motion budgets**
- G4. Shelf → open book: ≤ 900 ms on the first open, ≤ 650 ms on later opens in the session, right-page text readable ≤ 500 ms after click; ≤ 450 ms on mobile. Close ≤ 560 ms (first) / ≤ 440 ms (later) desktop, ≤ 400 ms mobile. Page turn ≤ 560 ms desktop (≤ 420 ms for subsequent turns in one chase), ≤ 320 ms mobile. *Amended by Decision III (review page): at the recommended 600 ms the budget is ≤ 600 ms, and ≤ 450 ms for subsequent turns in one chase (the chase is always 0.75 × the single turn).*
- G5. Overlap, never sequence: the cover hinge starts at ≥ 65 % of the travel; chrome (Shelf link, page nav) appears only after the object has landed.
- G6. Skip-on-input: any click/tap/wheel/pointer, or any key other than `Tab`, `Shift`, `Alt`, `Ctrl`, `Meta`, during open, close or turn calls `finish()` on every in-flight animation and commits the end state within one frame. A pointer skip never doubles as a close (the same gesture's `click` is swallowed once). The existing intent queue (`book.js:332–355`) stays.
- G7. Idle shelf: **zero** continuously running animations under every setting. Nothing loops. Hover is the only motion at rest.

**Paint / frame**
- G8. Only `transform` and `opacity` appear in any keyframe or transition. `filter` never animates. `translateZ` is never animated; exactly two static, non-animated `translateZ(0.5px)` are allowed (the `.turn-leaf` root and `.proxy-cover-back`) to keep coplanar faces off the page plane. `clip-path` is only ever set statically (the staging clip, on a non-3D element).
- G9. Zero `mix-blend-mode` anywhere. Zero live `<filter>` (SVG `feTurbulence` or CSS `filter`/`backdrop-filter`) on the shelf or in the book view at rest; grain is a pre-rendered PNG tile. `will-change` is set by JS at sequence start and cleared at handoff; none at rest.
- G10. ≤ 12 promoted compositor layers on the idle shelf (CDP `LayerTree`, Chromium-only metric). Headless proxy metric: mean rAF delta on the idle shelf ≤ 17 ms and p95 ≤ 25 ms (baseline measured at `def4f23`: 18.3 ms mean / 33.9 ms max, headless Chromium 1440 × 900 after 2.5 s). In real Chrome at 4× CPU throttle (Moto G Power profile): p95 long-animation-frame duration ≤ 33 ms during open/close/turn.
- G11. No `opacity`, `filter`, `overflow`, `mask` or `clip-path` on any element that carries `transform-style: preserve-3d` (it flattens the 3D). `perspective` lives on the parent of the rotating element, never on it.

**Type, contrast, targets**
- G12. All text ≥ 4.5:1; text under 14 px ≥ 5:1. Nothing under **13 px** on desktop or mobile, and never three consecutive lines at 13 px. The utility row ≥ 14.5 px. No interactive element below opacity 0.85 at rest.
- G13. Targets: mobile ≥ 44 × 44 px for utility links, spines (or ≥ 8 px gap between spines), page nav, Shelf link; desktop ≥ 24 × 24.
- G14. Never gate a fact: every string in the templates remains rendered on desktop and mobile. Overflow policy: a page that cannot fit at 1280 × 720 scrolls; it never clips.

**Accessibility**
- G15. `.book-view` is `role="dialog" aria-modal="true" aria-labelledby="book-view-title"`. On open: `.bookshelf-scene` gets `inert`; focus moves to `#book-view-title` (`tabindex="-1"`). On close: `inert` removed; focus returns to the originating `.book` button. `.page-indicator` has `aria-live="polite"`; `.page-nav` has `aria-label="Pages"`. Spines are real `<button>`s (implicit role, never overridden) inside `<ul role="list">`. ←/→ turn pages, Esc closes.
- G16. Reduced motion is a different animation, never a faster copy: open/close = 200–420 ms opacity steps through a shared colour (dark → dark, then cream over dark); page turn = content-only crossfade; no 3D anywhere; no loops.

**Transfer / CWV**
- G17. CLS ≤ 0.02 (fixed spine slots via `aspect-ratio`; `size-adjust` fallback fonts). LCP element = the name text block or a spine, never gated by an entrance. CSS ≤ 60 KB, JS ≤ 35 KB, page ≤ 250 KB excl. the CV PDF. No library.

---

## 2. Design decisions (chose X over Y because Z)

Register / scene
1. **Composition: shelf beside the text at ≥ 1100 px** (creative director) over the centred stack: eight items on one axis fight a 16:9 viewport and make the name the sixth thing the eye lands on. A two-column page (shelf left, left-aligned text right, vertically centred to the board) reads as a page with a shelf on it. Below 1100 px the stack is kept because there is no width to spare.
2. **A top light with no fixture** over the brass picture light (v2) and over the Edison bulb (motion director): a picture light mounts to a plate or a case; a brass tube in mid-air reads as a UI divider in bronze. The light is now only its evidence: one warm radial pool at the top of the stage and the spines' head-lighter leather gradient. The 50 px the fixture occupied goes to `--spine-h`.
3. **Name set in type beside the board** (art director, skeptic, creative director) over the brass nameplate: the name is the largest text on the page (36–44 px desktop) instead of an engraving.
4. **Facts line at body size** (creative director) over 13 px small caps (v2): G2 says the facts must be readable without opening anything; fine print gates them by legibility. 15–17 px Alegreya, `--text-secondary`, separators in `--accent`.
5. **Remove floor reflection, dust, `.light-overlay`, bulb, `.book-edge`, hint, hint glow, pulsing dot, pinstripe grain, hard shadow ellipses** (all critiques and the creative director agree): every one is paint cost or a web-app/gift-shop idiom with no truth.
6. **Lengthwise gilt lettering, inline SVG spines** (all agree) over horizontal lettering pieces: References/Colophon do not fit horizontally at a legible size; inline SVG lets the title set in Cormorant Garamond and lets the open proxy clone the real node. The title's gilt gradient runs across the cap height (foil catches light evenly per letter), not along the word.
7. **Pre-rendered PNG grain tiles** over live `feTurbulence` (art director's recipe): G9. Two tiles from one generator: `.06` for wall and leather, `.025` for paper (on cream, `.06` reads as dirt).
8. **Hover = tip forward (`rotateX(-7deg)`, no lift)** over a straight 12 px lift: a tipped book does not rise off the board; and `bookBreathe` is deleted so hover actually renders (it never has: `.books .book { animation: … bookBreathe … infinite }` at `:870–875` overrides `.book:hover { transform }` at `:717`; probe: rest `ty −0.124`, hover `ty −0.163`).
9. **Entrance = light coming up, CSS-only** (a dimming overlay at `.85` in the stylesheet that animates to 0 in 520 ms) over a JS-added class: scripts are end-of-body and un-deferred (`index.html:760–762`), so a JS-added dim can paint bright first, then jump dark, then fade. The text column sits above the overlay so G1 holds.

Type
10. **Alegreya + Alegreya SC for text, Cormorant Garamond ≥ 28 px and for spine caps** (typographer) over "keep Cormorant, size up" and over Space Grotesk chrome (skeptic): measured 0.386 em x-height and synthesised small caps are the root cause; Alegreya has true SC and oldstyle figures from Google Fonts with no build. Faces are tokens, so reverting is one line. The Colophon sentence that names the faces is updated (the one copy change a design change forces).
11. **Page type scale keyed to page height** (`--page-h`) over viewport-width `clamp()`: the book's size is height-bound (76 vh), so width-based clamps overshoot at 1280 × 720. Vertical rhythm `--v1` derives from `--t-md`.
12. **Tschichold-lite asymmetric margins** (typographer) over centred 440 px columns: the spread reads as one folded sheet; the verso stops being an empty card. Work versos drop the chapter head ~⅓ down the page, the classic chapter opening.
13. **No duplicated content on versos** (typographer) over "add metrics to every left page" (skeptic): fixed constraint says copy stays; placement and scale fix the empty-verso read. One exception: the Contents verso becomes a title page (title, then author, then span) built only from strings already on the site.

Object
14. **Boards with a 12 px square, page ratio 0.72, 4 px gutter** (art director) over the current 20 px edge strips and 18 px gutter bar: boards overhang the text block as real boards do; the 0.75 quarto reads squat. No title on the board: fine bindings letter the spine; the board carries only the blind fillet and the volume's tail tool.
15. **Fore-edge stacks that track position** over constant edges: the book visibly gets read. Integer stripes (2 px / 1 px) to avoid moiré at DPR 1.
16. **Shelf link and page nav in the book's own layout column, text-only in small caps** over `position:fixed` boxed chrome: kills the 1280 × 720 overlap deterministically; two bordered buttons under a book on a dark table is the one place the view still looked like a document viewer.
17. **Mobile = full-height sheet, page is the scroll container, swipe turns** (art director + skeptic) over the 65 vh card with an inner scroller: on a phone the page should be the page; the recomputation-on-resize bug disappears with it.

Motion
18. **FLIP 3D proxy (spine → cover → hinge → handoff)** over View Transitions API and over cross-dissolve: VTA cannot hinge a board; the dissolve is the reason the current open reads as a slideshow. The room only darkens; the shelf does not recede (the iOS-sheet idiom) — dark room plus a board coming forward already gives depth, and a static shelf makes the close measurement trivial.
19. **900 ms first open, 650 ms after** over 1250 ms (motion director) and 650 ms flat (skeptic): the skimmer budget (G4) is fixed, so 1250 loses; under ~500 ms a board hinge reads as a flick; a recruiter opening all five saves ~1.2 s with the faster repeats.
20. **Shade by angle, no specular sheen**: leather is matte; a board turning away from the light gets darker, it does not flash. Cover faces carry the same opacity-only `.face-shade` as the leaf strips. Camera at 2600 px on both stages: elevation-drawing calm, not 3D-demo drama.
21. **Nested 8-strip kinematic leaf** (motion director) over clip-path strips (skeptic) and WebGL curl (rejected by everyone): pure transforms, real bow at 90°, no second render pipeline. No overshoot: the bow comes from the stagger alone (boards and sheets settle; overshoot stays on buttons). Live DOM clones in each face (not raster), integer strip offsets, identical text rendering on page and faces.
22. **TOC jump ≥ 2 spreads = one long turn** over a multi-leaf riffle: same craft at a quarter of the code; a skimmer wants the chapter, not the riffle.
23. **Deep link renders open with no animation** over "play the hinge only": a shared link is not a click; the first fact should not wait 500 ms.
24. **Delete the blanket reduced-motion rule; explicit per-animation rules + JS branch** (all agree).

Rejected outright (with reason)
- WebGL/canvas curl — second pipeline, text blur, Chrome-only `html-in-canvas`.
- View Transitions API for the hero — snapshot crossfade, freezes the utility row.
- Drag-to-peel corners, mouse parallax, custom cursor, dust bursts, sound, camera dollies — video-game grammar; per-frame cost.
- "Mystery"/dimmed Colophon, endpaper/title-page beat before content, auto-open, auto-turn, scroll-jacking — gates facts or adds unasked motion.
- Vendored turn.js/StPageFlip — jQuery-era or > 30 KB, fights the WAAPI engine.
- Filler books, globes, candles, wallpaper, picture light, nameplate — five volumes on a lit shelf is the concept.
- Overshoot easing on the book or the leaf — boards and sheets settle; overshoot stays on buttons.
- `download` attribute on the CV links — execs preview, they do not want a file in Downloads.
- A "Pick a volume" hint — the cursor, hover and `aria-label`s already say it; it is the cute line.

---

## 3. Shared foundations (WP1 installs these; every later WP consumes them)

### 3.1 `:root` tokens (replace the block at `styles.css:54–121`; keep every existing token name that is still referenced until its WP deletes the last reference)

```css
:root {
  /* room */
  --bg: #0a0908;  --bg-warm: #12100c;
  --wall: #100d0b; --wall-edge: #070605;
  --accent: #c4956a; --accent-dim: rgba(196,149,106,.15); --accent-glow: rgba(196,149,106,.3);
  --text: #f5f0e8; --text-secondary: #c4b8a8; --text-tertiary: #978673; /* was #8a7a6a (:63); 5.6:1 on --bg */
  /* wood + brass */
  --wood-face: #3a2416; --wood-top: #5a3a22; --wood-edge: #241609;
  --brass-hi: #e6c98c; --brass-mid: #b8935a; --brass-lo: #6f5230;
  /* leathers */
  --book-work: #5a1e22; --book-about: #1f3a44; --book-contact: #21402d;
  --book-references: #3a2447; --book-colophon: #2a2c33;
  --gilt-hi: #f1dc9a; --gilt-mid: #c9a24f; --gilt-lo: #7a5a28; --pewter: #a9aeb6;
  /* paper (unchanged) */
  --page-bg: #f4efe1; --page-text: #26201a; --page-secondary: #3d3832; --page-tertiary: #5a554c;
  --page-rule: rgba(26,23,20,.14);
  --paper-hi: #f4efe1; --paper-mid: #efe8d6; --paper-lo: #e9e0cd; --paper-edge: #ddd2bc;
  --paper-pool: radial-gradient(ellipse 78% 55% at 50% 0%, rgba(255,252,244,.45) 0%, transparent 60%);
  --gutter-width: 4px;                                   /* was 18px (:91) */
  --accent-maroon: #800000; --accent-gold: #d4a855;
  /* type */
  --font-text: 'Alegreya', 'Alegreya Fallback', 'Iowan Old Style', Georgia, serif;
  --font-sc: 'Alegreya SC', 'Alegreya', 'Alegreya Fallback', serif;
  --font-display: 'Cormorant Garamond', 'Cormorant Fallback', 'Alegreya', serif;
  /* legacy aliases, removed by WP6 once no selector uses them */
  --font-serif: var(--font-display); --font-sans: var(--font-text); --font-mono: var(--font-sc);
  /* page type scale, keyed to page height (WP1 sets --page-h on .book-container; WP3 moves it to .open-book-wrap) */
  --page-h: 660px;
  --t-xs:  clamp(13px,  calc(var(--page-h) * 0.0197), 14px);
  --t-sm:  clamp(14.5px, calc(var(--page-h) * 0.0235), 15.5px);
  --t-md:  clamp(16px,  calc(var(--page-h) * 0.0265), 18px);
  --t-lg:  clamp(19px,  calc(var(--page-h) * 0.0333), 22px);
  --t-xl:  clamp(22px,  calc(var(--page-h) * 0.0394), 26px);
  --t-2xl: clamp(30px,  calc(var(--page-h) * 0.0576), 38px);
  --t-3xl: clamp(38px,  calc(var(--page-h) * 0.0788), 52px);
  --t-num: clamp(64px,  calc(var(--page-h) * 0.1576), 104px);
  --v1: calc(var(--t-md) * 1.5); --v-half: calc(var(--v1) / 2); --v2: calc(var(--v1) * 2);
  /* spacing (unchanged) */
  --space-xs: .5rem; --space-sm: 1rem; --space-md: 1.5rem; --space-lg: 2.5rem; --space-xl: 4rem;
  /* motion */
  --ease-object: cubic-bezier(.32,.72,0,1);   /* heavy object coming to rest */
  --ease-hinge:  cubic-bezier(.62,.04,.30,.98); /* board or sheet on a hinge */
  --ease-room:   cubic-bezier(.40,0,.20,1);     /* ambient: overlays, shadows */
  --ease-out-expo: cubic-bezier(.16,1,.3,1);    /* buttons only */
  --dur-hover: 300ms; --dur-hover-out: 240ms;
  --dur-open: 900ms; --dur-open-again: 650ms; --dur-close: 560ms; --dur-close-again: 440ms;
  --dur-open-m: 450ms; --dur-close-m: 380ms;
  --dur-turn: 560ms; --dur-turn-chase: 420ms; --dur-turn-m: 320ms;
  --duration-turn: .56s; --ease-page-turn: var(--ease-hinge); /* read by book.js until WP4 renames */
  --duration-fast: .2s; --duration-medium: .4s; --duration-slow: .8s; --duration-book: 1.2s; /* WP5 deletes */
  /* shelf layout — stacked (< 1100px); WP2 overrides at ≥ 1100px */
  --spine-h: clamp(260px, min(100vh - 280px, 78vw), 470px);
  --group-w: calc(var(--spine-h) * 0.775);           /* sum of the five --vol-w × --vol-h, see WP2 */
  --board-w: calc(var(--group-w) + 2 * clamp(28px, 4vw, 56px));
}
@media (min-width: 1100px) {
  :root { --spine-h: clamp(300px, min(100vh - 240px, 42vw), 520px); }
}
```

Resulting `--spine-h`: 1440 × 900 → 520; 1280 × 720 → 480; 1024 × 640 → 360; 768 × 1024 → 470; 390 × 844 → 304.

### 3.2 Fonts (`index.html:42`, replace the Google Fonts link)

```
https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..600;1,400..600&family=Alegreya+SC:wght@400;500&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap
```
Add fallback faces in `styles.css` directly after `:root`. One `size-adjust` cannot fit both `Iowan Old Style` (mac) and `Georgia` (Windows), so there are two blocks per family; tune each until the name block's height differs < 1 px between fallback and web font on that platform (Playwright: measure `.shelf-name` height with fonts blocked vs loaded; Windows values are tuned by hand and accepted with a small CLS delta):
```css
@font-face { font-family: 'Alegreya Fallback'; src: local('Iowan Old Style'); size-adjust: 103%; ascent-override: 96%; descent-override: 28%; line-gap-override: 0%; }
@font-face { font-family: 'Alegreya Fallback'; src: local('Georgia'); size-adjust: 97%; ascent-override: 94%; descent-override: 26%; line-gap-override: 0%; }
@font-face { font-family: 'Cormorant Fallback'; src: local('Iowan Old Style'); size-adjust: 90%; ascent-override: 92%; descent-override: 26%; line-gap-override: 0%; }
@font-face { font-family: 'Cormorant Fallback'; src: local('Georgia'); size-adjust: 88%; ascent-override: 92%; descent-override: 26%; line-gap-override: 0%; }
```

### 3.3 Assets added
- `assets/grain-128.png` — 128 × 128 monochrome noise, alpha baked, mean alpha 0.06. Used on the wall and, as an SVG `<pattern>`, on leather.
- `assets/grain-paper-128.png` — same generator, mean alpha 0.025. Used on `.page` and the leaf/proxy page clones only.
- Both generated once by `scripts/audit/make-grain.mjs` (Playwright canvas, seeded PRNG, one `--alpha` parameter) and committed.
- Spine SVGs move inline into `index.html` (WP2). `assets/book-*.svg` files are deleted in WP2 (the proxy clones the inline node; nothing else references them).

---

## 4. Work packages

Order: WP1 → WP2 → WP3 → WP4 → WP5 → WP6. Each leaves the site fully working and is one branch/PR (`feat/claude/wp1-typography` …). File ownership is exclusive per WP except where marked "shared, append-only". Ownership boundaries were re-cut after the engineering review so no WP deletes a selector another WP's JS still needs.

### WP1 — Typography system and spread layouts

**Goal.** Replace the four-face, 9.9–13 px system with Alegreya/Alegreya SC/Cormorant on a height-keyed modular scale; give the spread book geometry (asymmetric margins, chapter drop on Work versos, running heads verso/recto, folios bottom-outer); make the Contents verso a title page and fix TOC numbering; update the Colophon sentence that names the faces.

**Owns.** `styles.css`: `:root` (§3.1), new `@font-face` block, `body` (`:129+`), every selector from `.page-content` (`:1635`) through `.reference-quote-page` (`:3309`) except the object/engine selectors listed under WP3/WP4 (`.open-book`, `.page` backgrounds, `.page-left/right` backgrounds, `.page-edge*`, `.book-spine-center`, `.page-curl*`, `.page-shadow*`, `.turn-leaf*`, `.page-nav*`), plus one new shared padding rule (step 3). `index.html`: font link (`:42`), template content edits listed below only, the Colophon sentence at `:702–703`. `scripts/book.js`: `addPageFurniture()` (`:248–280`) only. WP1 does **not** touch `.shelf-*`, `.nameplate-*`, `.interaction-hint`, `.nav-shelf-btn` or `.page-indicator` rules (WP2/WP3 restyle them when they replace those blocks); it only installs the tokens they will read.

**Steps.**
1. Install §3.1 tokens and §3.2 fonts. `body { font-family: var(--font-text); }`. Keep `-webkit-font-smoothing: antialiased` on `body`; add `.page { -webkit-font-smoothing: auto; font-kerning: normal; font-variant-ligatures: common-ligatures; hyphens: auto; text-wrap: pretty; text-rendering: optimizeLegibility; }`. Set `--page-h` on `.book-container` from the existing height formula so the scale is live before WP3: `.book-container { --page-h: calc(100vh - 140px); }` (the current `.open-book` height, `:1381`); WP3 moves it to `.open-book-wrap`.
2. Delete every `font-variant: small-caps` (21 occurrences: first `:1199`, last `:3237`) and every `text-transform: uppercase` on page text; those elements get `font-family: var(--font-sc)`. Grep acceptance: `grep -c "small-caps" styles.css` → 0.
3. Margins. Replace `.page-content { max-width:440px; margin:0 auto; padding:1.25rem }` (`:1635–1646`) and `.page { padding: 2.125rem }` (`:1569`) with a **shared** rule that WP4's faces also match, so a turn never shows a padding jump between WP1 and WP4:
   ```css
   .page, .turn-leaf-face { --m-in: 6.5%; --m-out: 11%; --m-top: 6%; --m-bot: 9.5%; }
   .page-left,  .turn-leaf-face.is-left  { padding: var(--m-top) var(--m-in) var(--m-bot) var(--m-out); }
   .page-right, .turn-leaf-face.is-right { padding: var(--m-top) var(--m-out) var(--m-bot) var(--m-in); }
   .page-content { max-width: 34em; flex: 1; min-height: 0; overflow-y: auto; color: var(--page-text); font-family: var(--font-text); font-size: var(--t-md); line-height: 1.5; }
   ```
   `.turn-leaf-face { padding: 2.125rem }` at `:1904` is deleted here (WP1 owns that one declaration; WP4 replaces the whole leaf block later and keeps the shared selectors). The faces already carry `is-left`/`is-right` (`book.js:409–410` sets `className = 'turn-leaf-face turn-leaf-front is-' + side`), so no JS change is needed. In WP4 the clones inside each strip are real `.page.page-<side>` nodes, so the `.page-left`/`.page-right` half of the selector covers them and the `.turn-leaf-face.is-*` half can be dropped by WP6.
4. Scale mapping (replace the sizes in the listed selectors; delete the dead `.book-page p` rule at `:2791` and the patch at `:2803`, add `.page-content p { font-size: var(--t-md); line-height: 1.5; margin: 0 0 var(--v1); }`):

   | Token | Selectors |
   |---|---|
   | `--t-xs` SC 500, tracking .12em, `--page-secondary` | `.project-label .chapter-period .about-chapter-label .contact-chapter-label .reference-label .toc-label .engagement-label .toc-entry-period .running-header .currently-label .technical-category .capabilities h3 .meta-label .chapter-location` |
   | `--t-sm` | `.page-number .metric-label(SC 400) .engagement-role(SC 400) .role-section-title(SC 400) .exp-period(SC 400) .quote-attribution .quote-role .book-footer p .social-link(SC 500) .contact-label(SC) .engagement-metric` |
   | `--t-md` | `.engagement-desc .role-section-desc .role-details p .project-description .exp-role .exp-company .capabilities li .personal-content p .technical-note .reference-context .chapter-backing .toc-entry-meta .currently-value .technical-skills .references-note .education-note .about-chapter-note .contact-chapter-note` |
   | `--t-lg` | `.role-tagline(i 500) .about-lead(i 500) .chapter-summary(i 400, --page-secondary) .chapter-role(i 500) .metric-value(600, lining tabular) .contact-note(roman 400) .reference-role(i 500) .quote-text (Alegreya i 400, lh 1.45) .book-title-name (SC 400)` |
   | `--t-xl` | `.engagement-title .toc-entry-title .about-chapter-title .contact-chapter-title .contact-email(500) .currently-section h3 .project-title` |
   | `--t-2xl` Cormorant 600 | `.chapter-company .reference-author .about-header h2 .contact-chapter-title (letterhead name)` |
   | `--t-3xl` Cormorant 500 i | `.toc-title .contact-header h2 .book-title-label (title page, roman 500)` |
   | `--t-num` Cormorant 600 i, ink opacity .85 | `.chapter-divider[data-chapter]::before` (was 12rem watermark at .04; make it real ink, `position: static`, `display:block`, `line-height:1`, `margin-bottom: var(--v-half)`) |
5. Rules. Delete `border-bottom` on all label selectors; delete `::after` accent stubs at `.toc-title::after`, `.about-chapter-title::after`, `.contact-chapter-title::after`, `.reference-author::after`; delete `.chapter-meta { border-top }`, `.engagement-metrics { border-top: dashed }`. Keep exactly one hairline per area: `.chapter-meta { border-top: 1px solid var(--page-rule); padding-top: var(--v-half); margin-top: var(--v1) }` as the single verso rule, and `.engagement-block + .engagement-block { border-top: 1px solid var(--page-rule); padding-top: var(--v-half) }` on rectos.
6. Vertical placement. All left-page containers (`.toc-header`, `.chapter-divider`, `.about-chapter`, `.contact-chapter`, `.reference-attribution`) become `display:flex; flex-direction:column; justify-content:flex-start; height:100%` (delete `justify-content:center` at `:2328, 2640, 2706`). **Work versos only** get the chapter drop: `.chapter-divider { padding-top: calc(var(--m-top) + 14%) }` (classic chapter openings sink the head ~⅓). Metric strips (`.role-metrics`, `.engagement-metrics`) get `margin-top: auto` so they sit on the bottom margin. About/Contact/References/Colophon versos stay top-aligned.
7. Contents spread (`index.html:209–246`). Verso `.toc-header` → a title page in the order title, author, imprint: `<div class="spread-left title-page"><p class="book-title-label" data-running-head>Selected Work</p><p class="book-title-name">Shubham Chandra</p><p class="book-title-span">2016–Present</p></div>` with `.title-page { display:flex; flex-direction:column; height:100% } .book-title-span { margin-top:auto; font: 400 var(--t-sm) var(--font-sc); letter-spacing:.14em }` (span string derived from the earliest/latest `.toc-entry-period`, `index.html:219,240`; do not invent). Recto: "Contents" `--t-3xl` top-aligned; each `.toc-entry` is **two lines, nothing stacked under the folio**: line 1 = title (`--t-xl` 600) · leader (`.toc-entry-title::after { content:''; flex:1; border-bottom:1px dotted var(--page-rule); margin:0 .5em; align-self:flex-end; transform:translateY(-.35em) }`) · folio (`--t-lg`, oldstyle); line 2 = `<span class="toc-entry-meta"><em>role</em> · period</span>` (`--t-md` italic role, period roman, one `·` between; the existing `.toc-entry-period` span moves inline). **`.toc-entry-page` text changes 1/2/3/4 → 3/5/7/9** (the verso folio of each target spread; `data-goto-page` unchanged). Delete `.toc-entry-dots` markup and CSS.
8. Reference spreads: quote as extract — `.quote-text { text-indent: -.45em }`, quotation marks in ink; delete `.quote-text::before/::after` font-size rules (`:3169–3181, 3304–3307`). **No** ghost ornament mark (it duplicated the ink marks). Attribution line `--t-sm` SC 400, right-aligned.
9. Running heads and folios (`book.js addPageFurniture()`). Verso running head = the book's title from the template's `data-title` attribute (add `data-title="Selected Work"` etc. to each `<template>`); recto running head = `textContent` of the first `[data-running-head]` element in the spread's left side (add `data-running-head` to `.chapter-company`, `.about-chapter-title`, `.reference-author`, `.contact-chapter-title`, `.book-title-label`). Both `--t-xs` SC, tracking .14em, `--page-secondary`, centred at `top: calc(var(--m-top) / 2)`. Folio: `--t-sm` oldstyle, `position:absolute; bottom: calc(var(--m-bot) / 2 - .5em)`; left folio `left: var(--m-out)`, right folio `right: var(--m-out)`. Delete the `top:`/`right:` folio rules at `:1765–1782`.
10. Figures: `font-variant-numeric: oldstyle-nums` on `.page` (Alegreya default); `lining-nums tabular-nums` on `.metric-value`, `.engagement-metric strong`.
11. Colophon copy (`index.html:702–703`): "The type is set in Cormorant Garamond, with Space Grotesk and Space Mono for labels and figures." → "The type is set in Alegreya, with Cormorant Garamond for titles and the spines." Nothing else in the paragraph changes.
12. Mobile (`@media (max-width:900px)`, page section only): `.page-right, .turn-leaf-face.page-right { padding: 22px 20px 28px }`; fixed sizes `--t-xs:13px; --t-sm:14.5px; --t-md:16.5px; --t-lg:19px; --t-xl:22px; --t-2xl:30px; --t-3xl:38px; --t-num:64px`. `.mobile-left-inline` compact grammar: `.chapter-divider::before` numeral `display:inline-block; font-size:40px; margin-right:.3em; vertical-align:-.05em` before the company; `.chapter-divider { padding-top: 0 }` (no chapter drop on the folded page); `.chapter-meta` items on one line separated by `·`; summary `--t-md` italic. Target: `.mobile-left-inline` height ≤ 240 px on every Work spread at 390 × 844.

**Acceptance (Playwright).**
- `(await document.fonts.load('16px Alegreya')).length > 0`, same for `'16px "Alegreya SC"'` and `'28px "Cormorant Garamond"'` (`fonts.check()` returns true when no face matches, so it is not used).
- At 1440 × 900 on Work spread 1: computed `font-size` of `.engagement-desc` ≥ 16.5 px; `.chapter-company` ≥ 30 px; no element inside `.page` with computed font-size < 13 px.
- `grep -c "small-caps\|Space Mono\|Space Grotesk\|text-transform: uppercase" styles.css` → 0; `grep -c "Space Grotesk\|Space Mono" index.html` → 0.
- For every spread of every book at 1440 × 900: `.page-content.scrollHeight <= clientHeight + 1`. At 1280 × 720: at most one spread per book may scroll, none clips (`overflow-y:auto`, scrollbar reachable). The audit prints which spreads scroll.
- Recto `.running-header` text equals the left page's `[data-running-head]` text on every spread; verso running head equals `data-title`; folios are at `bottom` (rect.bottom within 40 px of page bottom) and outer edges.
- `.toc-entry-page` texts are `3,5,7,9` and equal the `.page-number-left` text after clicking each entry. Each `.toc-entry` has exactly two line boxes (`getClientRects()` of the entry's text spans fall on two distinct `top` values).
- Contents verso: `.book-title-label` rect top < 25 % of page height and precedes `.book-title-name` in DOM order; `.book-title-span` rect bottom > 80 % of page height.
- Work spread 1 verso: `.chapter-divider::before` (the numeral) rect top ≥ 18 % of page height (chapter drop); About spread 1 verso first text rect top < 12 %.
- A page turn between the WP1 and WP4 branches shows no padding jump: `getComputedStyle('.turn-leaf-face.page-right').paddingLeft === getComputedStyle('.page-right').paddingLeft`.
- Contrast: script samples every visible text node in `.page` and computes contrast against the parchment ≥ 4.5 (≥ 5 for < 14 px).

**Risks.** Alegreya changes the site's voice — mitigated by tokens (revert = 3 lines). Content overflow at 1280 × 720 — mitigated by the height-keyed scale and scroll policy; the audit reports the spreads that scroll. The chapter drop costs ~14 % of verso height on Work; metrics still fit because they sit on the foot margin (verify spread 4, the longest).

---

### WP2 — Shelf scene and spines

**Goal.** Rebuild the room as a page with a shelf on it: at ≥ 1100 px a two-column composition (shelf stage left, left-aligned text right), below that a stack; viewport-scaled inline SVG spines lettered lengthwise in gilt; a top light with no fixture; a walnut board; name, role and body-size facts in type; the utility row; tip-forward hover; CSS-only light-up entrance; zero loops.

**Owns.** `index.html`: everything inside `<main class="bookshelf-scene">` (`:58–141`, including the bulb, atmosphere, books, shelf-surface, nameplate, utility, hint) plus a new `<svg class="svg-defs" aria-hidden="true">` at the top of `<body>`. `styles.css`: `.bookshelf-scene` through `.interaction-hint` (`:228–1322`) — replace wholesale **except** that a minimal `.bookshelf-scene.is-hidden { visibility:hidden }` (`:242–245`) is kept until WP5 replaces it with `inert`; the `≤900` mobile block `:3329–3344` (`.bulb-glow contain`, `.bookshelf-scene overflow-x`) and the shelf overrides in the `≤900`/`≤600`/`≤375` blocks (`:3543–3589`, `:3644–3656`) — replace; **not** `:148–222` (`.collapsed-nav`/`.nav-books`/`.nav-book-btn`/`.nav-shelf-btn`, WP3's). `scripts/bookshelf.js`: untouched (the hint and its dismissal are gone; the entrance is CSS-only). `assets/book-*.svg`: delete. New: `assets/grain-128.png`, `assets/grain-paper-128.png`, `scripts/audit/make-grain.mjs`. `bookshelf.js` still adds `.is-selected` to the clicked book (`:46` area) — WP2 deletes the `.book.is-selected` CSS at `:3315`; the class becomes inert until WP5 rewrites `selectBook()`.

**DOM (replace `<main>` contents).**
```html
<main class="bookshelf-scene" id="shelf">
  <div class="scene-dim" aria-hidden="true"></div>
  <div class="shelf-stage">
    <ul class="books" role="list">
      <li><button class="book" type="button" data-book="work" aria-label="Work — selected roles and engagements, 2016 to present" style="--vol-h:1;--vol-w:.19">
        <svg class="spine" viewBox="0 0 190 1000" preserveAspectRatio="xMidYMid meet" style="--title-u:46">…</svg>
        <span class="book-shadow" aria-hidden="true"></span>
      </button></li>
      … about (--vol-h:.93;--vol-w:.18; viewBox 0 0 167 930; --title-u 43), contact (.86/.165; 0 0 142 860; 40), references (.95/.20; 0 0 190 950; 44), colophon (.80/.085; 0 0 68 800; 30)
    </ul>
    <div class="shelf-board" aria-hidden="true"></div>
  </div>
  <div class="shelf-text">
    <h1 class="shelf-name">Shubham Chandra</h1>
    <p class="shelf-title">Operator &amp; Advisor · Chicago</p>
    <p class="shelf-facts">Research for a $55B hedge fund<span class="sep">·</span>A $2.8B exit<span class="sep">·</span>Teams scaled 5x</p>
    <div class="shelf-utility"> …existing availability + links markup, unchanged text/order/hrefs… </div>
  </div>
</main>
```
Fact-line strings are the three fragments of `index.html:19` verbatim; the only edit is an initial capital on each fragment. Nothing else new. `aria-label`s: Work as above; About "About — introduction, background, now"; Contact "Contact — email, CV, LinkedIn"; References "References — three former colleagues"; Colophon "Colophon — how this site is made". Spines are `<button>`s with their implicit role; `li { display:contents }` so `.books` stays the flex container. Group width: Σ(`--vol-w` × `--vol-h`) = .19 + .167 + .142 + .19 + .068 = .757 of `--spine-h`; `--group-w` uses .775 to include the 4 × ~4 px joints.

**Spine SVG recipe** (each inline `<svg class="spine" viewBox="0 0 W H" preserveAspectRatio="xMidYMid meet">`; coordinates in fractions of that volume's own H; shared gradients, patterns and tool symbols live in `.svg-defs`; per-volume gradients inside each svg):

| Layer | Element |
|---|---|
| leather V | `<rect width=W height=H fill="url(#lv-<id>)">` — `<linearGradient id="lv-work" x1=0 y1=0 x2=0 y2=1>`: 0 % lighten(base, 12 %), 55 % base, 100 % darken(base, 18 %) (compute per volume; e.g. Work `#6e2a2e / #5a1e22 / #47161a`). Lighter at the head agrees with the top light. |
| roll H | `<rect … fill="url(#roll)" opacity=".45">` shared: 0 % `rgba(0,0,0,.35)`, 42 % `rgba(255,255,255,.14)`, 100 % `rgba(0,0,0,.45)` |
| grain | `<rect … fill="url(#grain)">` shared `<pattern id="grain" patternUnits="userSpaceOnUse" width="128" height="128"><image href="assets/grain-128.png" width="128" height="128"/></pattern>` |
| joints | two 1-unit lines at x=0.5 and x=W−0.5, `stroke="rgba(255,230,200,.10)"` |
| neighbour shadow | `<rect x=0 width=.05W height=H fill="url(#edge-shade)">` shared: `rgba(0,0,0,.35)` → transparent. **Omitted on Work** (nothing sits to its left). |
| headcap / tailcap | rects y∈[0,.014H] and [.986H,H], fill darken(base,25 %), plus 1-unit highlight line `rgba(255,235,210,.14)` at y=.014H and y=.986H |
| head fillets | two lines at y=.075H, .095H, stroke `url(#gilt-<id>)`, stroke-width 1.2, opacity .8, x from .12W to .88W |
| tail fillets | same at y=.895H, .915H |
| tail tool | `<use href="#tool-<id>" …>` centred (W/2, .85H), sized .018H, fill/stroke `url(#gilt-<id>)`, opacity .6. Symbols in `.svg-defs`: `tool-work` quatrefoil (four circles), `tool-about` lozenge, `tool-contact` horizontal fleuron (existing leaf path), `tool-references` lozenge, `tool-colophon` ring (stroke only). The same symbols are reused on the proxy cover front (WP5). |
| title | `<text class="spine-title" x="W/2" y="0.465H" transform="rotate(90 W/2 0.465H)" text-anchor="middle" dominant-baseline="central" fill="url(#gilt-t-<id>)">WORK</text>` — one `<text>` per title (not per letter); CSS: `.spine-title { font: 600 calc(1px * var(--title-u)) var(--font-display); letter-spacing: .18em }`. Colophon fill `url(#pewter-t-<id>)` (`#6b7078 / #a9aeb6 / #d7dbe0 / #a9aeb6 / #6b7078`, same objectBoundingBox axis). |
| title gilt | `<linearGradient id="gilt-t-<id>" x1="0" y1="0" x2="0" y2="1">` (default `objectBoundingBox`, so it runs **across the glyph height** of the rotated text, even per letter) stops 0 % `--gilt-lo`, 38 % `--gilt-mid`, 50 % `--gilt-hi`, 62 % `--gilt-mid`, 100 % `--gilt-lo` |
| fillet/tool gilt | `<linearGradient id="gilt-<id>" gradientUnits="userSpaceOnUse" x1=0 y1=.13H x2=0 y2=.80H>` stops 0 % `--gilt-lo`, 35 % `--gilt-mid`, 45 % `--gilt-hi`, 55 % `--gilt-mid`, 100 % `--gilt-lo` — for fillets and tools only |

No per-glyph shadow copies, no vignette rect, no `<filter>` anywhere in the document.

**CSS (key values).**
```css
.bookshelf-scene { position:relative; min-height:100vh; min-height:100svh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:34px; padding:24px 16px; overflow:hidden;
  background: radial-gradient(ellipse 90% 70% at 50% 40%, var(--wall) 0%, var(--wall-edge) 100%); }
.bookshelf-scene::after { content:''; position:absolute; inset:0; background:url(assets/grain-128.png); opacity:.5; pointer-events:none; }   /* tile alpha .06 → effective .03 */
.bookshelf-scene.is-hidden { visibility:hidden; }     /* kept from :242–245 until WP5 replaces it with inert */
.scene-dim { position:absolute; inset:0; background:var(--bg); opacity:.85; pointer-events:none; z-index:2;
  animation: sceneLight 520ms var(--ease-room) 80ms forwards; }   /* CSS-only entrance: first paint is dim, light comes up */
@keyframes sceneLight { to { opacity:0 } }
.shelf-stage { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; }
.shelf-stage::before { /* the only evidence of a light source: a top light */ content:''; position:absolute; top:-40px; left:-30%; right:-30%; height:calc(var(--spine-h) + 120px); pointer-events:none;
  background: radial-gradient(ellipse 62% 75% at 50% -8%, rgba(255,196,130,.20) 0%, rgba(255,180,110,.07) 48%, transparent 72%); }
.books { list-style:none; margin:0; padding:0; display:flex; align-items:flex-end; gap:0; position:relative; z-index:2; perspective:1400px; }
.books > li { display:contents; }
.books::after { /* keep existing group contact-shadow ellipse (:564–579); carries the rest-state shadow */ }
.book { appearance:none; background:none; border:0; padding:0; position:relative; cursor:pointer; transform-origin:50% 100%; transform:none;
  transition: transform var(--dur-hover-out) var(--ease-room); }
.book:hover, .book:focus-visible { transform: rotateX(-7deg); transition-duration:var(--dur-hover); transition-timing-function:var(--ease-object); z-index:3; }   /* tip, no lift */
.book:active { transform: rotateX(-2deg); transition-duration:90ms; }
.book:focus-visible { outline:2px solid var(--accent); outline-offset:6px; border-radius:2px; }   /* clears the tail cap */
.spine { display:block; height:calc(var(--spine-h) * var(--vol-h)); aspect-ratio: var(--vol-w); width:auto; box-shadow: 0 10px 18px -6px rgba(0,0,0,.55); }
  /* aspect-ratio = W/H = vol-w, matching viewBox W = vol-w × H. NOT vol-w / vol-h. */
.book-shadow { position:absolute; left:-10%; right:-10%; bottom:-6px; height:18px; opacity:0;
  background: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.6) 0%, rgba(0,0,0,.25) 45%, transparent 72%);
  transition:opacity var(--dur-hover) var(--ease-object); }
.book:hover .book-shadow, .book:focus-visible .book-shadow { opacity:.7; }
.shelf-board { position:relative; width:var(--board-w); height:28px; margin-top:0;
  background: linear-gradient(180deg, var(--wood-top) 0 6px, var(--wood-face) 6px 100%);
  box-shadow: inset 0 1px 0 rgba(255,214,170,.22), 0 10px 24px rgba(0,0,0,.55); border-radius:0 0 2px 2px; }
  /* no ::before grain: wood reads from the two tones, the 1px top highlight and the AO below */
.shelf-board::after { /* under-shelf AO on the wall */ content:''; position:absolute; left:-6%; right:-6%; top:100%; height:46px; background:linear-gradient(180deg, rgba(0,0,0,.55), transparent); }
.shelf-text { position:relative; z-index:3; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; }
.shelf-name { font:500 28px/1.15 var(--font-display); color:#ecdfc8; letter-spacing:.02em; margin:0; }
.shelf-title { font:400 14px/1.3 var(--font-sc); letter-spacing:.18em; color:var(--text-tertiary); margin:0; }
.shelf-facts { font:400 clamp(15px, 1.1vw, 17px)/1.4 var(--font-text); letter-spacing:0; color:var(--text-secondary); margin:0; }
.shelf-facts .sep { color:var(--accent); margin:0 .45em; }
.shelf-utility { display:flex; align-items:center; gap:18px; margin-top:8px; }
.shelf-utility-link, .shelf-availability { font:500 var(--t-sm) var(--font-sc); letter-spacing:.1em; color:var(--text-secondary); min-height:32px; display:inline-flex; align-items:center; padding:0 6px; }
.shelf-utility-link:hover { color:var(--accent); text-decoration:underline; text-underline-offset:.25em; }
.status-dot { animation:none; background:var(--accent); }   /* static: no Slack idiom, zero loops */

/* two-column composition: a page with a shelf on it */
@media (min-width: 1100px) {
  .bookshelf-scene { display:grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); column-gap: clamp(48px, 6vw, 96px); align-items:center; justify-items:center; padding: 24px clamp(32px, 6vw, 120px); }
  .shelf-text { align-items:flex-start; text-align:left; justify-self:start; gap:12px; }
  .shelf-name { font-size: clamp(36px, 3.2vw, 44px); line-height:1.1; }
  .shelf-utility { justify-content:flex-start; margin-top:14px; }
}
@media (prefers-reduced-motion: reduce) { .scene-dim { animation:none; opacity:0 } .book { transition:none } .book:hover, .book:focus-visible { transform:none } }   /* WP6 merges this into the single RM block */
```
Delete: `.atmosphere*`, `.edison-bulb*`, `.bulb-*`, `.filament*`, `@keyframes filamentGlow (:439) / haloBreathe (:472) / dustFloat (:499) / bookSlideIn (:814) / bookSlideInMystery (:825) / bookBreathe (:850) / shelfFadeIn (:888) / hintFadeIn (:1287) / hintGlow (:1297)`, `.floor-reflection`, `.light-overlay`, `.book::before` top-light rules, `.book-edge*`, `.book::after` glow, `.shelf-surface`, `.shelf-top*`, `.shelf-front*`, `.nameplate*`, `.interaction-hint*`, `.book.is-selected` (`:3315`), `.bulb-glow` mobile rule (`:3333–3335`). The `@keyframes pulse` (`:2989`, status dot) is also deleted here since `.status-dot` is WP2's. `@keyframes pageContentFadeIn` (`:1671`) is WP1's dead rule (only fires for legacy single-spread pages via `fillSide`); WP1 deletes it.
Mobile (`≤900`): `.bookshelf-scene { gap:24px; padding:20px 12px; max-width:100%; overflow-x:hidden }`, `.shelf-stage::before { top:-24px }`, `.shelf-board { height:22px; width:min(var(--board-w), 100%) }`, `.shelf-name { font-size:24px }`, `.shelf-title { font-size:13px }`, `.shelf-facts { font-size:15px }`, `.shelf-utility { flex-wrap:wrap; justify-content:center; row-gap:6px }`, `.shelf-utility-link { min-height:44px; padding:0 10px }`, `.books { gap:0 }` — spines at 304 h are 26–58 px wide; add `.book { padding:0 4px }` so each target is ≥ 34 px wide and neighbours have an 8 px gap (G13 allows the gap in place of 44 px width).

**Acceptance.**
- `document.scrollHeight <= innerHeight` at 1440 × 900, 1280 × 720, 1024 × 640, 768 × 1024, 390 × 844.
- At ≥ 1100 px: `.shelf-text` rect left > `.shelf-stage` rect right + 40; `.shelf-name` rect vertical centre within 20 % of `.shelf-board` rect centre; `.shelf-name` computed `text-align === 'left'` and font-size ≥ 36. Below 1100: `.shelf-text` rect top > `.shelf-board` rect bottom.
- At every size: `.shelf-board` rect top ≥ tallest `.spine` rect bottom − 1; `document.querySelector('.picture-light, .interaction-hint, .nameplate') === null`.
- `.spine` of Work: height 520 ± 1 at 1440 × 900; 480 ± 1 at 1280 × 720; 304 ± 1 at 390 × 844. Width = height × .19 ± 1. About: width = (spine-h × .93) × .18 ± 1. Colophon: width = (spine-h × .80) × .085 ± 1. Adjacent `.spine` rects touch (gap ≤ 1 px) on desktop.
- Each `.spine` contains exactly one `<text>` whose `textContent` is the full title (WORK/ABOUT/CONTACT/REFERENCES/COLOPHON); `document.querySelectorAll('filter').length === 0`; `grep -c feTurbulence styles.css` → 0; no `img.book-spine-img`; `document.querySelector('.book').getAttribute('role') === null` and `.tagName === 'BUTTON'`.
- Title gilt: sampled mean luminance of the first and last glyph bounding boxes of REFERENCES (DPR 2 crop) differ < 10 %.
- Hover: after `page.hover('.book[data-book=work]')` and 350 ms, `getComputedStyle(book).transform` is a `matrix3d` with `m22 ≈ cos 7° = .9925 ± .005` and `m24`/`ty` ≈ 0 (tip, no lift); at rest `transform === 'none'`; `book.getAnimations().length === 0` at rest. (Pre-WP2 capture scripts need `{ force:true }` on `hover()`/`click()` because `bookBreathe` makes spines "not stable"; after WP2 the plain calls work — the audit asserts `hover()` without `force` succeeds.)
- Idle loops: 2 s after load, `document.getAnimations().filter(a => a.playState === 'running').length === 0` under every setting.
- Colophon `.book` computed opacity = 1. No element on the shelf has `mix-blend-mode` other than `normal`; `getComputedStyle(el).filter === 'none'` and `backdropFilter === 'none'` for all shelf elements.
- G1: `.shelf-name`, `.shelf-facts`, `.shelf-utility-link` have `getAnimations().length === 0` and computed opacity 1 at the first rAF after `DOMContentLoaded`; `.scene-dim` computed opacity ≤ .85 on the same frame (CSS-only dim, no bright first paint).
- Text sizes: every visible shelf text ≥ 13 px; `.shelf-facts` ≥ 15 px; `.shelf-utility-link` ≥ 14.5 px, rect height ≥ 32 (desktop) / ≥ 44 (mobile). No three vertically adjacent shelf text elements all at 13 px.
- Review artefact (human judgement, not PASS/FAIL): screenshot `after/01-shelf.png` shows lengthwise titles; no "ABOUT:"/"0CONTACT" reads (the tail tool is ≥ .05H clear of the title panel).

**Risks.** Inline SVG text needs the web font; before it loads, Cormorant Fallback renders — acceptable (`display=swap`). `aspect-ratio` on inline `<svg>` with `width:auto` — verify in Safari; fallback: `width: calc(var(--spine-h) * var(--vol-h) * var(--vol-w))`. The two-column grid at 1100–1200 px is tight: `minmax(320px, .85fr)` for text plus the 520 px cap on `--spine-h` (42vw at 1100 = 462) fits with ~60 px to spare; the audit checks 1100 × 700 as a sixth viewport.

---

### WP3 — The open book as an object (desktop) and full-height sheet (mobile)

**Goal.** Boards that overhang the text block, position-tracking fore-edge stacks, a real gutter valley, text-only chrome in the book's layout column, edge hit-areas instead of curl discs, a real light-pool element; mobile full-height sheet with natural scroll.

**Owns.** `index.html:144–205` (`.book-view` markup; move the Shelf button in from `:48–55`). `styles.css`: `.collapsed-nav*`, `.nav-books*`, `.nav-book-btn*`, `.nav-shelf-btn*` (`:148–222`), `.book-view` through `.book-spine-center::before` (`:1328–1833`) except `.page-content` padding/type and the shared padding rule (WP1), `.page-shadow*`/`.turn-leaf*` (WP4); `.page-nav*` (`:1966–2025`); the `≤900` block from `.book-view` through `.page-nav` (`:3345–3539`). `scripts/book.js`: `renderPage()` tail (add `--t`, `--page-w` and `data-spread` writes), `bindEvents()` curl handlers (`:85–110`) → edge zones; `scripts/main.js:16–23` (`setMobileBookHeight` — delete). `scripts/bookshelf.js:18, 90, 112`: `.collapsed-nav` is deleted from the DOM here, so WP3 owns the two-line null guard (`if (this.collapsedNav)`) around `:90` and `:112`; the `.nav-book-btn` queries at `:19/:46/:77/:107` are harmless on an empty NodeList and are removed by WP6.

**DOM (desktop and mobile share it).**
```html
<section class="book-view" role="dialog" aria-modal="true" aria-labelledby="book-view-title" aria-hidden="true">
  <div class="book-light" aria-hidden="true"></div>   <!-- a real element: WAAPI cannot animate ::before -->
  <h2 id="book-view-title" class="visually-hidden" tabindex="-1">Work</h2>
  <div class="book-container">
    <nav class="book-chrome-top"><button class="nav-shelf-btn" type="button">‹ Shelf</button><span class="book-running-mobile" aria-hidden="true"></span></nav>
    <div class="open-book-wrap">
      <div class="open-book-shadow" aria-hidden="true"></div>
      <div class="open-book">
        <div class="page page-left"><div class="page-content" data-page="left"></div></div>
        <div class="book-gutter" aria-hidden="true"></div>
        <div class="page page-right"><div class="page-content" data-page="right"></div></div>
        <div class="page-shadow page-shadow-left" aria-hidden="true"></div>
        <div class="page-shadow page-shadow-right" aria-hidden="true"></div>
        <div class="turn-leaf" hidden aria-hidden="true"></div>   <!-- WP4 fills -->
        <button class="page-edge-hit page-edge-hit-prev" type="button" aria-label="Previous page"><span>‹</span></button>
        <button class="page-edge-hit page-edge-hit-next" type="button" aria-label="Next page"><span>›</span></button>
      </div>
    </div>
    <nav class="page-nav" aria-label="Pages">
      <button class="page-nav-btn page-nav-prev" type="button">‹ Previous</button>
      <span class="page-nav-sep" aria-hidden="true">·</span>
      <span class="page-indicator" aria-live="polite">1 of 5</span>
      <span class="page-nav-sep" aria-hidden="true">·</span>
      <button class="page-nav-btn page-nav-next" type="button">Next ›</button>
    </nav>
  </div>
</section>
```
Delete `.page-edge-left/right`, `.book-spine-center`, `.page-curl` markup and CSS, and the `.collapsed-nav` wrapper (`bookshelf.js` keeps querying `.nav-shelf-btn`, unchanged selector). `.open-book`'s `isolation: isolate` (`:1544`, "contain the 3D leaf's stacking context (Safari)") is dropped deliberately: `.book-view` is `position:fixed; z-index:10`, which already isolates, and `isolation` on the `preserve-3d` element is one more grouping property to keep off it.

**CSS (desktop).**
```css
.book-view { position:fixed; inset:0; z-index:10; background:var(--bg); opacity:0; visibility:hidden; display:flex; align-items:center; justify-content:center; }
.book-view.is-visible { opacity:1; visibility:visible; }          /* WP5 owns the transition; none here */
.book-light { position:absolute; top:0; left:50%; width:140vw; height:60vh; transform:translateX(-50%); pointer-events:none; opacity:1;
  background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,196,130,.14) 0%, transparent 70%); }   /* replaces .book-view::before (:1356–1372); WP5 animates its opacity */
.book-container { display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; max-width:1240px; padding:0 24px; }
.book-chrome-top { width:var(--book-w); display:flex; justify-content:flex-start; }
.nav-shelf-btn { font:500 var(--t-sm) var(--font-sc); letter-spacing:.12em; color:var(--text-secondary); background:none; border:0; padding:8px 10px 8px 0; min-height:36px; cursor:pointer; }
.nav-shelf-btn:hover { color:var(--accent) } .nav-shelf-btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px }
.open-book-wrap { --book-h: min(76vh, 700px); --page-h: calc(var(--book-h) - 24px); /* --page-w is written in integer px by book.js (see below); CSS fallback: */ --page-w: calc(var(--page-h) * .72);
  --book-w: calc(var(--page-w) * 2 + var(--gutter-width) + 24px); position:relative; width:var(--book-w); height:var(--book-h); perspective:2600px; perspective-origin:50% 45%; }
  /* .open-book-wrap carries perspective only (not a grouping property), so WP5 may put opacity and clip-path here */
.open-book-shadow { position:absolute; inset:0; border-radius:3px; box-shadow: 0 40px 80px -20px rgba(0,0,0,.7), 0 8px 20px rgba(0,0,0,.4); pointer-events:none; }
.open-book { position:absolute; inset:0; display:flex; padding:12px; border-radius:3px; background: var(--board-leather); transform-style:preserve-3d; }
.open-book::after { /* blind fillet */ content:''; position:absolute; inset:5px; border:1px solid rgba(0,0,0,.25); border-radius:2px; pointer-events:none; }
.book-view[data-active-book="work"] .open-book, html[data-boot="work"] .open-book { --board-leather: linear-gradient(180deg, #6e2a2e, var(--book-work) 55%, #47161a); }
  /* one pair per book (about/contact/references/colophon), same lighten/darken as WP2; the html[data-boot] form exists because data-active-book is not set until JS runs */
.page { position:relative; width:var(--page-w); height:var(--page-h); display:flex; flex-direction:column; overflow:hidden;
  background: var(--paper-pool), url(assets/grain-paper-128.png), linear-gradient(180deg, var(--paper-hi) 0%, var(--paper-mid) 60%, var(--paper-lo) 100%); }
.page-left  { border-radius:2px 0 0 2px; background-image: linear-gradient(90deg, transparent calc(100% - 64px), rgba(30,20,10,.16)), var(--paper-pool), url(assets/grain-paper-128.png), linear-gradient(…); }
.page-right { border-radius:0 2px 2px 0; background-image: linear-gradient(270deg, transparent calc(100% - 64px), rgba(30,20,10,.16)), …; }
.book-gutter { width:var(--gutter-width); height:var(--page-h); background:linear-gradient(90deg, rgba(30,20,10,.30), rgba(30,20,10,.50) 50%, rgba(30,20,10,.30)); position:relative; }
.book-gutter::after { content:''; position:absolute; left:calc(50% - .5px); top:0; bottom:0; width:1px; background:rgba(255,255,255,.22); }
/* fore-edge and tail stacks; --t = spread/(n-1) written by book.js on .open-book; integer stripes avoid moiré at DPR 1 */
.page-left::before  { content:''; position:absolute; left:0; top:0; bottom:0; width:calc(3px + 12px * var(--t, 0)); background:repeating-linear-gradient(90deg, #efe7d6 0 2px, #d9cdb4 2px 3px); transition:width 400ms var(--ease-room); }
.page-right::before { content:''; position:absolute; right:0; top:0; bottom:0; width:calc(3px + 12px * (1 - var(--t, 0))); background:repeating-linear-gradient(270deg, #efe7d6 0 2px, #d9cdb4 2px 3px); transition:width 400ms var(--ease-room); }
.page::after { content:''; position:absolute; left:0; right:0; bottom:0; height:6px; background:repeating-linear-gradient(180deg, #efe7d6 0 2px, #d9cdb4 2px 3px); border-radius:0 0 2px 2px; }
.page-edge-hit { position:absolute; top:0; bottom:0; width:12%; background:none; border:0; cursor:pointer; color:var(--page-secondary); font:400 var(--t-sm) var(--font-sc); opacity:0; transition:opacity 220ms var(--ease-object); }
.page-edge-hit-prev { left:12px } .page-edge-hit-next { right:12px }
.open-book:hover .page-edge-hit:not(:disabled), .page-edge-hit:focus-visible { opacity:.8 }
.page-edge-hit:disabled, .book-view.is-turning .page-edge-hit { opacity:0; pointer-events:none }   /* hidden under a turning leaf, as :1957 does for curls today */
.page-nav { display:flex; align-items:center; gap:14px; }
.page-nav-btn { border:0; background:none; padding:8px 10px; min-height:36px; font:500 var(--t-sm) var(--font-sc); letter-spacing:.12em; color:var(--text-secondary); cursor:pointer; }
.page-nav-btn:hover { color:var(--accent) } .page-nav-btn:disabled { opacity:.35; cursor:default }
.page-nav-btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px }
.page-nav-sep { color:var(--text-tertiary) }
.page-indicator { font:400 var(--t-sm) var(--font-sc); letter-spacing:.1em; color:var(--text-secondary); font-variant-numeric:oldstyle-nums; }
.visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
```
`book.js`: on open and on `resize` (rAF-throttled), write an **integer** page width so the real page and the WP4 leaf clones wrap identically: `const pw = Math.round(wrap.clientHeight - 24) * 0.72; wrap.style.setProperty('--page-w', Math.round(pw) + 'px')`. `renderPage()` tail: `this.openBook.style.setProperty('--t', (this.pages.length > 1 ? this.currentPage / (this.pages.length - 1) : 0).toFixed(3))`; `#book-view-title.textContent = template.dataset.title`; edge-hit buttons call `prevPage()/nextPage()` and get `disabled` at the ends (replaces `.page-curl` handlers at `:85–110`).

**Mobile (`≤900`).**
```css
.book-view { align-items:stretch; justify-content:stretch; padding:0; }
.book-container { max-width:none; padding:0; gap:0; height:100%; }   /* not 100dvh: inside position:fixed; inset:0 it is redundant and jitters on iOS */
.book-chrome-top { position:static; height:52px; padding:0 12px; padding-top:env(safe-area-inset-top); display:flex; align-items:center; justify-content:space-between; width:auto; }
.book-running-mobile { font:400 13px var(--font-sc); letter-spacing:.14em; color:var(--text-tertiary); }  /* set to the recto running head text by renderPage */
.open-book-wrap { --book-h:auto; flex:1; min-height:0; width:auto; margin:0 16px; perspective:none; }
.open-book-shadow, .book-light { display:none }
.open-book { position:relative; height:100%; padding:0; background:none; border-radius:0; }
.open-book::after { display:none }
.page-left, .book-gutter, .page-edge-hit, .page-shadow, .turn-leaf { display:none }
.page-right { width:100%; height:100%; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; touch-action:pan-y; border-left:6px solid var(--book-work); border-radius:0 3px 3px 0; }
.page-right .page-content { overflow:visible; }   /* .page-right is the single scroller on mobile; WP1's overflow-y:auto on .page-content must not nest a second one */
.page-right::before, .page-right::after { display:none }
.page-nav { height:60px; padding-bottom:env(safe-area-inset-bottom); justify-content:center; background:var(--bg); }
```
Per-book `border-left` colour rules move from `.open-book` (`:3392–3395`) to `.page-right` and gain the missing colophon rule (`.book-view[data-active-book="colophon"] .page-right { border-left-color: var(--book-colophon) }`). Delete `--mobile-book-height`, `main.js:16–23`, the `.page-right::after` scroll-fade (`:3445–3464`), and the two `backdrop-filter: blur(8px)` (`:3487`, `:3535`).

**Acceptance.**
- 1440 × 900: `.open-book` rect = 978 × 684 ± 2; `.page-left` rect inset 12 px from `.open-book` on top/left/bottom; page aspect = .72 ± .01; `.book-gutter` width 4; `getComputedStyle(wrap).getPropertyValue('--page-w')` is an integer px string.
- `document.querySelector('.page-edge, .book-spine-center, .page-curl, .collapsed-nav') === null`; `document.querySelector('.book-light')` exists and is animatable (`el.animate` defined); `.page-nav-btn` computed `border-style === 'none'` and `background-color` transparent.
- `.page-left::before` width: 3 px on spread 0, 15 px on the last spread (`getComputedStyle(pageLeft,'::before').width`).
- 1280 × 720: `.nav-shelf-btn` rect does not intersect `.open-book` rect; `.page-nav` rect bottom ≤ innerHeight − 8.
- Mobile 390 × 844: `.page-right` rect top = 52 (+safe area), bottom = innerHeight − 60; `.page-right.scrollHeight > clientHeight` on Work spread 1 and `scrollTop` changes on wheel (natural scroll); `.page-content.scrollHeight === .page-content.clientHeight` (single scroller); `document.documentElement.scrollWidth === 390`; `.mobile-left-inline` height ≤ 240 px; Colophon `.page-right` `border-left-color` = `--book-colophon`.
- No `mix-blend-mode`, no `filter`, no `backdrop-filter` inside `.book-view` (both computed properties checked); `.open-book` has no `opacity` < 1, `overflow` other than `visible`, `clip-path`, or `isolation` other than `auto` (G11).
- Opening a book on the WP3 branch does not throw (`page.on('pageerror')` count 0) — the `collapsedNav` guard.

**Risks.** Removing `.open-book` box-shadow onto a sibling changes stacking — keep `.open-book-shadow` before `.open-book` in DOM. `100svh` no longer needed on the container; `.book-view` is `inset:0`.

---

### WP4 — Page-turn bend engine (desktop), sheet-off-a-stack (mobile), swipe, long turn

**Goal.** Replace the rigid single-plane leaf with a nested 8-strip chain that bows without overshoot, remove animated `translateZ`, make TOC jumps a single long turn that cannot race the chase, make mobile turns physical and swipeable, route reduced motion to `crossfade()`.

**Owns.** `index.html`: `.turn-leaf` inner markup (`:171–179` → removed; the leaf is built in JS). `styles.css`: `.page-shadow*`, `.turn-leaf*` (`:1835–1961`) — replace (keeping WP1's shared padding selectors `.turn-leaf-face.page-left/right`, now applied to `.strip-content > .page`). `scripts/book.js`: constructor leaf refs (`:16–41`), `closeBook()` leaf reset (`:164–168`), `turnTo()` (`:361–373`), `leafTo()` (`:399–476` → `chainTo()`), `slideTo()` (`:479–504` → `sheetTo()`), `goToPage()` (`:523–528`), `runChase()` (`:344–355`, duration selection and long-jump), new `bindSwipe()`, `this.active`/`finishActive()` (shared with WP5, append-only; WP4 creates them).

**Leaf geometry.** The hinge is the **gutter centre** so the leaf lands pixel-exact on the destination page plus its 2 px of gutter (a hinge at the page's inner edge would land 4 px off and jump when the leaf hides). With `.open-book` padding 12 and gutter `G = 4`:
```
--leaf-w: calc(var(--page-w) + 2px)            /* page + half gutter, integer px because --page-w is */
.turn-leaf          position:absolute; top:12px; height:calc(100% - 24px); width:var(--leaf-w); transform-style:preserve-3d; transform:translateZ(.5px) /* static, keeps it off the page plane */; z-index:6; pointer-events:none
.turn-leaf--next    left:calc(12px + var(--page-w) + 2px)          /* hinge x = gutter centre */
.turn-leaf--prev    left:12px
```
Faces: on `--next` the front shows the right page (clone offset 2 px right of the leaf's left edge; the first 2 px are the gutter gradient) and the back shows the left page (after the 180° mirror, its clone sits at the leaf's left 0…page-w and the last 2 px are gutter); `--prev` is the mirror. `.page-shadow-*` get the same box (`top:12px; height:calc(100% - 24px); width:var(--page-w)`, left 12 or `12 + page-w + 4`).

**Leaf DOM** (built once in the constructor, not in HTML):
```
.turn-leaf
  .strip[data-i=0]              position:absolute; top:0; height:100%; width:var(--sw-i); transform-style:preserve-3d
    .strip-face.strip-front     position:absolute; inset:0; overflow:hidden; backface-visibility:hidden; background:var(--paper-mid)
      .strip-content            position:absolute; top:0; left:var(--front-x); width:var(--leaf-w); height:100%   → contains a `.page.page-<side>` clone (WP1 shared padding) + the 2 px gutter band
      .face-shade               position:absolute; inset:0; background:#1a1410; opacity:0        /* flat: the strip's own angle */
      .face-shade-grad          position:absolute; inset:0; background:linear-gradient(90deg, transparent, #1a1410); opacity:0   /* ramps to the next strip's value: no banding */
    .strip-face.strip-back      same, transform:rotateY(180deg); .strip-content left:var(--back-x)
    .strip[data-i=1] … nested inside strip 0, and so on to data-i=7
```
Direction classes: `.turn-leaf--next .strip { left:0; transform-origin:0 50% } .turn-leaf--next .strip .strip { left:var(--sw) }`; `.turn-leaf--prev .strip { right:0; transform-origin:100% 50% } .turn-leaf--prev .strip .strip { right:var(--sw) } .turn-leaf--prev .face-shade-grad { transform:scaleX(-1) }`. Strip widths: `sw = floor(leaf-w / 8)` for strips 0–6, strip 7 = `leaf-w − 7·sw` (no 1 px overlap: a double-drawn band projected at two angles is a moving hairline; adjacent strips meet exactly at the child's hinge). `--leaf-w`/`--sw` written in px by JS at turn start. Content offsets per strip `i`: next → `--front-x: −i·sw`, `--back-x: −(7−i)·sw`; prev → `--front-x: −(7−i)·sw`, `--back-x: −i·sw`. Faces and `.page` share identical `text-rendering`, `font-kerning`, `font-variant-*` (WP1 sets them on `.page`; the clone *is* a `.page`), never `geometricPrecision` on faces alone. Fill: front = `fillSide(from, isNext ? 'right' : 'left')`, back = `fillSide(to, isNext ? 'left' : 'right')` (existing helper, `:381–395`), copy `scrollTop` of the live `.page-content` into the front clone, then each strip face's `.strip-content` is `cloneNode(true)` of one rendered face (16 clones per turn; the leaf is emptied on hide).

**`chainTo(direction, opts)`** (replaces `leafTo`; `gentle` parameter removed — reduced motion never reaches this function):
1. Pre-fill the static destination half (existing trick, `:414–416`), set `--leaf-w`/`--sw`, direction class; `--t` (WP3) is updated only after landing.
2. `leaf.hidden = false`; `leaf.style.willChange = 'transform'`; `bookView.classList.add('is-turning')`; `void leaf.offsetWidth`.
3. Per strip `i` (0 = gutter … 7 = fore-edge), sign `s = isNext ? -1 : 1`, total `D = opts.chase ? 420 : 560` (G4 values; if Decision III picks 600 ms, `D = opts.chase ? 450 : 600`, i.e. the chase is `0.75·D`), stagger 14 ms, `span = D − 7·14`. *(Corrected 2026-09-24 after the review demo: the earlier text animated each strip's local angle `0 → 22.5°`. With nested strips that leaves strip 0 at 22.5°, strip 1 at 45° … strip 7 at 180° when the animations end: a fanned curl, not a flat page, which `leaf.hidden = true` then snaps flat.)* Drive each strip's **world** angle (its cumulative angle from the flat page) and animate the **local** difference:
   ```js
   const ease = bezier(.45, .05, .25, 1)             // evaluated in JS, not handed to WAAPI
   const K = Math.max(24, Math.ceil(D / 14))           // evenly spaced samples
   // world angle of strip i at time ms: the fore-edge leads by (7 − i)·14 ms
   const theta = (i, ms) => 180 * ease(clamp01((ms - (7 - i) * 14) / span))
   // local angle = the strip's world angle minus its parent's (strip 0's parent is the page)
   const local = (i, ms) => i === 0 ? theta(0, ms) : theta(i, ms) - theta(i - 1, ms)
   strip.animate(
     Array.from({ length: K + 1 }, (_, k) => ({ offset: k / K, transform: `rotateY(${s * local(i, k / K * D)}deg)` })),
     { duration: D, easing: 'linear', fill: 'forwards' })
   ```
   At 100 % every `θ_i = 180°`, so strip 0's local angle is ±180° and every other local angle is 0: the sheet lands flat on the landing page. `θ_i` is monotonic and never exceeds 180°, so there is no overshoot. Mid-flight the fore-edge leads by the stagger alone, which bows the sheet by ≈ 81° tip-to-root (`θ_7 − θ_0`) at 14 ms; 8 ms gives ≈ 50° and 5 ms ≈ 28°. No animated `translateZ` anywhere.
4. Shading (opacity keyframes, all `fill:'forwards'`, same `D`): use the world angles from step 3 directly, at the same K + 1 samples: `φ_i = θ_i`, and `φ_8 = clamp(2·θ_7 − θ_6, 0, 180)` for the last strip's ramp. Front shade value `f(φ) = min(.45, .5·(1−cos φ))`, back shade value `b(φ) = φ < 135 ? .35 : .35·(180−φ)/45`. Per strip: `.face-shade` opacity = `f(φ_i)` (front) / `b(φ_i)` (back); `.face-shade-grad` opacity = `max(0, f(φ_{i+1}) − f(φ_i))` (front) / `max(0, b(φ_{i+1}) − b(φ_i))` (back), so the shade ramps within each strip to the next strip's value and eight flat bands never appear. `.page-shadow-<revealed>`: `[0, .5@.22, 0@.6]` ease-out; `.page-shadow-<landing>`: `[0@.4, .42@.8, 0]` ease-in.
5. `await Promise.all(anims.map(a => a.finished))` inside try/catch; commit `currentPage = to`, `renderPage()`, then `leaf.hidden = true`, empty the leaf, `cancel()` every animation created in this call, clear `willChange`, remove `.is-turning`, update `--t`. A `cancel()` from `closeBook()` rejects `finished`; the catch checks `this.currentBook === bookAtStart && this.pages.length` before calling `instantTurn()` and otherwise returns silently (today `:164` cancels and the catch writes "No content available" into an emptied `pages[]`).
6. Register all animations in `this.active` (WP5 uses `finishActive()`).

**`turnTo(direction)`**: `if (innerWidth <= 900) return sheetTo(direction); if (this.reduceMotion || !this.supportsLeaf) return crossfade(direction); return chainTo(direction, { chase: this.chaseCount > 0 })`. `crossfade()` (`:509–521`) stays as is (120 ms out / 150 ms in, content only).

**`goToPage(k)` and the chase.** `goToPage(k)` never writes `currentPage`; it sets `this.targetPage = k; this.longJump = Math.abs(k − this.currentPage) ≥ 2` and starts `runChase()` if idle. `runChase()`: while `currentPage !== targetPage`: if `longJump` → one `chainTo` whose front shows the current spread's side and back shows spread `targetPage`'s side, committing `currentPage = targetPage` on landing, then `longJump = false`; else a single-step turn. The loop bails when `this.currentBook` changes or `this.pages.length === 0`. `this.chaseDone` is the promise of the running loop. Mobile: same rule with `sheetTo`.

**`closeBook()`**: `finishActive()` (finish, never cancel, so in-flight turns land), `await this.chaseDone`, then reset state as today. The leaf is emptied by the landed `chainTo`, not by `closeBook()`.

**Mobile `sheetTo(direction)`** (replaces `slideTo`): the real `.page-right` **always holds the destination** (so `this.rightPage`, the TOC delegation listener at `:133–143` and `bindSwipe()` never lose their node); the clone is always the outgoing sheet. Next: `.page-under` = `cloneNode(true)` of the current `.page-right` (`position:absolute; inset:0; z-index:2`, `scrollTop` copied), then `renderPage(to)` into the real page (`z-index:1`, `scrollTop = 0`); the clone animates `translateX(0)→translateX(-104%)` with `scale(1)→scale(.985)` over the first 25 %, 320 ms `--ease-object`; `.sheet-shade` (a 24 px dark strip on the clone's right edge, `opacity .35→0`). Prev: the clone shows the current page under (`z-index:1`); the real page renders the destination at `z-index:2`, starts at `translateX(-104%)` and slides to 0 over the clone, shade `0→.35→0`. No frame is blank. After: remove the clone, `renderPage()` furniture. Chase duration 260 ms.

**Swipe** (`bindSwipe()`, mobile only): `pointerdown` on `.page-right` records x/y; on `pointerup` if `|dx| ≥ 40 && |dy| < 0.36·|dx|` → `dx < 0 ? nextPage() : prevPage()`. `touch-action: pan-y` (WP3) keeps vertical scroll native. Keyboard ←/→ stays.

**Acceptance.**
- Slow-motion (`Animation.setPlaybackRate(0.1)`) frame at 50 % of a next-turn: parse `getComputedStyle(strip).transform` for all eight strips → local angles; world angles `θ_i` = running sum; `θ_7 − θ_0 ≥ 15°` (the sheet is bowed, not flat); at every sampled t, `θ_7 ≤ 180°` (never through the landing page); after landing, every strip's world angle is 180° ± 0.5° (flat); the leaf's text computed font-size equals the page's (`--t-md`); no `translateZ` component in any strip's `matrix3d` (`m34 === 0`, `m43 === 0`).
- `strip.getAnimations()[0].effect.getTiming()`: `delay` 0 and `duration` ≤ 560 first turn, ≤ 420 in a chase (600 / 450 if Decision III picks 600 ms); keyframes have K + 1 entries, and the last entry is ±180° for strip 0 and 0° for strips 1–7.
- Line-wrap parity: for the front face's clone and the live `.page-right`, every `p` has the same `getClientRects().length`.
- After `goToPage(4)` from 0: exactly one strip animation set ran (peak `document.getAnimations().length` ≤ 8 strips + 8 × 2 faces × 2 shade layers + 2 shadows = 42); elapsed ≤ 600 ms; `currentPage === 4` and the indicator reads `5 of 5`. `goToPage(4)` issued during a running single-step turn lands on 4 (no clobber).
- Escape during a turn: the turn lands (`.page-content` of the destination is visible) before the close runs; no `"No content available"` text ever appears (`page.on('console')` + DOM check).
- After any turn settles: `document.getAnimations().length === 0` (forwards fills cancelled).
- Reduced motion (`emulateMedia({reducedMotion:'reduce'})`): during a turn `.turn-leaf.hidden === true` throughout; `.page-content` opacity animates; no `matrix3d` on any `.strip`.
- Mobile: swipe of −60 px increments the indicator; a 60 px vertical drag does not; at 50 % of a mobile turn both `.page-under` and the real `.page-right` exist and are opaque — no blank frame; `this.rightPage === document.querySelector('.page-right')` after ten turns; duration ≤ 320.
- No keyframe or transition in `styles.css`'s leaf section names a property other than `transform`/`opacity` (grep). Review artefact: `after/slow/turn-50.png` shows a curved sheet with no edge-on sliver and no visible strip banding.

**Risks.** 16 content clones per turn — DOM cost is small (spreads are < 60 nodes) but must be emptied on hide. Safari `backface-visibility` on nested preserve-3d — test in real Safari; fallback: 6 strips. Z-fighting at landing is masked by `renderPage()` running while the leaf still covers the page and by the static `translateZ(.5px)`.

---

### WP5 — Shelf ↔ book choreography, deep links, routing, focus management

**Goal.** Replace the two cross-fades with one interruptible FLIP 3D proxy sequence (spine → board → hinge → pixel-identical handoff), a dark-room overlay that is fully up before any paper shows, chrome after landing, reverse on close, faster repeats, deep links that paint open, correct history, dialog semantics with inert/focus.

**Owns.** `index.html`: new `<div class="room-dark" aria-hidden="true"></div>` and `<div class="book-proxy-stage" aria-hidden="true" hidden>` after `</main>`; the inline boot script in `<head>` (before the stylesheet link). `styles.css`: `.room-dark`, `.book-proxy-*`, `.book-view.is-staging`, `.book-chrome-top`/`.page-nav` reveal rules, `html[data-boot]` rules (new section "OPEN/CLOSE CHOREOGRAPHY" placed before the mobile block); delete `.bookshelf-scene.is-hidden` (kept by WP2 until now), `.book-view` transition (`:1328–1347`), `--duration-book/slow/medium`. `scripts/bookshelf.js`: rewrite `selectBook()`/`returnToShelf()` (no `setTimeout`, no `.is-hidden`). `scripts/main.js`: `initBookshelf()`, `handleUrlHash()`, popstate, boot path, `document.title`. `scripts/book.js`: `openBook()`/`closeBook()` signatures (`{ instant, navigate }`), `finishActive()` (created by WP4; WP5 extends it, append-only), `fillSide` reuse.

**DOM / CSS.**
```css
.room-dark { position:fixed; inset:0; background:var(--bg); opacity:0; pointer-events:none; z-index:5; }
.book-view { z-index:10; }  .book-view.is-staging { background:transparent; }
.book-view.is-staging .open-book-wrap { clip-path: inset(0 0 0 50%); }   /* right half only, static; on the perspective element, never on .open-book (preserve-3d) */
.book-view.is-staging .page-left { visibility:hidden; }
.book-view .book-chrome-top, .book-view .page-nav { opacity:0; }       /* JS reveals; .is-open sets 1 */
.book-view.is-open .book-chrome-top, .book-view.is-open .page-nav { opacity:1; }
.book-proxy-stage { position:fixed; inset:0; z-index:20; perspective:2600px; perspective-origin:50% 45%; pointer-events:none; }
.book-proxy-body { position:absolute; transform-style:preserve-3d; }   /* never opacity/filter/overflow */
.proxy-spine { position:absolute; left:0; top:0; height:100%; }      /* the cloned <svg class="spine"> */
.proxy-cover { position:absolute; top:0; height:100%; transform-origin:0 50%; transform-style:preserve-3d; }
.proxy-cover-front, .proxy-cover-back { position:absolute; inset:0; backface-visibility:hidden; border-radius:0 3px 3px 0; background:var(--board-leather); }
.proxy-cover-front::after, .proxy-cover-back::after { content:''; position:absolute; inset:5px; border:1px solid rgba(0,0,0,.25); border-radius:2px; }   /* blind fillet on both faces so the line does not pop in at handoff */
.proxy-cover-front .proxy-tool { position:absolute; left:50%; top:50%; width:5%; aspect-ratio:1; transform:translate(-50%,-50%); opacity:.55; }   /* <svg><use href="#tool-<id>" fill="url(#gilt-<id>)"/></svg>; no title on the board */
.proxy-cover-front .face-shade, .proxy-cover-back .face-shade { position:absolute; inset:0; background:#1a1410; opacity:0; border-radius:inherit; }
.proxy-cover-back { transform:rotateY(180deg) translateZ(.5px); padding:12px 0 12px 12px; }   /* static translateZ: Safari backface flicker */
.proxy-cover-back .proxy-page { position:absolute; top:12px; bottom:12px; left:12px; right:0; }  /* a .page.page-left clone: same background, padding and .page-content as the real left page */
html[data-boot] .bookshelf-scene { visibility:hidden; }
html[data-boot] .room-dark { opacity:1; }
html[data-boot] .book-view { opacity:1; visibility:visible; }
html[data-boot] .book-view .book-chrome-top, html[data-boot] .book-view .page-nav { opacity:1; }
/* html[data-boot="<id>"] .open-book { --board-leather } pairs live in WP3's per-book rules */
```
No `.proxy-title`, no `.proxy-cover-sheen`, no `.proxy-cover-shadow` (the latter's `translateZ(-1px)` ends up in front of the back face past 90° and darkens the revealed page). Boot script (`<head>`, before the CSS link):
```html
<script>(function(){var h=location.hash.slice(1);if(/^(work|about|contact|references|colophon)$/.test(h))document.documentElement.setAttribute('data-boot',h);})();</script>
```

**Geometry (desktop).** Let `S` = the clicked `.spine` rect, read after removing any hover/focus pose: add `.is-opening` to the `.book`, with `.book.is-opening, .book.is-opening:hover, .book.is-opening:focus-visible { transform:none; transition:none }`, then read the rect after one `requestAnimationFrame` (without `transition:none` the read lands mid-transition). `B` = `.open-book` rect (the book view is laid out even while hidden; force `.is-staging` + `visibility:visible; opacity:1` on `.book-view` before measuring), `pW = --page-w`, `pH = --page-h`, `G = B.left + 12 + pW` (gutter left edge), hinge `Hx = G + 2`, `s = B.height / S.height`, `sWf = S.width · s`. Proxy body: `left: Hx − sWf; top: B.top; width: sWf + pW + 14; height: B.height; transform-origin: sWf px 50%`. Spine clone at `[0, sWf]` full height. Cover: `left: sWf; width: pW + 14` (page + 12 px square + 2 px of gutter), `height: 100 %`, initial `transform: rotateY(90deg)` (extends into the shelf, front face toward +x). Invert: `ddx = (S.left + S.width) − Hx`, `ddy = (S.top + S.height/2) − (B.top + B.height/2)`. Initial body transform `translate3d(ddx px, ddy px, 0) scale(1/s) rotateY(0)`: the proxy spine overlaps the real spine pixel-for-pixel. Since the shelf no longer recedes, the same `S` is valid for close (re-read anyway, for resize).

**Open sequence (desktop; times for the first open, `D = 900`; later opens use `D = 650` and every time below scales by `D/900`; all WAAPI, all pushed to `book.active`).**

| t (ms) | Target | Keyframes | Easing |
|---|---|---|---|
| 0 (frame) | state | `navigate === 'push' && pushState('#work')`; `document.title`; `.book-view`: `is-visible is-staging`, `data-active-book`, `aria-hidden=false`; `renderPage(0)`; proxy built and shown; real `.book` gets `visibility:hidden`; `.bookshelf-scene` `inert`; focus `#book-view-title`; `willChange` on body/cover | — |
| 0 → 420 | `.book-proxy-body` | `translate3d(ddx,ddy,0) scale(1/s) rotateY(0)` → 40 %: `translate3d(.6ddx,.55ddy,60px) scale(calc((1/s)*1.35)) rotateY(-50deg)` → `translate3d(0,0,0) scale(1) rotateY(-90deg)` | `--ease-object` |
| 0 → 260 | `.book-shadow` of the clicked book | opacity (current) → 0 | linear |
| **60 → 300** | `.room-dark` | opacity 0 → 1 | `--ease-room` |
| 300 → 440 | `.open-book-wrap` (clipped to the right half; carries `.open-book-shadow`) | opacity 0 → 1 | linear |
| 300 → 420 | `.book-light` | opacity 0 → 1 | `--ease-room` |
| **300 → 820** | `.proxy-cover` | `rotateY(90deg)` → `rotateY(-90deg)` (world 0° → −180°) | `--ease-hinge` |
| 300 → 820 | `.proxy-cover-front .face-shade` | 0 → .38 @50 % → .38 (the board turns away from the light) | `--ease-hinge` |
| 300 → 820 | `.proxy-cover-back .face-shade` | .32 → 0 | `--ease-hinge` |
| 300 → 820 | `.page-shadow-right` | 0 → .45 @35 % → .15 @70 % → 0 | ease-out |
| **820 (frame)** | handoff | `.page-left` visible; remove `is-staging` (clip gone, background `var(--bg)`, invisible because `.room-dark` is at 1 and the same colour); proxy `hidden`, emptied; clear `willChange`; `--t` set; then `.room-dark` opacity → 0 (the opaque `.book-view` now covers it; no double full-screen layer) | — |
| 700 → 900 | `.book-chrome-top`, `.page-nav` | opacity 0 → 1, `translateY(6px)` → 0; then add `.is-open` | `--ease-object` |

`.room-dark` reaches 1 at 300, the frame the first paper pixel can appear, so the shelf is never seen through parchment (v2 had it at ~.5 at 300). The cover starts at 300 ms = 71 % of the 420 ms travel (G5). The right page is readable from ~440 ms (G4). End states are committed by classes on the handoff frame, never by `fill:'forwards'` alone; after the commit every forwards-filled animation is `cancel()`ed and `active` emptied, so `finish()` and natural completion share one code path and the effect stack never accumulates.

**Close (desktop; `D = 560` first, `440` later, times scale by `D/560`).** Re-read `S` with `.is-opening` (resize-safe; no recede to un-project). 0 (frame): `.room-dark` opacity 1 (the view is about to go transparent), then proxy shown at body `identity rotateY(-90)`, cover `rotateY(-90)`, back face filled with the *current* left page (`fillSide(currentPage,'left')`); `.page-left` hidden; `.is-staging` on. 0 → 120: chrome opacity 1 → 0, remove `.is-open`. 0 → 360 cover `rotateY(-90deg) → rotateY(90deg)` `--ease-room`; front `.face-shade` .38 → 0, back `.face-shade` 0 → .32; `.page-shadow-right` 0 → .4 @55 % → 0. 200 → 380: `.open-book-wrap` opacity 1 → 0. 260 → 560: body → 45 %: `translate3d(.55ddx,.6ddy,50px) scale(calc((1/s)*1.3)) rotateY(-40deg)` → `translate3d(ddx,ddy,0) scale(1/s) rotateY(0)` `--ease-room`. 220 → 560: `.room-dark` 1 → 0. 400 → 560: `.book-shadow` 0 → rest. 560 (frame): real `.book` visible, proxy hidden, `.book-view` `is-visible` removed, `aria-hidden=true`, `inert` removed from the scene, `navigate === 'push' && history.pushState(null,'',pathname)`, `document.title = 'Shubham Chandra'`, focus → the `.book` button, all animations cancelled. Escape, backdrop click, Shelf link and popstate all call this one routine; a click during close calls `finishActive()`.

**Mobile (≤ 900).** Same proxy; `B` = `.page-right` rect (the sheet); hinge at `B.left` (the 6 px leather edge); cover width = `B.width`; back face = plain endpaper (`--paper-mid`) with the leather edge, no content. Open 450 ms: body 0 → 280 (`--ease-object`, mid-key `translateZ(30px)`), room 40 → 200, sheet opacity 200 → 300, cover 180 → 450 (`rotateY(90)→rotateY(-90)`, leaves the viewport to the left), chrome 360 → 450, handoff at 450. Close 380 ms mirror. `:active` on `.book`: `rotateX(-2deg)` 80 ms (tap feedback).

**Reduced motion (both).** No proxy, no hinge: `.room-dark` 0 → 1 over 0–220 ms (`--ease-room`); `.open-book-wrap` (unclipped) + chrome opacity 0 → 1 over 160–420 ms. Close: `.open-book-wrap` 1 → 0 over 0–200, `.room-dark` 1 → 0 over 160–400. Cream over dark, never double-exposed, never a cut.

**Routing.** `openBook(id, { navigate })` and `closeBook({ navigate })` take `'push' | 'replace' | 'none'`. Click, Escape, backdrop and the Shelf link use `push`; popstate and boot use `none` (today `main.js:57/64` push from callbacks that popstate also reaches, which truncates forward history: probe — open Work, Back, Forward does nothing). popstate cases: valid hash while closed → `openBook(hash, { navigate:'none' })`; no hash while open → `closeBook({ navigate:'none' })`; a *different* valid hash while open (manual edit) → `closeBook({ instant:true, navigate:'none' })` then `openBook(hash, { navigate:'none' })`, never `selectBook()` over an open view. Session repeat: `this.hasOpened` flips after the first handoff and selects `--dur-open-again`/`--dur-close-again`.

**Deep link / boot.** `main.js` on init: if `html[data-boot]` → `book.openBook(id, { instant:true, navigate:'none' })` (no animations; sets all end-state classes, `inert`, title, focus), then `requestAnimationFrame(() => html.removeAttribute('data-boot'))`. Before JS runs, `html[data-boot]` shows an empty cream book with the right leather (the `html[data-boot="<id>"] .open-book` rules): with end-of-body scripts this frame is usually never painted, and when it is, it is the book, not the shelf. Accepted.

**Interruptibility.** `Book.active = []`; `finishActive()` = `for (a of active) a.finish()` → run the pending handoff/commit closure (`this.onSettle`) → `for (a of active) a.cancel()` → `active.length = 0`. Triggers: `pointerdown`/`click` anywhere, ArrowLeft/Right, Escape, page nav, wheel, any key except `Tab`/`Shift`/`Alt`/`Control`/`Meta` (keyboard users may move focus during the open), `visibilitychange` hidden. When the trigger is a pointer event, arm a one-shot `document.addEventListener('click', e => { e.stopPropagation(); e.preventDefault() }, { capture:true, once:true })` so the same gesture's `click` does not reach the `.book-view` backdrop close handler (`book.js:124–129`); a `setTimeout(…, 0)` removes the listener if no click follows. `bookshelf.js` no longer uses `setTimeout`; `isAnimating` becomes `book.active.length > 0` and never blocks input — it routes it to `finishActive()`.

**Acceptance.**
- Click → `.book-view.is-open` in ≤ 900 ms (first) and ≤ 650 ms (second open in the same page session) on desktop, ≤ 450 ms mobile (`performance.now()` delta).
- At `rate 0.1`, t = 0 frame: `.proxy-spine` rect equals the clicked `.spine` rect ± 1 px. Handoff pose: pause the cover animation and set `currentTime = duration` (exactly −180°), then the front-projected `.proxy-cover` rect equals `[B.left, B.left + 12 + pW + 2]` × `[B.top, B.bottom]` ± 1 px.
- Double-exposure check: sample every 25 ms of the open (rate 0.1): whenever `.open-book-wrap` computed opacity > .05, `.room-dark` computed opacity ≥ .95. Review artefact: `after/slow/open-450.png` right-page text legible while the shelf region's mean luminance < 20/255.
- Skip: `pointerdown` + `click` on the backdrop at t = 200 ms of an open → `.is-open` within 1 frame (≤ 20 ms) **and the book stays open** (`.is-visible` true 500 ms later). `Tab` at t = 200 ms does not finish the open (`active.length > 0` still). Escape during a turn: turn lands, then close runs.
- `document.activeElement.id === 'book-view-title'` after open; `=== the .book` after close; `.bookshelf-scene.inert === true` while open; Tab from the title lands on `.nav-shelf-btn` (visual order), never on a shelf element.
- `document.title === 'Work · Shubham Chandra'` while open; `'Shubham Chandra'` after close. `location.hash` is set on the click frame.
- History: open Work (length +1), Back → closed and `history.length` unchanged, Forward → Work opens again with no animation or a normal one but `location.hash === '#work'`; Back, Back → closed with hash `''`. Manual `location.hash = '#about'` while Work is open → About is open, `.book-view` was never `is-visible === false` for more than one frame.
- Deep link `/#about`: first screenshot after `load` shows the open book and `.bookshelf-scene` computed `visibility === 'hidden'`; `.book-proxy-stage.getAnimations().length === 0`; `.open-book` leather is About's.
- Chrome timing: `.page-nav` opacity is 0 at t < 650 ms and 1 at ≥ 900 ms (first open).
- After settle (open, close, turn): `document.getAnimations().length === 0`; `will-change` is `auto` on every element; `.room-dark` opacity 0 while the book is open. No `opacity`/`filter`/`overflow`/`clip-path` computed on `.book-proxy-body` or `.open-book` (G11); `document.querySelector('.proxy-title, .proxy-cover-sheen, .proxy-cover-shadow') === null`.
- Reduced motion: `.book-proxy-stage.hidden === true` throughout an open; `.room-dark` reaches ≥ .9 before `.open-book-wrap` exceeds .2.

**Risks.** `perspective-origin` mismatch between the stage and `.open-book-wrap` is harmless because the handoff pose is z = 0 (flat). Safari `backface-visibility` on the cover back — the static `translateZ(.5px)` is the mitigation; verify in real Safari. The one-shot capture click listener must be removed on the next task if no click follows (a `pointerdown` that becomes a drag), otherwise the next real click is swallowed.

---

### WP6 — Reduced-motion, a11y, performance audit and verification script

**Goal.** Merge the reduced-motion rules into one explicit block, make every remaining animation opt-in under reduce, finish semantics (labels, targets, both CV links), fold the acceptance checks of WP1–WP5 into a repeatable audit.

**Owns.** `styles.css`: the `@media (prefers-reduced-motion: reduce)` block (`:3662–3693`) and WP2's interim RM block (merged here), legacy-token cleanup (`--font-serif/sans/mono`, `--duration-*`, `--ease-out-back`, unused keyframes); `index.html:127` and `:612` (both CV links), any missing `aria-*`; `scripts/bookshelf.js:19, 46, 77, 107` (`.nav-book-btn` dead code); `scripts/audit/verify-design.mjs` (an untracked draft exists in the working tree; this WP owns and completes it), `scripts/audit/README.md`, `package.json` scripts (`audit:design`).

**Steps.**
1. Replace the RM block with one explicit block: `.scene-dim { animation:none; opacity:0 } .book { transition:none } .book:hover, .book:focus-visible { transform:none } .page-left::before, .page-right::before { transition:none } .page-edge-hit, .page-nav-btn, .nav-shelf-btn { transition:none }`. No `*` selector, no `!important`. JS branches (`book.reduceMotion`) already choose crossfade/opacity paths (WP4/WP5).
2. CV links (`:127`, `:612`): remove `download`; keep `target="_blank" rel="noopener"`.
3. Verify all `aria-label`s (spines, `.page-nav`, `.page-edge-hit`, Shelf link), `aria-live` on `.page-indicator`, `role="dialog"`.
4. Targets: assert and fix any < 44 × 44 on mobile / < 24 × 24 desktop.
5. Delete dead code: `.nav-books`/`.nav-book-btn` in `bookshelf.js`, legacy tokens, unused keyframes; confirm with `grep`.
6. `scripts/audit/verify-design.mjs`: runs every Playwright-checkable acceptance item in this spec and prints PASS/FAIL per item; `npm run audit:design`. Includes: layout fits (6 viewports incl. 1100 × 700), min font size, contrast, targets, idle animation count, filter/backdrop-filter/blend count, `document.getAnimations()` peaks, open/close/turn durations, proxy rect equality (paused at −180°), double-exposure sampling, skip-does-not-close, history sequence, focus/inert/title, RM paths, `scrollWidth === innerWidth` at 390, CSS/JS byte sizes, rAF mean/p95, and (Chromium-only, labelled) layer count via CDP `LayerTree` and 4× throttle LoAF p95 via `Emulation.setCPUThrottlingRate` + `PerformanceObserver({type:'long-animation-frame'})`. Wall-clock items (G1) run three times and take the median. Human-judgement items are emitted as `REVIEW` with the artefact path, never PASS/FAIL.

**Acceptance.** `npm run audit:design` → 0 FAIL at 1440 × 900, 1280 × 720, 1100 × 700, 390 × 844; under `reducedMotion:'reduce'` `document.getAnimations().length === 0` at rest and no `matrix3d` appears during open or turn; `grep -c "prefers-reduced-motion" styles.css` = 1 and the block contains no `*`; `grep -c "download=" index.html` → 0; CSS ≤ 60 KB, JS ≤ 35 KB.

---

## 5. Verification plan

Baseline (`before/`) already exists. Produce `after/` with the same harness, adding the frames below. All captures at DPR 2 for material crops. Note: on the pre-WP2 tree, `page.hover()`/`click()` on a spine time out ("element is not stable") because of `bookBreathe`; baseline scripts use `{ force:true }`. After WP2 the audit asserts the plain calls work.

| Capture | Viewports | Script | What to compare |
|---|---|---|---|
| `01-shelf.png`, `02-shelf-hover.png` (hover on Work, 350 ms) | 1440 × 900, 1280 × 720, 1100 × 700, 1024 × 640, 390 × 844 | `capture.mjs` | two-column page at ≥ 1100; lengthwise titles; name 36–44 px left-aligned; facts at body size; utility row ≥ 14.5 px; hover tips the book without lifting |
| `03-shelf-entrance-{0,150,300,600}.png` | 1440 × 900 | `capture-slow.mjs` at rate 0.1 | name/facts/utility at full opacity in frame 0; light comes up, nothing slides |
| `04-book-spread{0..4}.png` per book | 1440 × 900, 1280 × 720 | `capture.mjs` | boards, stacks, gutter valley, running heads, folios, title page verso (title/author/span), chapter drop on Work, two-line TOC with folios 3/5/7/9, text-only nav |
| `05-mobile-shelf.png`, `06-mobile-work-{0,1}.png` | 390 × 844 | `capture.mjs` | full-height sheet, first fact top < 260 px, no horizontal overflow |
| `slow/open-{0,150,300,450,600,820,900}.png` | 1440 × 900, 390 × 844 | `capture-slow.mjs` rate 0.1 | spine→board→hinge continuity; frame 0 proxy = spine; 300 room fully dark; 450 right page readable; 820 handoff seamless; board darkens as it turns, no sheen |
| `slow/turn-{0,25,50,75,100}.png` | 1440 × 900 | `capture-slow.mjs` rate 0.1 | bowed sheet at 50, never past flat; no banding; text same size as the page; shadows ramp |
| `slow/close-{0,200,400,560}.png` | 1440 × 900 | `capture-slow.mjs` | reverse path; spine lands in its slot |
| `slow/m-turn-{0,50,100}.png` | 390 × 844 | `capture-slow.mjs` | sheet-off-stack, destination visible under from frame 0 |
| `rm-open-{0,220,420}.png`, `rm-turn-50.png` | 1440 × 900, `reducedMotion:'reduce'` | `capture-slow.mjs` | dark first, then cream; no proxy, no strips |
| `deeplink-about-firstpaint.png` | 1440 × 900 | `capture.mjs` (screenshot on `load`) | open book, no shelf |
| `spine-gilt-crop.png` | 1440 × 900, DPR 2 | `capture.mjs` | REFERENCES first/last glyph luminance within 10 % |
| `metrics.json` | all | `verify-design.mjs` | every numeric acceptance item; idle rAF mean/p95; `getAnimations()` count; layer count (Chromium) |

Real-browser checks (not headless): Safari desktop + iOS for `backface-visibility`/`aspect-ratio`/nested `preserve-3d`; Chrome DevTools Performance at 4× CPU throttle for G10; Layers panel ≤ 12 on the idle shelf.

---

## 6. Commit plan (Conventional Commits; one PR per WP, branches `feat/claude/wp<n>-<slug>`, merged in order)

WP1 — `feat/claude/wp1-typography`
1. `build(book): load Alegreya, Alegreya SC and trim Cormorant weights` — fonts link, `@font-face` fallbacks, tokens, `--page-h` on `.book-container`.
2. `style(book): adopt a height-keyed modular scale and true small caps` — scale mapping, delete `small-caps`/mono/uppercase, dead `.book-page p` rule, `pageContentFadeIn`.
3. `style(book): give spreads asymmetric book margins and a chapter drop` — shared padding rule, rules, placement, Work verso drop.
4. `feat(book): add verso/recto running heads and bottom-outer folios` — `addPageFurniture()`, `data-running-head`, `data-title`.
5. `style(book): turn the Contents verso into a title page and match TOC folios` — title page order, two-line entries, leaders, 3/5/7/9.
6. `docs(book): name the new faces in the colophon` — `index.html:702–703`.
7. `style(mobile): compact the folded left page and fix mobile page type` — `.mobile-left-inline`, mobile sizes.

WP2 — `feat/claude/wp2-shelf`
1. `build(shelf): add pre-rendered grain tiles and their generator` — `grain-128.png`, `grain-paper-128.png`, `make-grain.mjs`.
2. `feat(shelf): inline the spines as SVG lettered lengthwise in gilt` — five inline svgs in `ul/li/button`, `.svg-defs` with tool symbols, cross-glyph title gilt, delete `assets/book-*.svg`.
3. `feat(shelf): rebuild the room as a lit stage and a walnut board` — stage, top light, board, wall; remove bulb/dust/reflection/overlay/nameplate/hint.
4. `feat(shelf): compose the page as shelf beside text at wide widths` — grid at ≥ 1100, `.shelf-text`, name/role/facts, utility row.
5. `perf(shelf): replace breathing books with a tip hover and a CSS light-up entrance` — hover, `.scene-dim`, static dot, loop removal.

WP3 — `feat/claude/wp3-book-object`
1. `feat(book): rebuild the open book as boards with a square and a gutter valley` — DOM, boards, gutter, stacks, `.book-light`, integer `--page-w`.
2. `feat(nav): move the Shelf link and a text-only page nav into the book column` — chrome, `.page-edge-hit`, delete curls and `.collapsed-nav` (+ `bookshelf.js` guard).
3. `feat(mobile): make the open book a full-height sheet with natural scroll` — mobile layout, single scroller, colophon edge, delete `--mobile-book-height` and `backdrop-filter`.

WP4 — `feat/claude/wp4-turn-engine`
1. `feat(book): replace the rigid leaf with an eight-strip bending chain` — DOM builder, CSS, `chainTo()`, two-layer shading, `active`/`finishActive()`.
2. `fix(book): make TOC jumps a single long turn that cannot race the chase` — `goToPage()`, `runChase()`, `closeBook()` finish-not-cancel.
3. `feat(mobile): turn pages as a sheet off a stack and add swipe` — `sheetTo()`, `bindSwipe()`.
4. `fix(a11y): route reduced motion to the content crossfade` — `turnTo()` branch.

WP5 — `feat/claude/wp5-open-close`
1. `feat(shelf): open a book with a FLIP 3D proxy instead of a cross-dissolve` — proxy, room-dark, sequence, handoff, cancel-after-commit.
2. `feat(book): reverse the proxy sequence on close and return focus` — close routine, focus, faster repeats.
3. `fix(nav): stop pushing history from popstate and paint deep links open` — `navigate` option, boot script, `data-boot`, `document.title`.
4. `feat(a11y): add dialog semantics, inert and skip-on-input` — roles, `inert`, `finishActive()` triggers, swallowed click.

WP6 — `feat/claude/wp6-audit`
1. `fix(a11y): replace the blanket reduced-motion rule with explicit opt-outs`.
2. `fix(a11y): open the CV in a tab and complete aria labels and targets`.
3. `chore(build): remove dead nav code, legacy tokens and unused keyframes`.
4. `test(audit): add verify-design to check the design spec end to end`.

Commit bodies follow the project convention (problem / solution / also / tested), no AI attribution lines per the user's global rule.

---

## 7. Review dispositions

Every must-fix from both reviews is applied unless listed under "modified" or "rejected" below. Should-fix and nice-to-have items from the creative director are all applied (13–31), with 19 modified.

**Creative director — applied as written:** 1 (two-column composition ≥ 1100), 2 (facts at body size), 3 (no overshoot), 4 (`ul/li/button`), 5 (no board title; tail tool on the board), 6 (shade by angle, no sheen), 7 (no fixture; top light only; height reclaimed), 8 (soft shadow, hover-only), 9 (text-only nav), 10 (hint deleted), 11 (cross-glyph title gilt + luminance acceptance), 12 (colophon sentence), 13 (no recede), 14 (2600 px camera, mid-key 60 px), 15 (static dot), 16 (no pinstripes, tighter overhang), 17 (chapter drop, Work only), 18 (title-page order), 20 (paper grain .025), 21 (two-line TOC), 22 (no ghost quote), 23 (clip on the wrap), 24 (no rest tilt), 25 (slim Colophon), 26 (tip without lift), 27 (faster repeats), 28 (integer stripes), 29 (`--v1` from `--t-md`), 30 (no neighbour shadow on Work), 31 (focus ring offset).
- **19, modified.** The second gradient layer is kept, but its opacity is the difference of adjacent *shade values* (`f(φ_{i+1}) − f(φ_i)`), not of angles: a difference of angles is not an opacity, and the ramp must end exactly where the next strip's flat layer begins.
- **7, extended.** With the two-column layout, the reclaimed height goes further than 50 px: `--spine-h` caps at 520 at ≥ 1100 px because the text no longer sits under the shelf.

**Engineering — applied as written:** 1 (room-dark 60→300; recede gone), 2 (`.book-light` element), 3 (swallowed click + Tab/modifier exclusions), 5 (`aspect-ratio: var(--vol-w)`; About/Colophon width acceptance), 7 (two static `translateZ(.5px)`; G8 reworded), 8 (integer `--page-w` from JS; identical text rendering; `scrollTop` copied; line-wrap parity acceptance), 9 (real `.page-right` holds the destination; single mobile scroller), 10 (`goToPage` sets target only; long-jump inside the chase; `closeBook` finishes and awaits), 11 (`navigate` option; different-hash-while-open case), 12 (all six ownership cuts: WP3 owns the `collapsedNav` guard; WP2 keeps `:148–222` and `.is-hidden`; WP1 owns the shared padding selectors and `--page-h` on `.book-container`; WP1 no longer edits shelf/chrome faces), 13 (CSS-only entrance; `html[data-boot="<id>"]` leather rules; empty-book first frame accepted and stated), 14 (`.is-opening` kills the transition; rAF before read), 15 (`.proxy-cover-shadow` deleted), 16 (`finish → commit → cancel`; `.room-dark` reset to 0 after handoff and to 1 on the close frame), 17 (clip and opacity on `.open-book-wrap`). Section B: no strip overlap; edge-hit hidden under `.is-turning`; fillet on the proxy back; colophon mobile edge; `height:100%`; no `-webkit-background-clip:text` (the title is gone); split `size-adjust` blocks; hint exemption moot; WP6 merges the RM blocks; `:3329–3344` assigned to WP2. Section C: all false claims corrected in place (21 `small-caps`; 120/150 ms crossfade; CV links `:127` and `:612`; `<main>` `:58–141`; G10 baseline 18.3/33.9; ten idle loops and the `pulse`/`pageContentFadeIn` deletions assigned; `isolation` drop made explicit). Section D: `fonts.load`; human items marked `REVIEW`; LoAF p95; paused −180° measurement; `backdrop-filter` checked; `feTurbulence` grep; G1 median of three; layer count labelled Chromium-only.
- **4, moot.** The shelf no longer recedes (creative director 13), so `S` is the same at open and close; it is still re-read on close for resize safety, through `.is-opening`.
- **6, modified.** The leaf box is corrected as proposed (top 12, height −24, `--page-w` based), but the hinge stays at the **gutter centre**, not the page's inner edge: a page-edge hinge lands the leaf 4 px (one full gutter) right of the real left page, which is a visible jump when the leaf hides. The leaf is `--page-w + 2px` wide and carries 2 px of gutter gradient on the hinge side of each face, so landing is exact.

**Rejected:** none. Two v2 claims the reviews did not raise were also fixed: `--group-w` is now Σ(`vol-w` × `vol-h`) (.775 with joints), not the flat .80; and the mobile `.book { padding:0 4px }` target width is stated honestly (≥ 34 px plus an 8 px gap, which G13 allows) rather than "≥ 38 px".

---

## 8. Owner decisions

- **2026-09-24 — Decision 1 approved:** remove the Edison bulb, the brass nameplate and the "Pick a volume" hint, as specified in WP2. No touch-only hint for now; revisit only if phone testing shows visitors do not discover that spines open.
- **2026-09-24 — Decision II approved:** text face → Alegreya + Alegreya SC; Cormorant Garamond stays for titles and spines (WP1 as specified).
- **2026-09-24 — Decision III approved: 600 ms page turn.** G4 page-turn budget is now ≤ 600 ms desktop, ≤ 450 ms for later turns in one chase (chase = 0.75 × single turn); phone stays ≤ 320 ms. WP4 uses `D = opts.chase ? 450 : 600`; the `--dur-turn` token is `600ms`, `--dur-turn-chase` `450ms`, `--duration-turn: .6s`.
- **2026-09-24 — Decision IV approved:** page-turn affordances, specified in §9 and built in WP3 (static parts) and WP4/WP5 (motion parts).
- **Pending — Decision V:** the "lift off the shelf" beat at the start of the open (prototype in the review page's Opening demo). Affects WP5 only.

---

## 9. Page-turn affordances (Decision IV)

Problem: at rest the only visible turn control is the small nav line under the book; nothing on the page says it turns. Four quiet cues fix it. No text hint, no drag-to-peel.

**9.1 Corner lift (static; WP3 builds it, WP4 wires the turn state).** Each `.page-edge-hit` button (WP3) contains one `.page-corner` visual at its bottom outer corner: right page → bottom-right, left page → bottom-left. The corner reads as the page's own corner lifted slightly off the page below.
```css
.page-corner { position:absolute; bottom:12px; width:30px; height:30px; pointer-events:none;
  transition: transform 220ms var(--ease-object), box-shadow 220ms var(--ease-object); }
.page-edge-hit-next .page-corner { right:0; transform-origin:100% 100%;
  background: linear-gradient(315deg, transparent 50%, #e6dcc6 50%, #f3ede0 64%, #d8ccb2 100%);
  box-shadow: -3px -3px 7px -2px rgba(40,26,12,.22); border-radius: 0 0 2px 0; }
.page-edge-hit-prev .page-corner { left:0; transform-origin:0 100%;
  background: linear-gradient(45deg, transparent 50%, #e6dcc6 50%, #f3ede0 64%, #d8ccb2 100%);
  box-shadow: 3px -3px 7px -2px rgba(40,26,12,.22); border-radius: 0 0 0 2px; }
.page-edge-hit:hover .page-corner, .page-edge-hit:focus-visible .page-corner { transform: scale(1.55); }
.page-edge-hit:disabled .page-corner, .book-view.is-turning .page-corner { opacity:0; }
```
(`bottom:12px` puts it on the page, inside the board square; tune so the corner sits exactly on the page's corner, over the tail stack.) The corner is always visible when that direction is available — it is the at-rest signifier. It never animates at rest.

**9.2 Clickable page edges (WP3).** `.page-edge-hit` width = the page's **outer margin** (`var(--m-out)`, ≈ 11 % of the page), not 12 % of the book and not 15 %: the zone must never cover text or links. Native `cursor:pointer`. On hover of the zone the corner lifts (9.1) and a `‹` / `›` glyph at `--t-lg` in `--page-secondary` fades to `.6` at the zone's vertical centre (220 ms, opacity only). Hovering the book elsewhere shows nothing. Replaces the v3 rule that showed both glyphs whenever the book was hovered.

**9.3 One peek (WP5, desktop; WP4 phone variant).** Once per page session, 500 ms after the first open lands (after the chrome is in), if the visitor has not turned a page yet and there is a next spread: the right corner scales 1 → 2.1 → 1 over 700 ms (up 300 ms `--ease-object`, down 400 ms `--ease-hinge`), its shadow deepening with it (box-shadow is on the corner itself, not animated separately — transform-only: put the deeper shadow on a child pseudo-element and cross-fade its opacity). Any input cancels it (`finish()` → rest). Never under reduced motion; never on a deep-link boot; never again that session. **Phone:** instead of the corner, once per session 500 ms after the first open, the sheet translates −14 px and back over 520 ms (`--ease-object` out, `--ease-hinge` back), revealing the edge of the next sheet under it; same cancel/RM/boot rules.

**9.4 Brighter nav line (WP3).** `.page-nav-btn`, `.page-indicator`: `color: var(--text)` (was `--text-secondary`), `font-size: var(--t-sm)` floor 15 px on desktop. `.page-nav-next:not(:disabled)` gets `color: var(--accent)`; hover → `--brass-hi`. Disabled stays `.35`. Phone bar: same colours.

**Acceptance.** At rest on Work spread 1 (1440 × 900): `.page-edge-hit-next .page-corner` visible (opacity 1), `.page-edge-hit-prev .page-corner` visible (prev exists) and hidden on spread 0; `.page-edge-hit` rect width equals the computed outer margin ± 1 px and does not intersect any text node's rect; hovering the next zone scales the corner (`matrix` a ≈ 1.55) and shows the glyph (opacity ≈ .6); the peek runs exactly once per session (a second open does not peek), is absent under `reducedMotion:'reduce'` and after `/#work` deep-link boot, and `document.getAnimations().length === 0` after it ends; `.page-nav-next` computed colour = `--accent` when enabled. Phone: the one-time nudge moves `.page-right` by −14 px at its extreme and returns to 0.
