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

`4 / 8 / 12 / 20 / 30 / 50 / 212`
Buttons: `24` horizontal, `16` vertical.

Token names: `space-xs`, `space-s`, `space-sm`, `space-md`, `space-lg`, `space-xl`,
`space-2xl`, plus `space-btn-x` and `space-btn-y`.

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
homepage; all nine appear in the Work page and the nav dropdown.

Add to the Project type:
  featured: boolean   // true for the four homepage projects

Homepage reads `projects.filter(p => p.featured)`. Work page and nav read all nine.
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

### Wordmark — `src/components/motion/FlipText.tsx`

Adapted from a Magic UI snippet. The original is broken for this use in four ways;
all four fixes are required.

The effect: "alice guo." flips in character by character on page load, each character
rotating up on the X axis.

1. **No horizontal spacing between characters.** The source demo uses
   `space-x-2`, which inserts 8px between every letter. At 104px Gambarino, that
   destroys the letterfit and the wordmark stops reading as a wordmark. Characters
   sit in natural flow with the font's own kerning.
2. **Preserve the word space.** Splitting on characters turns the space in
   "alice guo." into an empty span that collapses. Render it as a non-breaking space
   with explicit width.
3. **Add perspective.** `rotateX` without a perspective value on the parent renders
   as a vertical squash, not a flip. Set `perspective: 600px` on the container.
4. **Accessibility.** Per-character spans make screen readers spell the name out.
   Put `aria-label="alice guo."` on the container and `aria-hidden` on the spans.

Import from `motion/react`, not `framer-motion`. Use `EASE`, `DUR.reveal`, and
`STAGGER` from `lib/motion.ts` rather than the snippet's own values.

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

### Stacked project cards — `src/components/home/ProjectStack.tsx`

The signature scroll interaction. Reference: hosierbrown.framer.website

Each project card is full-bleed with `rounded-card` corners. As the user scrolls:

1. The current card **pins** at the top of the viewport and stays there.
2. The next card slides up from below and covers it.
3. The covered card stays pinned underneath — it does not scroll away.
4. Repeat through all four cards.

Implementation: `position: sticky` on each card wrapper with `top` at the pin
position, cards in document order so later ones paint above earlier ones. Use scroll
progress from `motion` only if sticky alone can't achieve it.

Optional refinement, worth trying and easy to remove: scale the covered card down
very slightly (to ~0.97) as the next one rises, to suggest depth. If it reads as
gimmicky, cut it.

The inner white card, its screenshot, meta rows, and CTA are static. Only the outer
frame participates in the stack.

The nav (`src/components/chassis/Nav.tsx`) is `sticky top-0` and reserves
`--spacing-nav-height` (94px). Each card's sticky `top` must reference that same
token, not a literal, so the two pinning systems agree on where the top of the
viewport actually is.

### Hero load sequence

On page load, in order:

1. Wordmark flips in (FlipText)
2. Photo appears
3. The three bio lines fade in one at a time, staggered
4. The "VIEW MY WORK" button appears last

Total sequence under 900ms. Use `STAGGER` between the bio lines. This is the one
orchestrated moment on the page — everything else is quiet.

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

### Footer clock

The footer shows local San Diego time. Rendering this on the server causes a
hydration mismatch. Render client-side after mount with a placeholder for the
server pass.

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
│   ├── work/page.tsx     work index
│   ├── work/[slug]/      project detail (stubs for now)
│   └── about/page.tsx
├── components/
│   ├── chassis/          Nav, Footer, Ticker, Container
│   ├── ui/               Button, StatusPill, MetaRow, SectionLabel
│   ├── home/             Hero, BioList, ProjectCard, ProjectStack
│   └── motion/           FlipText, Magnet, CustomCursor, Reveal
├── content/projects.ts
├── lib/motion.ts
public/
├── fonts/                WOFF2
├── projects/             screenshots
│   └── gradients/        card background images
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
8. Work and About pages
9. Project detail stubs
10. All animation

---

## Working style

- Default to plan mode. Describe the approach and wait for approval before writing.
- One component per session. Run `/clear` between components.
- After each working component, stop so it can be reviewed and committed.
- Match the design exactly. If a value in Figma looks wrong, say so — don't correct it
  silently.