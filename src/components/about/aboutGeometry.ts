// Frame-specific pixel geometry for the About page's gray frame (Figma
// "about", 523:6601) — not design tokens, so kept here as documented
// consts rather than in @theme, following the precedent set by
// Hero.tsx's own HERO_WIDTH/PHOTO_CELL consts and projectGeometry.ts.
// Re-measure from Figma rather than assuming these hold; see
// projectGeometry.ts's own comment for why that discipline matters.

import { NAV_CLEARANCE, NAV_FRAME_GAP } from "@/components/chassis/navGeometry";

// --- Base measurements, all read directly off 523:6601's subtree -------

// Renamed from FRAME_H (5A) to FRAME_H_MAX in session 5B: the frame's
// actual rendered height is now viewport-dependent (frameHeightCss below)
// and this is only its ceiling — the exact Figma number, reached only on
// viewports tall enough that NAV_CLEARANCE + NAV_FRAME_GAP + BOTTOM_GAP
// leave 940px of room (100svh >= 1076px — an external monitor, not any
// laptop in the supported range). Nothing imports this raw number
// directly; every consumer goes through frameHeightCss so there's one
// place the ceiling is applied.
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

// NAV_CLEARANCE and NAV_FRAME_GAP used to be declared here (session 5B/fix
// pass). Lifted to chassis/navGeometry.ts (session "case-study panel
// behaviour") once the case study's sticky info panel needed the same
// nav-clearance-plus-gap offset — a chassis fact, not an About-page one.
// Re-exported under their original names so every consumer below (and
// anything importing them from this module) is unaffected by the move.
export { NAV_CLEARANCE, NAV_FRAME_GAP };

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

// Pre-measurement seed for --about-pin-scroll (useAboutPin.ts), so the
// section's height is already close to correct on the server-rendered pass
// and the post-hydration ResizeObserver correction is a few px, not a
// full-height jump. Session 5E (hold removal): the schedule collapsed to a
// single number — the S at which the last block reaches its own ideal
// framing (centered, or top-aligned if it's taller than the window; see
// useAboutPin.ts's measure()) — so this is just that block's target,
// measured at the 1710x1040 reference viewport with the widened 320px
// BLOCK_GAP. Real rendered Satoshi metrics — and which viewport a visitor
// loads at — will differ; that's exactly what the observer corrects.
export const PIN_SCROLL_ESTIMATE = 2637;

// Below this viewport height the frame plus its pin can't hold PHOTO_MIN_H
// of photo, so AboutSection falls back to normal-flow rows instead of the
// pin (see AboutFallback.tsx) — same "the whole thing must fit, not some
// smaller floor" principle as projectGeometry.ts's MIN_VIEWPORT_H.
// PHOTO_MIN_H + CAPTION_H + PHOTO_CAPTION_GAP + PILL_H + PILL_GAP
//   + 2*FRAME_PAD_Y + NAV_CLEARANCE + NAV_FRAME_GAP + BOTTOM_GAP
// = 300 + 21 + 20 + 32 + 20 + 200 + 94 + 12 + 30 = 729
export const MIN_ABOUT_VIEWPORT_H =
  PHOTO_MIN_H +
  CAPTION_H +
  PHOTO_CAPTION_GAP +
  PILL_H +
  PILL_GAP +
  2 * FRAME_PAD_Y +
  NAV_CLEARANCE +
  NAV_FRAME_GAP +
  BOTTOM_GAP;

// --- Fix pass (post-5B tuning): the narrow-width column fix ---------------
//
// The floor a shrinking text column may not cross, and the gap held once
// it's shrinking (see textColumnWidthCss below). Judgment call at 24px
// Satoshi Body Large / 32px line-height: 480px holds ~38-40 characters per
// line — narrower than the reference 663px column's ~52-55 but still a
// comfortable reading measure, and it leaves a real margin under the
// 487px ceiling the arithmetic actually allows at exactly 1440px browser
// width (measured: 1440px width -> 1240px frame content box -> 1240 -
// PHOTO_COL_W(653) - MIN_COLUMN_GAP(100) = 487px). Confirmed against a
// live measured rect, not just hand arithmetic — see the fix-pass plan.
export const TEXT_COL_MIN_W = 480;

// --spacing-3xl. Held as the floor gap between the two columns as the row
// narrows — below TEXT_COL_MIN_W's own floor this can't literally hold
// (the columns would collide before the gap does), but that point is well
// under 1440px, out of scope for this pass.
export const MIN_COLUMN_GAP = 100;

// --- Paragraph isolation pass ---------------------------------------------
//
// Gap between text blocks inside the pinned column (TextColumn.tsx) — not a
// design token: this page's Figma file has no scroll mechanic (same
// exemption as HOLD_PX previously, PHOTO_MIN_H, and TEXT_COL_MIN_W above),
// so nothing in globals.css's @theme block can back it, and that file's own
// header ("do not add values here without a matching Figma variable") rules
// out inventing one there. Applied as an inline style in TextColumn.tsx, not
// a `gap-*` utility class.
//
// The requirement: a centered block must have zero neighbor content visible
// in the text window. Binding case is the shortest block in the tallest
// window — "Everything Else" (block 6, 142px tall at the 663px reference
// column width) inside the 1710x1040 viewport's 704px window — because a
// short block leaves the most headroom on each side of center for a
// neighbor to intrude into. At that pairing the minimum gap is
// (windowH - blockH) / 2 = (704 - 142) / 2 = 281px; every other
// viewport/block pairing measured needs less (195px at 1440x900, 125px at
// 1440x760 — both against the 174px-tall "Everything Else" block at the
// narrower 487px column width). 320px clears the binding case with ~40px of
// margin. Re-derive this if body copy, column width, or FRAME_H_MAX changes
// — it's arithmetic on real rendered rects, not a fixed ratio.
export const BLOCK_GAP = 320;

