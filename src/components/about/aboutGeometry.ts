// Frame-specific pixel geometry for the About page's gray frame (Figma
// "about", 523:6601) — not design tokens, so kept here as documented
// consts rather than in @theme, following the precedent set by
// Hero.tsx's own HERO_WIDTH/PHOTO_CELL consts and projectGeometry.ts.
// Re-measure from Figma rather than assuming these hold; see
// projectGeometry.ts's own comment for why that discipline matters.

// --- Base measurements, all read directly off 523:6601's subtree -------

// Renamed from FRAME_H (5A) to FRAME_H_MAX in session 5B: the frame's
// actual rendered height is now viewport-dependent (frameHeightCss below)
// and this is only its ceiling — the exact Figma number, reached only on
// viewports tall enough that NAV_CLEARANCE + BOTTOM_GAP leave 940px of
// room (100svh >= 1064px — an external monitor, not any laptop in the
// supported range). Nothing imports this raw number directly; every
// consumer goes through frameHeightCss so there's one place the ceiling
// is applied.
export const FRAME_H_MAX = 940; // 523:6601
export const FRAME_PAD_Y = 100; // Figma padding/xlarge, --spacing-3xl

export const TEXT_COL_W = 663; // 523:6602
export const PHOTO_COL_W = 653; // 523:6850

export const PHOTO_H = 448; // each "photo and caption" instance's photo, 523:7207
export const CAPTION_H = 21; // --text-mono-caption's own line box

export const PILL_H = 32; // section count pill, 523:7254
export const PILL_PAD_X = 16; // Figma reports 16px vertical padding, which
// can't coexist with a fixed 32px height — clamping. Real geometry is 16px
// horizontal, 32px fixed height (116px measured width corroborates 16px
// sides: 01 + / + 06 glyph widths + 2*16 + 2*10 gaps ≈ 116).
export const PILL_GAP = 20; // --spacing-md, between the pill and the photo window
export const PHOTO_CAPTION_GAP = 20; // --spacing-md, inside PhotoCaption itself

export const HERO_PHOTO = 256; // each hero photo, 523:6572
export const HERO_W = 868; // "hero" (523:6847), the title+photos column

// --- Session 5B: the pin -------------------------------------------------
//
// Session 5A built the frame at a flat 940px. This session locks it to the
// viewport instead: the frame's height becomes
//   FRAME_H = min(FRAME_H_MAX, 100svh - NAV_CLEARANCE - BOTTOM_GAP)
// and the left column scrolls internally by transform while the frame
// holds still on screen. See the 5B plan for the full derivation; this
// file only carries the constants and the CSS expressions built from them.

// Nav's own rendered height (mirrors --spacing-nav-height). Verified
// structurally, not assumed: Nav.tsx is `sticky top-0 h-nav-height`, so it
// occupies exactly this many px of viewport at every scroll position.
export const NAV_CLEARANCE = 94;

// Gap held between the frame's bottom edge and the viewport's bottom edge
// for the whole pinned range (mirrors --spacing-lg). Figma corroborates
// this twice: the "about scroll section" (523:7013) is 970 for a 940
// frame, and the ticker sits 30px above the frame's top edge at rest.
export const BOTTOM_GAP = 30;

// Documentation only — not consumed by any layout calc. Figma's "carousel
// scroll" (523:6576), the role ticker's own rendered height. Recorded here
// because the ticker's un-pinned scroll past the viewport's top edge
// during the pinned range (~26px of scroll, ~0.2s under Lenis) is a
// deliberately accepted transit, not an oversight — see the plan's §A4/A12.
// A later session must not "fix" this by growing NAV_CLEARANCE to swallow
// it: doing so only relocates where the ticker sits at lock onset, it
// cannot prevent the transit (the ticker keeps scrolling for the entire
// pin), and it costs every viewport 56px of frame height that the photo
// pays for.
export const TICKER_H = 26;

// Below this box height a photo reads as a letterboxed band rather than a
// photograph (653 wide / 300 tall ≈ 2.18:1) — a judgment call, not a
// Figma measurement. The only non-derived number in this file.
export const PHOTO_MIN_H = 300;

// Pre-measurement seed for --about-text-content-h (useAboutPin.ts), so the
// section's height is already close to correct on the server-rendered
// pass and the post-hydration ResizeObserver correction is a few px, not a
// full-height jump. Figma's own text content height (696:5290) — real
// rendered Satoshi metrics will differ slightly; that's exactly what the
// observer corrects.
export const TEXT_CONTENT_H_ESTIMATE = 1960;

