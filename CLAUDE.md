# heyaliceguo.com

Personal portfolio for Alice Guo — product designer and design engineer, San Diego.

The design is finished and locked in Figma. Your job is faithful implementation, not
design. When something in the design seems odd, ask — do not "improve" it.

This is a portfolio site. Its job is to make a hiring manager or
recruiter want to look at the work. That means: fast, quiet, and precise.
Every animation should feel considered rather than showy. Nothing should
call attention to itself except the work.

Alice built the design. She is a designer who codes, so explain technical
tradeoffs directly — don't simplify them away. When something is
ambiguous, ask rather than guessing.

---

## Stack

- Next.js 16, App Router, TypeScript, React Compiler
- Tailwind CSS v4 (CSS-first config — there is no `tailwind.config.js`)
- `motion` (motion.dev) for animation, imported from `motion/react`
- `lenis` for smooth scroll
- Deployed to Vercel

## Design source

Figma file key: `qOEfucW57jnzP1h7h0ehks`
Home page node: `441:5946`
Components section: `439:5389`

**Only read the page named `final`.** Other pages (`designs`, `design system`,
`moodboard`) are abandoned work-in-progress. Never pull values from them.

Pull one node at a time. Never request the whole home frame in a single call.

---

## Hard rules

Violating any of these is a bug, even if the result looks correct.

1. **No `tailwind.config.js`.** Tailwind v4 is configured in `src/app/globals.css`
   inside the `@theme` block.
2. **No arbitrary values.** `p-[13px]`, `text-[#333]`, `rounded-[18px]` are forbidden.
   If a value you need doesn't exist as a token, stop and ask.
3. **No hardcoded colors, spacing, or radii** anywhere in a component. Tokens only.
4. **Never import from `framer-motion`.** Only `motion/react`. If a third-party
   snippet uses `framer-motion`, rewrite the import before using it.
5. **No additional animation libraries.** No GSAP, no react-spring, no AOS.
   `motion` and `lenis` are the entire animation stack.
6. **No browser storage.** No `localStorage`, no `sessionStorage`.
7. **No new typefaces.** Three faces exist. That's the set.
8. **No new easing curves or durations.** Use the constants in `src/lib/motion.ts`.
9. **All content comes from `src/content/projects.ts`.** Never hardcode a project
   name, role, timeline, or status in a component.
10. **Every animation respects `prefers-reduced-motion`,** collapsing to
    opacity-only or no motion at all.
