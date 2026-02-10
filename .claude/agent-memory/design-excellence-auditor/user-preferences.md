# User Creative Direction Preferences

## Cardinal Rule
**NEVER break realism or skeuomorphism.** Every change must make the physical simulation MORE accurate, not add artificial digital effects.

## Rejected Ideas (with reasons)
- **Dust-jacket hover blurbs on book spines** — "breaks the immersion feel"
- **Book-colored shelf glow** — "feels unrealistic"
- **Strengthened Edison bulb glow in book view** — "breaks realism", "lighting halo is VERY hard to get natural"
- **Interaction hint etched into shelf surface** — "not ideal"
- **Bookmark ribbons for visited books** — "most people won't return often enough to value this"
- **Slowed shelf→book transition (300→700ms)** — felt like latency/black screen, not meaningful pause. Reverted.

## Approved Changes
- Bug fixes, code hygiene, focus states — always welcome
- Squared off nav buttons (border-radius: 2px) — consistent with literary aesthetic
- Rectangular headshot — more like a book portrait than a circle avatar
- Removing redundant padding to improve text-to-margin ratio
- Deeper spine shadows, increased page rotation — physically accurate depth cues
- Light falloff gradients toward spine — accurate to real open books

## Design Philosophy (user's own words)
- "think like an ARTIST not just an engineer"
- "the goal is to see this and think '*sigh* finally some art on my screen today'"
- "the question under the question is 'what is beauty'"
- "the idea is to NEVER break realism or skeuomorphism"
- Warmth through subtraction, not addition

## Reference pages
- User confirmed references look fine with their original horizontal padding (var(--space-md))
- Don't touch reference page margins

## Future interest (not greenlit)
- Book-cover opening animation (CSS 3D rotateY hinge, covers open to reveal pages)
  - User: "the only thing i could see is a 'pick up animation' that is the book rising up and then folding open. but i think thats crazy hard"
  - Skip on mobile. Desktop only.
