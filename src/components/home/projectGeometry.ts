// Selected-work section geometry (ProjectSection.tsx and its three leaf
// components — ProjectFrame, ProjectTile, ProjectTileContent). Every
// geometric value the fixed-card mechanic depends on lives here, so it has
// one source rather than being duplicated across the leaves and the
// assembly. A dedicated module rather than a const block in
// ProjectSection.tsx: the leaves need these values too, and importing them
// from the assembly component would create an import cycle.
//
// Source: Figma qOEfucW57jnzP1h7h0ehks, page "final". Frame + card: 441:5985
// ("top project"), 441:5987 ("project showcase"), the "selected work" banner
// block 582:2463, and the card component 565:1454 ("project=f3-new" in set
// 439:5606). Re-read these fresh from Figma if the design changes — do not
// carry these numbers forward by assumption.

// --- Primitives, read directly off Figma --------------------------------

export const FRAME_W = 1610; // gradient frame width (= --container-page)
export const FRAME_H = 780; // gradient frame height
export const GUTTER = 30; // gap between stacked gradient frames (space-lg)

export const TILE_W = 863; // white card width
export const TILE_H = 660; // white card height
export const TILE_INSET_TOP = 60; // card's inset within its frame, top edge
export const TILE_INSET_BOTTOM = 60; // card's inset within its frame, bottom edge

// The card's horizontal insets in Figma are asymmetric — 374px left, 373px
// right (441:5987/441:5988) — which would put the card 0.5px right of the
// frame's own center. Not carried into code: the card is centered against
// the true viewport by flexbox (ProjectSection.tsx), not by a pixel offset,
// which is both what CLAUDE.md's centering fix requires and exactly on
// center, rounding artifact and all.

export const MEDIA_H = 437; // media well height inside the card content
export const CONTENT_W = 763; // card content width (card width minus px-xl*2)

export const PROJECT_COUNT = 4;

// --- The banner above the strip -------------------------------------------

export const NAV_H = 94; // mirrors --spacing-nav-height
export const BANNER_H = 56; // Figma "selected work" block, 582:2463
export const BANNER_GAP = 20; // banner block -> frame 01 (582:2463 bottom -> 441:5987 top)

// Where the pinned stage's content starts: the banner sits flush above this
// line, the gradient strip's first frame starts here. Mirrored in
// globals.css as --spacing-stack-pin, composed from the same three tokens
// (nav height + banner block height + the gap beneath it) rather than typed
// as a literal in either place, so it can't drift if one of them changes.
// 94 + 56 + 20 = 170px.
export const FRAME_PIN = NAV_H + BANNER_H + BANNER_GAP;

// --- Derived — computed from the primitives, never typed as literals ----

// Vertical distance from one frame's top to the next frame's top. 780 + 30 = 810.
export const PITCH = FRAME_H + GUTTER;

// Total distance the gradient strip and seam layer travel to carry project 1
// all the way to project PROJECT_COUNT's position. (4 - 1) * 810 = 2430.
export const TRAVEL = (PROJECT_COUNT - 1) * PITCH;

// The card's fixed top offset within the pinned stage. 170 + 60 = 230.
export const TILE_TOP = FRAME_PIN + TILE_INSET_TOP;
export const TILE_BOTTOM = TILE_TOP + TILE_H; // 230 + 660 = 890

// The pinned stage's own height — banner band + exactly one frame's worth of
// window. This, not 100svh, is what the section pins to: the stage ends the
// instant frame 04 clears it, which is what lets the section's scroll
// runway end at frame 04's bottom edge instead of one further viewport's
// worth of scrolling. 170 + 780 = 950.
export const STAGE_H = FRAME_PIN + FRAME_H;

// The section's total scroll runway: the sticky stage holds still for
// STAGE_H while the strips travel TRAVEL past it, then releases immediately.
// No viewport term — the runway's length no longer depends on window height.
export const SECTION_H = TRAVEL + STAGE_H;

// Figma: frame 04's bottom edge (441:5993, y=2556+780=3336) to the buttons
// row's top edge (441:5995, y=3366). Equals --spacing-lg exactly — use that
// token (mb-lg / pb-lg) in components rather than this raw number; it's
// exported so the verify script can assert the rendered gap against the
// Figma measurement it's meant to reproduce.
export const ACTIONS_GAP = 30;

// Below this viewport height the card plus its pin offset don't fit, so
// ProjectSection falls back to normal-flow cards instead of the mechanic.
// Equal to TILE_BOTTOM: the threshold is "the whole card fits," not some
// smaller structural floor — a partially-visible fixed card reads as
// broken, not as an intentional crop.
export const MIN_VIEWPORT_H = TILE_BOTTOM;

// --- Content clipping -----------------------------------------------------

// Clip-path for content layer `i`, expressed in terms of the same
// `--strip-y` custom property that drives the gradient strip and the seam
// layer (ProjectSection.tsx) — so a layer's visible region can never drift
// from where its gradient frame actually is.
//
// Derived from the target mechanic's general formula
//   inset(max(0, frameTop_i - cardTop) 0 max(0, cardBottom - frameBottom_i) 0)
// with frameTop_i = FRAME_PIN + i*PITCH + stripY, cardTop = FRAME_PIN +
// TILE_INSET_TOP, cardBottom = cardTop + TILE_H, frameBottom_i = frameTop_i +
// FRAME_H. FRAME_PIN cancels in both subtractions, leaving each side a
// function of `s = i*PITCH + stripY` alone:
//   top    = max(0, s - TILE_INSET_TOP)
//   bottom = max(0, -s - TILE_INSET_BOTTOM)
// This holds however TILE_INSET_TOP/BOTTOM relate to FRAME_H - TILE_H; it
// isn't relying on them being equal (they both happen to be 60 today).
export function contentClipPath(i: number): string {
  const s = `${i * PITCH}px + var(--strip-y)`;
  const top = `max(0px, calc(${s} - ${TILE_INSET_TOP}px))`;
  const bottom = `max(0px, calc(-1 * (${s}) - ${TILE_INSET_BOTTOM}px))`;
  return `inset(${top} 0px ${bottom} 0px)`;
}