11. **Desktop-first, 1710px reference width.** The Figma design is desktop-only.
    Build components to match it exactly at desktop widths. Use fluid layout
    where it's free (flex, max-width containers, relative units), but do NOT
    invent mobile or tablet layouts, breakpoints, or hamburger menus. Responsive
    behavior is a separate later pass with its own designs. If a component can't
    work without a mobile decision, stop and ask.
    **Viewport fill.** The hero section fills the viewport height on any laptop
    screen: `min-height: 100svh` (not `100vh`), with content vertically centered
    and the roles ticker pinned to the bottom edge. Use `min-height`, never a
    fixed `height`, so short viewports grow rather than clip.

    Content does not scale with the viewport. Type sizes, the photo stack, and
    the button stay at their Figma pixel values on every screen — only the
    surrounding whitespace flexes. Reference width is 1710px (16" MacBook Pro);
    the design must hold at 1440×760 (13" Air) without overflow or clipping.

    Project cards are intentionally taller than the viewport on smaller screens. They pin and stack rather than sitting at rest, so a card exceeding viewport height is expected, not a defect. The 1440×760 no-clipping requirement applies to the hero, nav, footer, and page chrome — not to card height.

    Full-width sections use `max-width` with fluid horizontal margins, not fixed
pixel widths. Project cards are 1610px max, not 1610px fixed.
12. **All images use `next/image`.** Never a raw `<img>`. Set explicit
    `width`/`height`, or use `fill` inside a sized parent. Layout shift
    from an unsized image is a bug.


---

## Design tokens

Defined in `src/app/globals.css`. Full list there; summary here so you don't have to
read the file every time.

### Type

| Role | Family | Size | Line height | Tracking |
|---|---|---|---|---|
| Display (wordmark only) | Gambarino | 104px | 0.8 | 0 |
| Mono header | JetBrains Mono | 24px | 100% | 6px |
| Mono regular | JetBrains Mono | 20px | 100% | 6px |
| Body | Satoshi Variable 400 | 20px | 26px | 0 |
| Body emphasis | Satoshi Variable 900 | 20px | 26px | 0 |

Gambarino is used **for the wordmark and nothing else.**
JetBrains Mono is structural furniture — labels, meta rows, status text, nav.
Satoshi is prose.

### Spacing

`4 / 8 / 12 / 20 / 30 / 50 / 100 / 212`
Buttons: `24` horizontal, `16` vertical.

Token names: `space-xs`, `space-s`, `space-sm`, `space-md`, `space-lg`, `space-xl`,
`space-3xl`, `space-4xl`, plus `space-btn-x` and `space-btn-y`. Named after their
Figma variables (`padding/large` → `xl`, `padding/xlarge` → `3xl`, `padding/xxlarge`
→ `4xl`) rather than `2xl`/`3xl` in ramp order, so a value never sits one letter away
from a token twice its size — session 5A renamed the 212px token from `2xl` to `4xl`
when the 100px step was added, to leave that gap open.

### Radius

Four values:
- `10px`, token `rounded-btn` — primary buttons.
- `12px`, token `rounded-nav` — the nav bar and nav buttons.
- `20px`, token `rounded-card` — cards, frames, media wells, and the expanded nav panel.
- `30px`, token `rounded-panel` — the white project card.

### Color

Neutrals, backgrounds, and three accents. See `globals.css`.
Accent usage is semantic, not decorative:
- `accent-success` `#71F0A2` — live / shipped status dot
- `accent-caution` `#FC8A8A` — NDA-protected status dot
---

## Fonts

Self-hosted WOFF2 in `public/fonts/`, loaded with `next/font/local` in
`src/app/layout.tsx`. Set `display: 'swap'` and declare fallback metrics to prevent
layout shift. Do not load fonts from a CDN or from Google Fonts.

---

## Content model

`src/content/projects.ts` holds all nine projects. Four are featured on the
homepage; all nine appear in the nav dropdown. (There is no separate Work index
page — permanently cancelled, session R0; see "Build order" below.)

Add to the Project type:
  featured: boolean   // true for the four homepage projects

Homepage reads `projects.filter(p => p.featured)`. Nav reads all nine.
The five non-featured projects have no role/timeline/color yet — leave those
fields optional and don't invent values.

```ts
type Project = {
  slug: string          // 'f3global' | 'chase' | 'geminicut' | 'blink'
  number: string        // '01'
  name: string          // 'F3GLOBAL'
  status: {
    label: string       // 'LIVE SITE'
    kind: 'live' | 'nda' | 'prototype' | 'shipped'
    href?: string
  }
  role: string
  timeline: string
  type: string
  color: string         // CSS var for the card background
  gradient: string      // path to gradient image in public/projects/gradients/
  thumbnail: string     // path to project screenshot
}
```

**Card backgrounds:** use the solid `color` value for now. Gradient images exist in
`public/projects/gradients/` and will be swapped in later — build the card so the
background is a single swappable prop, not a hardcoded style.

Case study pages are stubs. Each `/work/[slug]` route should render, show the project
title, and nothing else. Do not invent case study copy.

---

## Animation system

All constants live in `src/lib/motion.ts`. Import from there. Never inline a duration
or an easing curve.

```ts
export const EASE = [0.16, 1, 0.3, 1] as const   // one curve, everywhere
export const DUR = {
  hover: 0.2,
  reveal: 0.5,
  page: 0.8,
} as const
export const STAGGER = 0.07
```

### Rules

- Scroll reveals travel **16–24px**, never more. Long slides read as templated.
- Reveals fire once (`viewport={{ once: true }}`). Elements that re-animate every
  time they scroll past feel cheap.
- Hover transitions use `DUR.hover`.
- Lenis wraps the app in `layout.tsx` with light damping. It should feel weighted,
  not floaty or laggy.

### Reduced motion

Wrap everything. Under `prefers-reduced-motion: reduce`:
- Scroll reveals become instant or opacity-only
- Magnetic buttons are inert
- The wordmark flip becomes a plain fade
- Lenis is disabled and native scroll is used
- The role ticker stops

---

## Component specs

### Wordmark — `src/components/motion/Wordmark.tsx`

The home hero's `<h1>`. Its own load-in animation (letter-by-letter rise, no
rotation) is documented under "Hero load sequence" below, not here — that's the
authoritative description; this entry exists only to flag Wordmark's second role.

Since the page-transition session, Wordmark also renders through FlipText (below)
whenever `/` is reached by *any* client-side navigation, not only from another
page-transition route — a fix pass extended the flip to fire from an unmapped
source too (see "FlipText" below's "flip in from nothing"). The rise-in load
sequence and the FlipText flip are mutually exclusive per mount, never both: the
load sequence owns the hard-load case exclusively, and every other mount flips.
See `src/components/motion/pageTransition.ts`.

### FlipText — `src/components/motion/FlipText.tsx`

Adapted from a Magic UI snippet. The original is broken for this use in four ways;
all four fixes are required. **Not** the hero's load-in effect (see "Hero load
sequence") — this is the page-transition title flip between Home ("alice guo.")
and About ("about."), the only two routes with a Gambarino display title. A hard
load renders the destination title statically — see `pageTransition.ts`'s
`PAGE_TITLES` map, which is the single source of truth for which routes carry a
title to flip.

The effect: the destination title flips in character by character, rotating on the
X axis, while the departing title's own characters flip out — both layers share one
center point, so titles of different lengths ("alice guo." vs "about.") never resize
or drift the box mid-flip. Color interpolates across the same span, from the
departing route's token to the arriving route's.

**Flip in from nothing.** Fires on client-side navigation to Home or About from
*any* route, not only from each other. Arriving from a route in `PAGE_TITLES`
(Home ⇄ About) flips from that route's own recorded title, both directions, as
above. Arriving from anywhere else (a case study, or any future route not in
`PAGE_TITLES`) flips in from an empty source instead — the destination's own
characters still rotate in exactly as above, with nothing flipping out opposite
them, rather than the title simply appearing. Only a genuine hard load (not a
client-side navigation from anywhere) renders statically. The two-way branch
(known source vs. empty source vs. hard load) lives in one function,
`pageTransition.ts`'s `flipSourceFor`, which both Wordmark and `PageTitle.tsx`
call — `PAGE_TITLES` is still the only place a route's title text/color is
recorded, this just changes what happens for a *source* route absent from it.
Navigating between two non-participating routes (e.g. one case study to another)
is unaffected — neither renders through FlipText/PageTitle at all.

1. **No horizontal spacing between characters.** The source demo uses
   `space-x-2`, which inserts 8px between every letter. At 104px Gambarino, that
   destroys the letterfit and the title stops reading as a wordmark. Characters
   sit in natural flow with the font's own kerning.
2. **Preserve the word space.** Splitting on characters turns the space in
   "alice guo." into an empty span that collapses. Render it as a non-breaking space.
3. **Add perspective.** `rotateX` without a perspective value on the parent renders
   as a vertical squash, not a flip. Set `perspective: 600px` on the container.
4. **Accessibility.** Per-character spans make screen readers spell the name out, so
   every letter span is `aria-hidden`. The accessible name is **not** set on
   FlipText's own container — a role-less `<span>` doesn't reliably expose
   `aria-label` to assistive tech — it's set on the caller's `<h1>` instead (both
   Wordmark and `PageTitle.tsx`), which has a role and honors it.

Import from `motion/react`, not `framer-motion`. Use `EASE` and `DUR.page` (not
`DUR.reveal` — reserved for this exact purpose and otherwise unused) from
`lib/motion.ts` rather than the snippet's own values. The departing title's own
per-letter stagger is derived from `STAGGER` but compressed when it's the longer of
the two titles, so its tail doesn't visibly overlap the already-settled, shorter
arriving title — see `FlipText.tsx`'s own comment for why this is one-directional
(confirmed by screenshotting the actual render, not assumed).

### Magnetic button — `src/components/motion/Magnet.tsx`

From React Bits. Wraps all primary (black fill) buttons.

- Disabled on touch devices — a magnetic effect with no cursor is just a laggy button.
- Inert under reduced motion.
- Keyboard focus must remain visible and unaffected by the transform.

### Custom cursor — `src/components/motion/CustomCursor.tsx`

Built from scratch. Appears **only** on the mail and LinkedIn icons. Nowhere else on
the site.

- Mail icon: label reads `COPY A2GUO@UCSD.EDU`. Clicking copies the address and the
  label swaps to `COPIED` for ~1.5s, then reverts.
- LinkedIn icon: label reads `CONNECT`.
- Follows the pointer with slight lag, using `EASE`.
- Hidden entirely on touch devices and under reduced motion.
- The native cursor is hidden only while over those two targets.

### Role ticker — `src/components/chassis/Ticker.tsx`

Continuous horizontal marquee of role labels separated by `/`, in JetBrains Mono.

- Duplicate the track and animate `translateX` in CSS, not JS. Loops seamlessly.
- Slow. This is ambient, not attention-seeking.
- Gradient mask on both edges so items fade rather than clip.
- Pauses on hover.
- Stops under reduced motion.

### Stacked project cards — `src/components/home/ProjectSection.tsx`

The signature scroll interaction (rewritten again; the previous session's two-strip
mechanic — gradient frames AND the tile's contents both translating in lockstep — was
replaced wholesale, not adapted, because it had five defects: the tile interrupted the
seam, the banner painted under the gradient instead of over it, dead space opened up
inside the tile between projects, the tile drifted off-center below the 1710px
reference width, and the gap to the buttons row scaled with viewport height instead of
matching Figma's flat 30px. See git history for that approach.)

**Session R4a — provisional, pending Alice's physical-device review.** Everything
below `MIN_MECHANIC_VIEWPORT_W` (1440px) used to be an unconditional static fallback
(R3's `ProjectCardPhone`/`ProjectCardTablet`); R4a runs this same mechanic down to
`MIN_MECHANIC_FLOOR_W` (390px) instead, with the frame's own height and dwell buffer
now fluid per tier. There is no Figma reference for the mechanic below 1440px — by
design; Figma stays authoritative for measurement, never interaction, and the
mechanic's feel at small widths was worked out by building and reviewing, same as its
desktop corner-rounding/snap tuning was. If this branch doesn't survive physical
review, reverting is meant to be a small, obvious diff: `MIN_MECHANIC_VIEWPORT_W`
stays exported and documented in `lib/motion.ts` specifically so restoring it as the
fallback gate's own threshold is a one-line change, not a re-derivation.

One white card is **fixed on screen** for the whole section and never moves. Unlike the
previous version, its content never translates either — everything is laid out once,
statically, exactly filling the card. Three layers, back to front:

- **L1 — gradient frame strip.** Real frame elements, real gutters, translating with
  scroll — the only thing that moves the way the old design's frame strip did.
- **L2 — the fixed card.** Never moves. Contains all four projects' content blocks
  stacked on top of each other, each clipped with `clip-path` to the slice of the card
  that currently overlaps *that project's* gradient frame. Only one, sometimes two
  adjacent, are ever non-empty at a time.
- **L3 — seam layer.** Porcelain bands, exactly the frame gutters, spanning the full
  viewport width, in front of the card (so the seam is never interrupted by it).
  Translates with L1.

A banner (`SELECTED WORK.`) sits above all three, painting *over* the strip rather than
under it — Figma's flat static layout doesn't show this layering (it can't: the file
has no scroll mechanic), so depth here comes from this doc, not from the file. If Figma
and this section ever disagree about layering, this section wins; if they disagree
about a measurement, Figma wins.

L1 and L3 both read their position from **one CSS custom property**, `--strip-y`,
registered via `@property` in `globals.css` and written by a single `motion.div`
(`useScroll` + `useTransform` from `motion/react`, targeting the section) — not two
independently-computed values. Each content layer's `clip-path`
(`projectGeometry.ts`'s `contentClipPath`) reads that same property through a plain CSS
`calc()`, so once written, the browser keeps all three in lockstep with zero further
JS — the same guarantee the old design made for its two strips, now extended to a third
consumer for free because clip-path is pure CSS math over the identical value. This is
CLAUDE.md's one exception to the no-per-frame-work rule for position: an
`IntersectionObserver` can't express a continuously shared scroll position, which is
what a shared seam needs. Everywhere else, that rule still stands.

`useScroll`'s offset is `["start start", "end {STAGE_H}px"]`, not `"end end"`: progress
1 is defined as "the section's bottom edge reaches the point `STAGE_H` from the
viewport's top" — exactly where the sticky pin releases, given the section's own height
is `TRAVEL + STAGE_H`. That's independent of viewport height entirely, which is what
lets the section's scroll runway end at frame 04's bottom edge rather than one further
viewport's worth of scrolling (see the buttons-gap paragraph below).

**Centering.** The fixed card is centered with a flexbox wrapper (`absolute inset-0
flex justify-center`) spanning the full pinned stage — not a pixel offset against a
reference width. Card center equals viewport center at any width; verified in
`scripts/verify-project-section.mjs` across all three tiers (1710/1440 desktop,
1024/744 tablet, 430/390 phone — `WIDTHS` in that script).

**Geometry is fluid per tier, not one fixed reference-width set of numbers.** Session
R4a's central change: `FRAME_H`, `BUFFER`, `GUTTER`, `TILE_W`, and everything derived
from them are no longer flat module-scope constants — they're computed per render by
`geometryFor(width, svh)` (`src/components/home/projectGeometry.ts`), read via
`useProjectGeometry()` (a `useSyncExternalStore` hook, same SSR-assumes-desktop
convention as `lib/motion.ts`'s other hooks). The frame's own visible height now
tracks the viewport:

```
FRAME_H = clamp(FRAME_H_MIN, 100svh − FRAME_PIN − 30, FRAME_H_MAX)
```

— read via a `100svh` probe element + `ResizeObserver`, deliberately never
`window.innerHeight` (which changes as a mobile browser's address bar collapses
mid-scroll; `svh` doesn't, which is what keeps that hazard out of this session by
construction). Per-tier `FRAME_H_MIN`/`FRAME_H_MAX` and the phone-tier width floor are
measured values with their derivations in `projectGeometry.ts` — re-read the comments
there, don't assume the numbers hold. **Desktop stays flat at `FRAME_H = 780`**
deliberately — making it height-fluid too would break the requirement that 1440/1710
render byte-identically to before R4a. Tracked as a dated item in this file's own
"Deferred work" section, not left as a silent gap.

The dwell buffer (`BUFFER`) scales continuously with `FRAME_H`, holding desktop's
tuned 200:780 dwell-to-frame ratio at every tier and height rather than stepping in
three fixed presets. `GUTTER` (the seam width) does step per tier — 30 at desktop,
20 below — mirroring R3's fallback-card rhythm, but is NOT independently measured
for the mechanic itself; flagged for physical review.

`TILE_W` is capped, not scaled, per rule 11: `min(tier's own width, frame width − 2 ×
inset)`, yielding each tier's own card at its full design width everywhere it fits,
narrowing only at the very edge (the same concession the phone fallback card's own
`maxWidth` already made before this session). `TILE_H` stays a flat, measured
per-tier constant — the mechanic's wipe-transition speed depends on it staying fixed
within a tier, so it does not participate in the width-capping at all.

All geometry (`FRAME_H`, `GUTTER`, `TILE_W/H`, the card's insets, the banner's own
height, and everything derived from them — `PITCH`, `TRAVEL`, `FRAME_PIN`, `STAGE_H`,
`SECTION_H`, `TILE_TOP`, `ACTIONS_GAP`, `MIN_VIEWPORT_H`) lives in one place:
`src/components/home/projectGeometry.ts`. Read the comments there before touching any
of it, including `contentClipPath`'s derivation from the target mechanic's general
clip formula. Re-measure from Figma rather than assuming these numbers still hold —
they've changed once already this project (the banner block turned out to be 56px
tall, not the bare 32px line box an earlier session assumed), and R4a found a second
instance of the same mistake: `FRAME_PIN` was a flat 162 sitewide even though the
banner block's own height steps 56→50 below `--breakpoint-tablet` (the mono-header
line-height token stepping 32→26) — `FRAME_PIN` is now `156` below 744px, `162` at
and above it.

**Video.** `clip-path` clips paint, not intersection — a video fully wiped by a content
layer's `clip-path` still reports its full, on-screen rect to `IntersectionObserver`,
so it would never pause (verified in Chromium, not assumed from spec). `ProjectMedia`
instead accepts an optional `visible` prop: when provided, the caller owns the
play/pause gate; when omitted (the normal-flow fallback), `ProjectMedia` keeps its own
`IntersectionObserver`. `ProjectSection` computes each project's clipped-visible-height
from the same formula `contentClipPath` uses, via `useMotionValueEvent` on the shared
`stripY` value, and only commits it to React state when the visible set actually
changes — a second, narrowly-scoped consumer of the shared value, AND-gated with one
ordinary `IntersectionObserver` on the section itself so a project doesn't read
"visible" forever once `stripY` clamps at the end of the scroll range. (Not verified in
WebKit/Firefox — those binaries aren't in this project's Playwright cache.)

`ProjectFrame.tsx` (the gradient-backed frame) and `ProjectTile.tsx` (the white panel
— `chrome`/`padded`/`clip` flags, plus `width`/`height`/`radiusClass`/`paddingClass`/
`gapClass` props as of R4a, since those are now tier-dependent rather than a single
desktop default) are used only by this mechanic — grep confirms none of the three
fallback cards import either; each draws its own inline frame+panel markup, matching
Figma's own per-tier corner-rounding pairing (phone: `rounded-card` on both frame and
card; tablet/desktop: `rounded-card`/`rounded-panel`).

**Content, not chrome, is what's shared between the mechanic and its fallback** — one
component per tier, both consuming it:
- `ProjectTileContent.tsx` — desktop tier (title row, status pill, media well, meta
  rows including TIMELINE, CTA).
- `ProjectTileContentTablet.tsx` — tablet tier (no TIMELINE row, no ROLE/TYPE
  prefixes, smaller title).
- `ProjectTileContentPhone.tsx` — phone tier (shortened title/type strings on two of
  four projects, full-width CTA, `PROJECT` not `PROJECT TYPE`).

`ProjectCard.tsx` / `ProjectCardTablet.tsx` / `ProjectCardPhone.tsx` each render their
own tier's content component inside their own frame+panel wrapper for the fallback
path; the mechanic renders the same three content components inside its own
tier-configured `ProjectTile` instances (`CONTENT_FOR`/`TILE_STYLE_FOR` in
`ProjectSection.tsx`). Content is identical either way — only the surrounding chrome
(fixed-and-clipped in the mechanic, flowing in the fallback) differs, which is the
point: no card geometry, styling, or content exists twice per tier.

**Reduced motion and short viewports share one fallback per tier, not two.** Under
`prefers-reduced-motion`, or whenever the current tier's own `MIN_VIEWPORT_H` doesn't
fit (desktop 882px unchanged from before R4a; tablet/phone derived from each tier's
own `FRAME_PIN + TILE_H + minInset` — see `projectGeometry.ts`), `ProjectSection`
renders four of that tier's own fallback card stacked in normal flow instead: no pin,
no clip, no transform. Which of the three cards renders comes from `geo.tier`
directly (`tierFor`, `projectGeometry.ts`) — one tier definition, not two
independently-maintained boundary checks that happen to agree.

A second, independent trigger gates the same fallback: the viewport being narrower
than `MIN_MECHANIC_FLOOR_W` (390px, `projectGeometry.ts`) — the width below which the
phone tier's own tile can no longer stay wide enough (325px) for its meta row not to
wrap, which would silently outgrow the tier's fixed `TILE_H` and let a CTA get
clipped off the bottom of the card (`clip-path` clips paint, not layout — a wrapped
row doesn't reflow, it overflows and gets cropped). `MIN_MECHANIC_VIEWPORT_W`
(1440px, `lib/motion.ts`) — the width floor every OTHER pinned mechanic on the site
still gates on (`MIN_ABOUT_VIEWPORT_H`, `MIN_CAROUSEL_VIEWPORT_H`) — stays exported
and documented but is deliberately unused by this one gate now; see this section's
own opening note on why.

**Focus.** All four content blocks stay in the DOM and tabbable — never `inert`, which
would remove off-window projects from the accessibility tree entirely. Tabbing into a
content block scrolls the section to bring it under the card
(`onFocusCapture` → `scrollTo` with a numeric target, see `SmoothScroll.tsx`), so a
keyboard user's focus is never on a clipped-away layer. This can't loop: scrolling
itself never moves focus, and re-focusing the block already showing is a same-index
no-op. Unlike the previous version, the card has no scrollable overflow of its own to
hijack focus with — all four layers sit at `inset: 0`, exactly filling the clip window,
so there's nothing for a browser to auto-scroll.

**The section (`page.tsx`) must never receive a `z-index`.** Same reasoning as before:
doing so gives it its own stacking context, comparing the whole assembly against the
nav's `z-50` as one number instead of case-by-case. Within the section, L1/L2/L3/the
banner carry their own z-indexes (10/20/30/40) — harmless, because `position: sticky`
always establishes its own stacking context, so those numbers are compared only against
each other, never against the nav's.

**The gap to the buttons row.** Figma measures 30px from frame 04's bottom edge to the
buttons row's top edge (`ACTIONS_GAP`, equal to `--spacing-lg` — use that token, not a
literal, and unaffected by R4a — it's a flat page-chrome margin, not part of the
pinned stage's own scroll geometry). The section's own height (`SECTION_H = TRAVEL +
STAGE_H`) ends exactly at frame 04's bottom edge — `STAGE_H` itself is svh-derived as
of R4a (it's `FRAME_PIN + FRAME_H`), but `SECTION_H` still has no *independent*
viewport-height term added on top of that, so `ACTIONS_GAP` itself stays flat 30px
regardless of window height, verified at three viewport heights including a
phone-tier one (`scripts/verify-project-section.mjs`).

### Hero load sequence

On page load, in order (built in `src/components/motion/Wordmark.tsx`,
`useLoadSequence.ts`, and `LoadReveal.tsx` — not FlipText, which this load-in sequence
never uses; FlipText is the separate Home/About page-transition flip, see "FlipText"
above):

1. Wordmark rises in letter by letter, left→right (`translateY` + `opacity`, no
   rotation, no perspective, no shimmer), with enough overlap between letters that
   several are mid-motion at once — that overlap is what reads as a flowing wave
   rather than letters popping in one at a time
2. Photo appears
3. The three bio lines fade in one at a time, staggered
4. The "VIEW MY WORK" button appears last

Soft target, not a hard ceiling — close is fine: wordmark alone ~1.4-1.5s, full
sequence ~2s first-paint-to-rest. Timing constants live in `LOAD`
(`src/lib/motion.ts`), not `STAGGER` — ten characters at `STAGGER`'s 70ms is far too
fast for this slower, more deliberate read. This is the one orchestrated moment on the
page — everything else is quiet.

Fires once per hard page load (module-scope flag in `useLoadSequence.ts`, not
`localStorage`/`sessionStorage`, plus a check against `PageTransitionProvider`'s own
previous-route state) — a reload replays it, client-side navigation within the app
does not, including a fast round trip through another route and back before the
module flag itself would otherwise have latched.

### Photo stack — `src/components/home/PhotoStack.tsx`

Five photos in the hero, stacked like a deck with slight rotational offsets.
Clicking sends the top photo to the back and brings the next one forward,
cycling circularly and looping forever.

Photos: `public/photos/photo-01.jpg` through `photo-05.jpg`. All identical
dimensions and aspect ratio.

- The outgoing photo rotates back and drops behind the stack while the
  incoming one rises to the top. Use `EASE` and `DUR.reveal`.
- Preserve the fanned offsets and rotations from the Figma photo album
  component. Each layer sits slightly offset from the one beneath it.
- The stack is one `<button>` with an `aria-label` describing what clicking
  does. Enter and Space advance it, and focus must be visible.
- Each photo needs real alt text. Announce the change with an
  `aria-live="polite"` region so it isn't silent for screen reader users.
- All five images load eagerly. A flash of empty space on click is a bug.
  `priority` on the first, eager loading on the rest.
- Under reduced motion: instant swap. No flip, no rotation, no transition.

### About hero — `src/components/about/AboutHero.tsx`

**Nav-to-title parity session.** About's title sits at the exact same distance below
the nav as Home's, at every viewport height, not just at the widths a prior pass
happened to check. This is a deliberate deviation from Figma: the file specifies a flat
212px (desktop/tablet) / 100px (phone) in a fixed-height composition with no
scroll/viewport-fill instruction, but that number only ever matches what's rendered at
one specific viewport height. Home doesn't use a flat number either — `Hero.tsx`
centers its content with `my-auto` inside `.viewport-fill`, so its nav-to-title gap is
a centering *residual* that tracks viewport height (50px at 375×812, 245.4px at
1710×1107 — never the same number twice).

**Home is the fixed reference and does not change.** About cannot just copy Home's
centering mechanism — `my-auto` splits whatever's left over after each page's own
content height, and About's title+photos block is far shorter than Home's
wordmark+bio+button block, so identical mechanisms still land at different offsets.
Instead About reads Home's own residual directly, via `--home-title-offset`
(`globals.css`) — Hero.tsx's centering math (`(100svh - nav - S - T) / 2 + space-xl`)
reproduced in pure CSS from two tokens, `--home-hero-content-h` (S) and
`--home-hero-ticker-h` (T), decomposed from Hero.tsx's own spacing so they track any
future change there automatically. Applied as a literal `padding-top`, not a margin
inside a centered box — everything below About's title lays out at **fixed** gaps
(`gap-xl` to the photos, `space-3xl` to the ticker) rather than being re-centered as one
block the way Home's is. `verify-about-section.mjs`'s Home-constants guard exists so a
drift in Hero.tsx's own geometry fails loudly instead of silently pulling About's title
off Home's.

**The peek is About-only.** About's hero uses `.viewport-fill-peek` (`.viewport-fill`
shortened by `--hero-peek`, 30px) at every tier, so the section after it crops at the
bottom edge instead of sitting flush — Home's own `.viewport-fill` and ticker are
untouched, still flush to the fold with no peek.

**Known tradeoff:** because About's content lays out at fixed gaps from a pinned title
rather than being centered as a block, and nothing pins its ticker to the hero's bottom
edge, blank space opens between the ticker and the hero's own bottom edge at tall
viewports (up to ~350px at 1024×1366). This is inherent to the fixed-gap approach and
was reviewed and accepted, not an oversight — flagged here in case a future pass wants
`mt-auto` on the ticker instead, which would close that gap at the cost of the
photo-to-ticker distance no longer being a flat 100px.

### Footer clock

The footer shows local San Diego time. Rendering this on the server causes a
hydration mismatch. Render client-side after mount with a placeholder for the
server pass.

### Footer — rotating quote system

Desktop-tier footer only (`Footer.tsx`, the `>=--breakpoint-footer-desktop`
variant, currently 1024px). Sixteen unattributed quotes plus one default
(`src/content/quotes.ts`, attribution kept only as code comments), unlocked in
three tiers as a visitor navigates deeper into the site:

- TIER_1 (9 quotes, DEFAULT_QUOTE among them) — always in the pool.
- TIER_2 (5 quotes) — added at nav-depth 6+.
- TIER_3 (3 quotes) — added at nav-depth 16+.

Every quote is stored **ALL CAPS, literally** — same sitewide convention as
every other capitalized label (`SectionLabel`'s "SELECTED WORK.", `about.ts`'s
`header`, CLAUDE.md rule 9) — never a CSS `text-transform`.

**First load is deterministic.** `DEFAULT_QUOTE` ("A DESIGNER IS A PLANNER WITH
AN AESTHETIC SENSE.") renders directly in the initial markup — identical on
server and client, so it's the `useState` initializer itself, no client-only
effect and no null-initial state needed for this one render (unlike the
clock's `useSanDiegoTime`, which this hook otherwise mirrors). Random selection
only takes over from the first client-side navigation onward. Kept in the
TIER_1 pool afterward rather than retired, so it isn't lost from rotation.

**Nav-depth counter.** A module-scope variable (`useFooterQuote.ts`), not
`sessionStorage` — hard rule 6 forbids browser storage outright, and this isn't
an exception to it, just a different, allowed mechanism (same pattern as
`useLoadSequence.ts`'s `hasPlayed` flag). Increments once per *client-side*
route change; a hard reload re-evaluates the module and resets to 0. The guard
against React's dev-only StrictMode double-invoking the mount effect is **not**
a cleanup that undoes the increment — a cleanup fires before every re-run, not
only before a synthetic remount, so an early draft that tried this silently
undid every *real* navigation's increment too, permanently freezing the
counter at 0 in every environment (a real bug, not a dev-only artifact). The
fix that's actually safe against duplicate invocations: track the last
pathname actually processed, and no-op if the incoming one repeats it.

**Selection.** Picked client-only, in an effect. Never repeats the
immediately-previous quote when the current pool has more than one option —
this holds for the very first navigation too, correctly excluding
`DEFAULT_QUOTE` since it's still "the last quote shown" at that point.

**Reroll.** A small icon button (Figma `1096:10268`, `ArrowClockwiseIcon.tsx`),
hidden until hover/focus on the quote area, `aria-label="Show another quote"`.
Rerolls within the current pool only — reads whatever `navDepth` already is,
never advances it, so a locked tier is unreachable by construction rather than
by a guard that could be forgotten. Same no-immediate-repeat rule. Usable
immediately, even before the first navigation. Positioned by
`useFooterQuoteLayout.ts`, not CSS — see Layout below.

**Layout — natural minimum-line wrapping, computed in JS.** Each quote is a
single unbroken string (`Quote = string`), not pre-broken lines. Rather than
letting the browser wrap it (this project's first attempt at this), the real
lines are computed by `footerQuoteFit.ts`'s `fitQuoteLines` — a greedy
word-wrap against a real, DOM-measured available width, run in
`useFooterQuoteLayout.ts` (a `useLayoutEffect`, ResizeObserver-driven, same
shape as `useAboutPin.ts`'s own real-block-height measurements) and rendered
as fixed `<span>`s, not CSS wrap. Three things plain CSS genuinely can't do,
which is why this is measured/computed rather than left to `white-space:
normal` the way the previous session tried:

- **Line 1 has a narrower budget than the rest**, because the reload button
  sits beside it: `line1Width = availableWidth - buttonWidth(26) -
  minimumGap(16)`, every other line gets the full `availableWidth`. CSS has
  no "this box's first line is narrower" primitive short of float/
  shape-outside, and even those can't feed a JS-computed reservation in.
- **No dangling single-word last line.** A final pass rebalances a lone
  orphaned last word by pulling the previous line's last word down (Alice's
  own worked example: "...OR BELIEVE TO / BE BEAUTIFUL." not "...OR BELIEVE
  TO BE / BEAUTIFUL."), but only if the rebalanced line still fits its own
  budget — an orphan that genuinely can't be fixed is left alone rather than
  forced to overflow. `text-wrap: pretty` covers some of this in some
  browsers today; relying on it would mean silently reverting to a possible
  orphan wherever it isn't supported.
- **The button sits at a truly fixed gap from wherever line 1's text
  actually starts**, not from the container box's edge. A right-aligned
  short first line inside a wider box leaves ragged space on its left; a
  static CSS gap from the box edge would vary with that raggedness. The
  fix measures line 1's REAL rendered `getBoundingClientRect().left` after
  it paints and writes the button's position directly from that (imperative,
  not React state — nothing else needs to re-render off it), locked to
  exactly the gap that was already correct in the single-line case
  (`MINIMUM_GAP`, 16px — mirrors `--spacing-footer-quote-gap`, kept in sync
  by hand same as `lib/motion.ts`'s `BREAKPOINT_TABLET`). The reload button
  is `position: absolute` for this reason — it no longer needs to be a flex
  sibling to have its width accounted for, since the line-1 budget above
  already does that in JS.

`availableWidth` itself is `row1.width - cluster.width`, both read live off
the DOM (never a flat number) — this is what preserves the earlier session's
fix (short quotes render on one line at wide viewports; only narrow as real
room shrinks), now serving the fitting function instead of a CSS `max-width`.
Real flex siblings (cluster `shrink-0`) still can't overlap the button/text
structurally, but the reservation is what keeps the text from ever crowding
closer than `MINIMUM_GAP` to it in the first place.

**No flash on recompute.** `lines` state never resets to null after its first
value lands — a quote change or a resize swaps directly from the old fitted
lines to the new ones, never through an empty/intermediate state. The one
unavoidable exception: real font-metric measurement can't run during SSR, so
even the deterministic `DEFAULT_QUOTE` needs one client pass before its fitted
lines exist. Footer.tsx renders the pre-line-fitting-session markup (plain CSS
wrap, button as an ordinary flex sibling) as a fallback for that one render,
rather than nothing — a hard load shows real text immediately and swaps to the
fitted version a frame later, not a pop-in from empty space.

The row's own height is locked (`h-icon`, matching the cluster's single-line
height) with overflow left at its CSS default (visible), so a 1-4 line quote
never changes the row's own box height or pushes the row below it down.
`--breakpoint-footer-desktop` is not content-derived (real flex siblings can't
overlap, structurally) — it's `--breakpoint-laptop`'s own value. Re-verify
with `scripts/verify-footer-quote.mjs`, `scripts/verify-footer-quote-wrap.mjs`
(the gap/orphan/no-crowding checks specifically), and
`scripts/verify-breakpoints.mjs` after any change to the pool, the layout, or
the breakpoint.

No `aria-live` on the quote itself (it changes on every navigation; announcing
it each time would be noise over the route change), and no attribution
rendered anywhere.

---

## Third-party component protocol

New components will be added over time, mostly from React Bits and Magic UI. Before
any third-party component is used anywhere:

1. Rewrite `framer-motion` imports to `motion/react`.
2. Replace all hardcoded colors, spacing, and radii with project tokens.
3. Replace its easing and durations with `EASE` and `DUR`.
4. Add `prefers-reduced-motion` handling.
5. Add touch-device handling if it depends on a cursor.
6. Check it introduces no new dependency. If it does, stop and ask.
7. File it under `src/components/motion/`.

A pasted component that still carries its own colors or its own easing curve is not
finished.

---

## File structure

```
src/
├── app/
│   ├── layout.tsx        fonts, Lenis, nav, footer
│   ├── globals.css       @theme tokens
│   ├── page.tsx          home
│   ├── work/[slug]/      project detail (stubs for now) — no work/page.tsx: the
│   │                     Work index was permanently cancelled, session R0
│   └── about/page.tsx
├── components/
│   ├── chassis/          Nav, Footer, Ticker, Container
│   ├── ui/               Button, StatusPill, MetaRow, SectionLabel,
│   │                     PageTitle, InlineLink
│   ├── home/             Hero, BioList, ProjectCard, ProjectStack
│   ├── about/            AboutHero, AboutFrame, TextColumn, PhotoColumn,
│   │                     aboutGeometry.ts
│   └── motion/           FlipText, Magnet, CustomCursor, Reveal
├── content/projects.ts, about.ts, tools.ts
├── lib/motion.ts
public/
├── fonts/                WOFF2
├── projects/             screenshots
│   └── gradients/        card background images
└── about/                hero + section photos, frame-gradient.jpg
```

The chassis / ui / feature split is load-bearing. Per-project color lives inside the
card frame; the chassis around it stays neutral. Keep that boundary.

---

## Build order

Do not skip ahead. Animation comes last, in one pass, after layout is locked.

1. Tokens, fonts, layout shell
2. Nav
3. Footer
4. Hero (static)
5. One project card (static, perfected)
6. `projects.ts`, then map the remaining three
7. Ticker
8. About page (no separate Work index page — permanently cancelled, session R0)
9. Project detail stubs
10. All animation

---

## Working style

- Default to plan mode. Describe the approach and wait for approval before writing.
- One component per session. Run `/clear` between components.
- After each working component, stop so it can be reviewed and committed.
- Match the design exactly. If a value in Figma looks wrong, say so — don't correct it
  silently.

---

## Deferred work

Known gaps that are deliberately not being fixed yet, each with the session that
deferred it and the condition that should bring it back. This list exists because
inline code comments have proven to be where deferred items go stale — `ProjectCard`'s
"composes all three leaves" note and the `MIN_VIEWPORT_H` 890-vs-882 drift both sat
wrong across multiple sessions while a comment claimed otherwise. An item belongs here
if a future session needs to know about it; a comment in the file it affects is a
pointer to this list, not a substitute for it.

### Desktop's pin frame is height-fixed while tablet/phone are height-fluid

*Deferred 2026-09-16 (session R4a). Revisit after R4b confirms real-device feel.*

R4a makes the selected-work pin mechanic's frame height track the viewport per tier —
`FRAME_H = clamp(min, 100svh − FRAME_PIN − 30, max)` — but **only below 1440px**. At
desktop widths `FRAME_H` stays a flat 780, because R4a's own acceptance criteria require
1440 and 1710 to render byte-identically to before that session.

The consequence: a desktop monitor gets a non-adaptive frame at every height. On a short
desktop viewport the frame's bottom edge and its seam sit below the fold; on a tall one
there is dead space under the frame that tablet and phone would have filled. Desktop
users are the only ones on a fixed frame, and the asymmetry is invisible from the code
unless you compare the tiers.

Bring it back once R4b has confirmed the height-fluid mechanic feels right on real
tablets and phones — at that point extending the same clamp to the desktop tier is a
small change (raise its `FRAME_H_MAX` above its `FRAME_H_MIN`), but it necessarily
retires the byte-identical-at-1440/1710 guarantee, so it needs its own before/after
review rather than riding along in another session.