// The text column's width, both in the pinned view (TextColumn.tsx) and
// the fallback (AboutFallbackRow.tsx) — same expression, shared, because
// both sit inside the same "content row" shape (a flex row whose own
// width traces back to the same frame content box) and resolves to the
// same numbers in each: confirmed by measuring both at 1440px width, not
// assumed from the markup alone.
//
// At the reference 1510px-wide row (1710px browser width) the clamp's
// middle branch (1510 - 653 - 100 = 757) exceeds the ceiling, so this
// resolves to exactly TEXT_COL_W (663) — Figma's own split, unchanged.
// Below that, the middle branch takes over and the text column absorbs
// the shrink while MIN_COLUMN_GAP holds exactly, down to TEXT_COL_MIN_W.
// PHOTO_COL_W stays fixed for now — only the text side flexes.
export const textColumnWidthCss = `clamp(${TEXT_COL_MIN_W}px, calc(100% - ${PHOTO_COL_W}px - ${MIN_COLUMN_GAP}px), ${TEXT_COL_W}px)`;

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
// the viewport exactly, leaving NAV_CLEARANCE + NAV_FRAME_GAP clear at
// top and BOTTOM_GAP clear at bottom.
export const frameHeightCss = `min(${FRAME_H_MAX}px, calc(100svh - ${NAV_CLEARANCE + NAV_FRAME_GAP + BOTTOM_GAP}px))`;

// Where the sticky wrapper pins. Reduces algebraically to
// max(106px, calc(100svh - 970px)) — kept in this definitional form
// (rather than pre-simplified) so it stays checkable by eye against the
// lock condition in the plan (frame bottom = viewportH - BOTTOM_GAP) as
// the constants above change. The 106 is NAV_CLEARANCE + NAV_FRAME_GAP;
// the 970 (FRAME_H_MAX + BOTTOM_GAP) doesn't move when NAV_FRAME_GAP
// changes — it only ever governs the OTHER branch of frameHeightCss's
// min().
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
// frameHeightCss, plus the pin's total post-lock scroll. The CSS sticky
// mechanic's own "how long do I stay stuck" duration is purely
// sectionHeight - frameHeight, so without this term the pin would release
// before the column finished traveling to its last block's target.
//
// Session 5E (hold removal): collapses close to `contentH - windowH` — a
// plain "translate the column until its bottom meets the window's bottom"
// distance — but isn't exactly that. It's the S at which the LAST block
// reaches its own ideal framing (see targetFor below), which sits
// (windowH - lastBlockH) / 2 further than flat bottom-alignment whenever
// the last block is shorter than the window (the common case — a bottom-
// aligned scroll would stop with the last block's own bottom flush against
// the window's bottom, past where it's actually centered). useAboutPin.ts's
// ResizeObserver writes this value directly, seeded at PIN_SCROLL_ESTIMATE
// for the pre-hydration render. max(0px, …) guards the (only possible on an
// extremely tall/narrow window) case where content fits without scrolling
// at all, so the section is never shorter than the frame itself.
export const sectionHeightCss = `calc(${frameHeightCss} + max(0px, var(--about-pin-scroll, ${PIN_SCROLL_ESTIMATE}px)))`;

// --- Session 5E: continuous nearest-block mapping (replaces the hold/travel
// schedule) ------------------------------------------------------------
//
// The previous session's six hold points, each with its own HOLD_PX dwell
// and the travel segments stitching them together, are gone outright — not
// tuned, deleted. With BLOCK_GAP widened so a centered paragraph is fully
// isolated (see that constant's own comment), a reading pause no longer
// needs a scroll dead-zone to manufacture it: the isolation itself is what
// reads as a pause. What survives from that schedule is a single idea,
// simplified: each block still has an ideal S (the post-lock scroll value
// at which it's best framed) — centered in the window, or top-aligned if
// it's taller than the window (useAboutPin.ts's measure() computes this
// array, `targets`, off real rendered rects — same formula the old `holds`
// array used, since the per-block exception is unrelated to the schedule
// that consumed it).
//
// The column's translateY is now literally `-clamp(s, 0, targets[last])` —
// no scheduling function needed for position at all. useAboutPin.ts writes
// this directly as `pinScroll` (already clamped to that range), and textY
// just negates it. Motion is continuous end to end: there is no s at which
// y stops changing, because y IS s (clamped), not a piecewise function of
// it.
//
// currentIndex is the one thing still derived from `targets`: the nearest
// target to the current (clamped) s. Because `targets` is ascending, the
// boundary between block i and i+1 falls exactly at their midpoint — "the
// transition between two blocks is the midpoint between their centers"
// falls out of a plain nearest-neighbor search, nothing bespoke required.
// Pure function of s, so reverse-scroll symmetry holds for free: re-entering
// any point from either direction resolves to the same index.
export function nearestBlockIndex(s: number, targets: number[]): number {
  if (targets.length === 0) return 0;

  let index = 0;
  let bestDist = Math.abs(targets[0] - s);
  for (let i = 1; i < targets.length; i++) {
    const dist = Math.abs(targets[i] - s);
    if (dist < bestDist) {
      bestDist = dist;
      index = i;
    }
  }
  return index;
}
