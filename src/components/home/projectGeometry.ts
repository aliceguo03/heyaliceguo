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
export const FRAME_H = 780; // gradient frame height — the VISIBLE slice only; see FRAME_STRIP_H
export const GUTTER = 30; // gap between stacked gradient frames (space-lg)

// Extra gradient height carried above and below FRAME_H in the L1 strip
// only — pure buffer that scrolls past off-window, giving each project more
// scroll distance ("dwell") before the wipe to the next project begins.
// Session gradient-extend: checked the actual gradient PNGs pixel-by-pixel
// before picking a number — they're smooth mesh-gradient/noise images with
// no baked artwork, already exported far taller than the FRAME_H crop shown
// today (every current asset has 600px+ of clean margin on each side), and
// object-cover is width-bound at this container width regardless of height,
// so growing the strip element just reveals more of the same image — no new
// Figma exports needed for 200. Never feeds FRAME_H, which stays the
// mask/viewport size — see FRAME_STRIP_H below for the one place this feeds.
export const BUFFER = 200;

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
export const BANNER_GAP = 12; // banner block -> frame 01, mirrors space-sm

// Where the pinned stage's content starts: the banner sits flush above this
// line, the gradient strip's first frame starts here. Mirrored in
// globals.css as --spacing-stack-pin, composed from the same three tokens
// (nav height + banner block height + the gap beneath it) rather than typed
// as a literal in either place, so it can't drift if one of them changes.
// 94 + 56 + 12 = 162px.
export const FRAME_PIN = NAV_H + BANNER_H + BANNER_GAP;

// --- Derived — computed from the primitives, never typed as literals ----

// Height of one ProjectFrame instance *in the L1 strip only*. ProjectFrame's
// `height` prop defaults to FRAME_H (used by the static ProjectCard
// fallback, and by the mask/viewport below); the strip passes this instead.
// This is the decoupling: FRAME_H stays the visible-window size, and this is
// the only thing BUFFER feeds into scroll pacing. 780 + 2*200 = 1180.
export const FRAME_STRIP_H = FRAME_H + 2 * BUFFER;

// Vertical distance from one frame's top to the next frame's top. Built from
// FRAME_STRIP_H, not FRAME_H — that's the strip element's actual height now
// that it carries buffer content; FRAME_H alone would only describe the
// visible slice, not the scroll distance a full element occupies.
// 1180 + 30 = 1210.
export const PITCH = FRAME_STRIP_H + GUTTER;

// Total distance the gradient strip and seam layer travel to carry project 1
// all the way to project PROJECT_COUNT's position. (4 - 1) * 1210 = 3630.
export const TRAVEL = (PROJECT_COUNT - 1) * PITCH;

// The card's fixed top offset within the pinned stage. 162 + 60 = 222.
export const TILE_TOP = FRAME_PIN + TILE_INSET_TOP;
export const TILE_BOTTOM = TILE_TOP + TILE_H; // 222 + 660 = 882

// The pinned stage's own height — banner band + exactly one frame's worth of
// window. This, not 100svh, is what the section pins to: the stage ends the
// instant frame 04 clears it, which is what lets the section's scroll
// runway end at frame 04's bottom edge instead of one further viewport's
// worth of scrolling. 162 + 780 = 942.
// Deliberately FRAME_H, not FRAME_STRIP_H — the visible mask/viewport never
// grows just because the strip carries more scrollable content per project
// (session gradient-extend). Growing this was the mistake to avoid.
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

// --- Scroll snap ------------------------------------------------------------
// useProjectSnap.ts. Rest slots are sectionTop + i*PITCH for i in 0..3 — the
// same offsets the mechanic already derives above, not a second source.

// How long the scroll must be quiet (no Lenis 'scroll' event) before a snap
// is considered. The debounce alone still fires mid-trackpad-momentum (real
// wheel events can arrive with >140ms gaps as inertia decays even though
// the gesture isn't over), so SNAP_VELOCITY_EPS below is a second, required
// condition, not a fallback.
export const SNAP_IDLE_MS = 140;