// Below this viewport height the frame plus its pin can't hold PHOTO_MIN_H
// of photo, so AboutSection falls back to normal-flow rows instead of the
// pin (see AboutFallback.tsx) — same "the whole thing must fit, not some
// smaller floor" principle as projectGeometry.ts's MIN_VIEWPORT_H.
// PHOTO_MIN_H + CAPTION_H + PHOTO_CAPTION_GAP + PILL_H + PILL_GAP
//   + 2*FRAME_PAD_Y + NAV_CLEARANCE + BOTTOM_GAP
// = 300 + 21 + 20 + 32 + 20 + 200 + 94 + 30 = 717
export const MIN_ABOUT_VIEWPORT_H =
  PHOTO_MIN_H + CAPTION_H + PHOTO_CAPTION_GAP + PILL_H + PILL_GAP + 2 * FRAME_PAD_Y + NAV_CLEARANCE + BOTTOM_GAP;

// --- Derived CSS length expressions ---------------------------------------
//
// Layout is CSS, not JS: every viewport-dependent size below is a string
// the browser resolves via calc()/min()/max(), so the server-rendered HTML
// is already correct at every viewport width and nothing reflows at
// hydration (a JS-computed frame height would guarantee a shift on every
// load — see the 5B plan §B2). Only the text content's own rendered
// height — which depends on font metrics, not on the viewport — has to be
// measured in JS (useAboutPin.ts) and fed back in through
// --about-text-content-h.

// The frame's rendered height. Caps at FRAME_H_MAX; below that it tracks
// the viewport exactly, leaving NAV_CLEARANCE clear at top and BOTTOM_GAP
// clear at bottom.
export const frameHeightCss = `min(${FRAME_H_MAX}px, calc(100svh - ${NAV_CLEARANCE + BOTTOM_GAP}px))`;

// Where the sticky wrapper pins. Reduces algebraically to
// max(94px, calc(100svh - 970px)) — kept in this definitional form (rather
// than pre-simplified) so it stays checkable by eye against the lock
// condition in the plan (frame bottom = viewportH - BOTTOM_GAP) as the
// constants above change.
export const stickyTopCss = `calc(100svh - ${BOTTOM_GAP}px - ${frameHeightCss})`;

// The left column's visible window. Arithmetic on the frame, not an
// independent measurement — the frame's own padding takes it top and
// bottom, and nothing else does. At FRAME_H_MAX this is 940 - 200 = 740,
// matching 523:6602's own height exactly.
export const textWindowCss = `calc(${frameHeightCss} - ${2 * FRAME_PAD_Y}px)`;

// --- PHOTO_WINDOW_MAX caps the right column's window; it is NOT held fixed ---
//
// 5A found the naive analogue (frame height minus its own padding, minus
// the pill and the gap below it) gives 940 - 200 - 32 - 20 = 688, but
// Figma measures the photo scroll frame (523:6622) at 550 — a real 138px
// of slack, not a rounding artifact, because the right column's content
// (602px) sits items-start inside a 740px box and simply doesn't fill it.
//
// Session 5B: once the frame's height is viewport-dependent, that slack
// has to be given up before content does. So this is now a ceiling capped
// at Figma's measured 550, not a value held fixed independent of
// TEXT_WINDOW_H — the naive arithmetic becomes the answer once the cap
// stops binding: min(PHOTO_WINDOW_MAX, TEXT_WINDOW_H - PILL_H - PILL_GAP)
// reproduces Figma exactly at FRAME_H_MAX (min(550, 688) = 550) and never
// overflows a shrunk frame. The alternative — holding the 138px of slack
// fixed and shrinking TEXT_WINDOW_H's headroom by the same amount instead
// — was considered and rejected: it shrinks the *content* window to
// preserve *empty space*, backwards from what a short viewport needs.
export const PHOTO_WINDOW_MAX = 550; // 523:6622, measured

export const photoWindowCss = `min(${PHOTO_WINDOW_MAX}px, calc(${textWindowCss} - ${PILL_H + PILL_GAP}px))`;

// The photo's own height. min(), never flex-1 — a flex child would
// stretch the 653x448 crop past its real aspect ratio on a tall viewport
// where the window has headroom to spare. Free to shrink below 448 on a
// short viewport; never to grow past it.
export const photoHeightCss = `min(${PHOTO_H}px, calc(${photoWindowCss} - ${PHOTO_CAPTION_GAP + CAPTION_H}px))`;

// The section's total scroll runway: the sticky stage holds still for
// frameHeightCss while the text column travels its own overflow past it,
// then releases immediately. --about-text-content-h is written by
// useAboutPin.ts's ResizeObserver (seeded at TEXT_CONTENT_H_ESTIMATE for
// the pre-hydration render); max(0px, …) guards the (only possible on an
// extremely tall/narrow window) case where content fits without scrolling
// at all, so the section is never shorter than the frame itself.
export const sectionHeightCss = `calc(${frameHeightCss} + max(0px, calc(var(--about-text-content-h, ${TEXT_CONTENT_H_ESTIMATE}px) - ${textWindowCss})))`;
