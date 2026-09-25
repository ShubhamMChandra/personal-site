# Improvement Ideas — Prioritized

## Tier 1: High Impact (8-second impression + conversion)

### A. "Dust jacket" hover blurb on book spines
When hovering a book on the shelf, show a brief description styled as a dust-jacket flap blurb. Example for Work: "Strategy consulting → hedge fund advisory → startup operator. Four chapters." This gives visitors instant context before committing to a click. Could render as a floating card above the book or inside the shelf-front area.

### B. Make nameplate subtitle readable
`.nameplate-title` is 0.55rem — the value proposition ("Strategy · Operations · Technology") is the smallest thing on the shelf. Increase to at least 0.65rem. Consider also: the subtitle could be more specific, e.g., "Operator · Advisor · Engineer" or include the current status.

### C. Richer interaction hint
"Select a book to explore" works but is generic. Consider: "Pick a volume" or adding a subtle arrow/hand animation, or making the text reveal progressively as if typed by the quill.

### D. Book-colored shelf glow on hover
Currently all books cast the same warm glow below them on hover. Tinting the glow to match the book's cover color (maroon for Work, blue for About, etc.) would make the shelf feel more alive and help differentiate the books.

## Tier 2: Medium Impact (Polish & Consistency)

### E. Square off navigation buttons
The `page-nav-btn` (circular, border-radius: 50%) and `nav-shelf-btn` (border-radius: 4px) violate the sharp-edge literary aesthetic. Make them square or with very slight radius (2px max) to match the book world.

### F. Unify label typography
All small-caps labels (engagement-label, about-chapter-label, reference-label, etc.) should share one consistent size. Recommend standardizing to 0.7rem with 0.12em letter-spacing.

### G. Fix all `transition: all` instances
Replace with specific property lists for better performance and predictability.

### H. Add missing focus-visible states
- `.toc-entry:focus-visible` — needs visible ring
- `.social-link:focus-visible` — needs visible ring
- `.contact-email:focus-visible` — needs visible ring

### I. Bookmark ribbons for visited books
Use `localStorage` to track which books have been opened. Show small ribbon bookmarks peeking from the top of visited books. Creates a sense of progress and return.

## Tier 3: Creative / Aspirational

### J. Book opening transition
Instead of a cross-fade between shelf and book view, animate the selected book spine expanding into the open book. The spine stretches, the cover opens, and the pages appear. Would make the transition feel magical and physical.

### K. Colophon on the shelf
A subtle line below the shelf or on the floor: "Set in Cormorant Garamond. Built with vanilla HTML, CSS, and JS." This signals craft to technical visitors and adds a publishing-house touch.

### L. Pull-quote treatment in the Personal page
The "Beyond Work" spread (About book, spread 2) is beautifully written but dense. Extract one compelling line as a large pull-quote to break up the text and give skimmers a hook.

### M. Reference excerpt mode for mobile
The full reference quotes are very long for a mobile card. Consider showing the first 2-3 sentences with "Read more" expansion, or curate shorter excerpts for mobile.

### N. Quick-intro animation on shelf load
After the books slide in and the hint appears, consider a subtle animation where the Edison bulb brightens slightly, casting more light on the books — drawing the eye downward to the shelf.

### O. Keyboard shortcut hints
For power users: subtle hint that 1-4 number keys open books directly, and Escape returns to shelf. Could appear after 5 seconds of inactivity on the shelf.

## Rejected / Decided Against

### Swipe gestures on mobile
Considered swipe-down to return to shelf and swipe-left/right for pages. Risk: conflicts with native browser gestures, especially on iOS Safari. The fixed nav buttons work well enough. Revisit if user feedback requests it.