// lenis.velocity must be under this when the idle timer fires, in addition
// to the timer itself having gone uninterrupted — see SNAP_IDLE_MS. Set well
// above "effectively stopped": Lenis's own momentum coasts for a while after
// the wheel event ends, and waiting for it to decay near zero is what made
// the snap feel like it fired ~1s after the user let go. Firing while it's
// still gently coasting (roughly 4x the original 0.15) is what makes the
// snap feel immediate instead.
export const SNAP_VELOCITY_EPS = 0.6;

// How far from a slot a snap will still engage. Half a pitch means the
// section always resolves to *some* slot — deliberately strong for a first
// look; drop this toward 0 for proximity-only snapping without touching any
// snap logic, since every guard reads this one constant.
export const SNAP_RADIUS = PITCH * 0.5;

// Below this distance from a slot, treat the scroll as already there —
// snapping a handful of px reads as jitter, not a snap.
export const SNAP_DEADZONE = 8;

// --- Content clipping -----------------------------------------------------

// TILE_INSET_TOP/BOTTOM place the card inside the *visible* FRAME_H window —
// they answer "where does the card sit," not "how long should content stay
// unclipped." That second question needs BUFFER folded in: the strip element
// backing content layer `i` is FRAME_STRIP_H tall (FRAME_H core + BUFFER on
// each edge), so this project's own gradient is still on screen for BUFFER
// px beyond where the plain FRAME_H math would start clipping it. Clipping
// on the unmodified insets would cut the content the instant `s` passes
// TILE_INSET_TOP, while the gradient behind it still plainly reads as this
// project's — i.e. exactly the FRAME_H/viewport coupling this session
// exists to remove, reintroduced one level down. One pair of constants, used
// here and by visibilityMasks in ProjectSection.tsx, so the two can't drift.
export const CONTENT_INSET_TOP = TILE_INSET_TOP + BUFFER;
export const CONTENT_INSET_BOTTOM = TILE_INSET_BOTTOM + BUFFER;

// Clip-path for content layer `i`, expressed in terms of the same
// `--strip-y` custom property that drives the gradient strip and the seam
// layer (ProjectSection.tsx) — so a layer's visible region can never drift
// from where its gradient frame actually is.
//
// Derived from the target mechanic's general formula
//   inset(max(0, elementTop_i - cardTop) 0 max(0, cardBottom - elementBottom_i) 0)
// with elementTop_i = FRAME_PIN + i*PITCH + stripY, cardTop = FRAME_PIN +
// TILE_INSET_TOP, cardBottom = cardTop + TILE_H, elementBottom_i =
// elementTop_i + FRAME_STRIP_H. Note elementTop_i, not the FRAME_H core's own
// top — the strip's static -BUFFER offset (ProjectSection.tsx's L1 wrapper)
// is what keeps `i*PITCH` landing exactly on each project's core-visible
// rest position despite the element being taller than its core; that offset
// is what lets `s` below keep meaning the same thing it always has. FRAME_PIN
// cancels in both subtractions, leaving each side a function of
// `s = i*PITCH + stripY` alone:
//   top    = max(0, s - CONTENT_INSET_TOP)
//   bottom = max(0, -s - CONTENT_INSET_BOTTOM)
// This holds however the insets relate to FRAME_STRIP_H - TILE_H; it isn't
// relying on any particular relationship between them.
export function contentClipPath(i: number): string {
  const s = `${i * PITCH}px + var(--strip-y)`;
  const top = `max(0px, calc(${s} - ${CONTENT_INSET_TOP}px))`;
  const bottom = `max(0px, calc(-1 * (${s}) - ${CONTENT_INSET_BOTTOM}px))`;
  return `inset(${top} 0px ${bottom} 0px)`;
}
