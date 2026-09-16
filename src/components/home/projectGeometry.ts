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
//
// Session R4a. Everything below MIN_VIEWPORT_W (1440) used to be an
// unconditional static fallback (ProjectCard*.tsx in normal flow) — this
// file only ever described the desktop mechanic. R4a runs the SAME pinned
// mechanic at every tier the mechanic can physically fit, which means most
// of what used to be flat module-scope constants are now tier-dependent,
// height-dependent, or both — see geometryFor() below. There is no Figma
// reference for the mechanic below 1440px (by design — the file's mocks
// down there are the fallback card, not a frame of the mechanic; see R3's
// own diagnostic). Every number this session introduces is either measured
// off the rendered fallback cards (which DO have a Figma source, since
// they're reused verbatim as this tier's content) or a documented judgment
// call — never a guess presented as a measurement.

// --- Tiers ------------------------------------------------------------

export type ProjectTier = "phone" | "tablet" | "desktop";

// Mirrors --breakpoint-tablet / MIN_MECHANIC_VIEWPORT_W's own thresholds
// (lib/motion.ts) — the same two-way splits ProjectSection.tsx already
// computes for card selection (`mobile`, `belowDesktop`), just folded into
// one three-way tier here so geometry and card choice can never disagree
// about where a boundary sits.
export function tierFor(width: number): ProjectTier {
  if (width < 744) return "phone";
  if (width < 1440) return "tablet";
  return "desktop";
}

export const PROJECT_COUNT = 4;

// --- Desktop-tier content dimensions --------------------------------------
//
// Unchanged from before R4a, and deliberately still flat constants rather
// than tier-dependent fields on ProjectGeometry: ProjectTileContent.tsx (and
// ProjectMedia.tsx's `sizes` hint) render only inside the desktop tier,
// whose TILE_W/TILE_H are themselves flat at every desktop width by this
// session's own byte-identical requirement — so there is nothing for these
// two to vary with. The tablet and phone tiers' own content components
// (ProjectTileContentTablet.tsx, ProjectTileContentPhone.tsx) define their
// own local media-well-height consts instead, matching the pattern
// ProjectCardTablet.tsx/ProjectCardPhone.tsx already used before this
// session — see those files, not here.
export const MEDIA_H = 437; // media well height inside the card content
export const CONTENT_W = 763; // card content width (card width minus px-xl*2)

// --- Banner + pin offset -------------------------------------------------

export const NAV_H = 94; // mirrors --spacing-nav-height
export const BANNER_GAP = 12; // banner block -> frame 01, mirrors space-sm. >=744 only — see bannerGap() below.

// The "SELECTED WORK." banner block's own height. At >=744 this is
// 2 * space-sm (12, an assumed top/bottom pad around the label) + the
// mono-header line box (32) = 56px — unchanged since before R4a.
//
// R4a follow-up (mobile visual fixes): the phone-tier (<744) value used to
// mirror that same "12 + line + 12" shape (12 + 26 + 12 = 50, the line box
// itself already stepped down via the mobile type ramp, globals.css's
// `@media (width < 744px)` block) — but the 12px top/bottom pads in that
// formula were fictional. The label (SectionLabel, positioned at
// `top: NAV_H` in ProjectSection.tsx's L4 banner, no padding of its own)
// has always rendered with ZERO real padding on either side — verified by
// measuring the live DOM (label top === NAV_H exactly, label bottom ===
// NAV_H + line-height exactly), not assumed from the old comment's claim.
// That phantom 24px was pure dead space in the FRAME_PIN budget: real
// visually, nothing sat between nav's own bottom edge and the label, so
// bannerHeight below 744 is now just the label's real line-height, with
// the real post-label gap left entirely to bannerGap() below (which fix,
// unlike this one, DOES change a real rendered gap).
//
// That real line-height is 21, not 26 — this same follow-up session also
// steps the phone-tier label's own font down to text-mono-caption
// (SectionLabel's `size="phone"`, matching the card title directly beneath
// it), so the value here has to track that font's line-height
// (--text-mono-caption--line-height, globals.css), not text-mono-header's.
// Re-measured after applying the font change, not left at the pre-change
// figure — the first draft of this fix used 26 (text-mono-header's line
// height, correct before the font-size fix but stale once it landed) and
// a live-DOM re-measurement caught the resulting 5px phantom gap.
function bannerHeight(width: number): number {
  return width < 744 ? 21 : 12 + 32 + 12;
}

// The real gap between the banner block's own bottom (the label's real
// rendered bottom, now that bannerHeight above no longer pads it) and the
// gradient frame's top edge. >=744 unchanged at BANNER_GAP (12,
// --spacing-sm). R4a follow-up: halved on phone per Alice's own physical-
// device judgment call, not a Figma re-check or a spacing token (6 isn't
// on the 4/8/12/20/30/50/100/212 scale) — same non-token-literal
// precedent as PHONE_MECHANIC_MIN_INSET elsewhere in this file. The
// reclaimed 6px isn't just removed from the layout: because FRAME_H is
// itself svh-clamped (FRAME_H = clamp(..., svh - FRAME_PIN - 30, ...)),
// shrinking FRAME_PIN by this amount grows FRAME_H by the same amount
// whenever the clamp isn't already pinned at FRAME_H_MAX — the frame's own
// bottom edge stays anchored to the same svh-30 line, and the frame simply
// extends upward into the space the gap used to hold, rather than leaving
// it empty.
function bannerGap(width: number): number {
  return width < 744 ? 6 : BANNER_GAP;
}

// Where the pinned stage's content starts: the banner sits flush above this
// line, the gradient strip's first frame starts here. NAV_H + bannerHeight
// + bannerGap — 162px at >=744 (94+56+12, unchanged). Below 744: 121px
// (94+21+6) as of this follow-up session — down from R4a's original 156
// (94+50+12), which itself was already a correction of a flat pre-R4a 162
// that never accounted for the mobile banner-height step at all. Two
// independent, stacked corrections to the same term, each documented
// separately above rather than folded into one opaque number.
function framePin(width: number): number {
  return NAV_H + bannerHeight(width) + bannerGap(width);
}

// --- Frame width (mirrors the CSS page-gutter ramp, globals.css) --------
//
// The frame's own rendered width is already fluid for free — L1's strip,
// the banner, and the card's centering wrapper all sit inside
// `mx-auto max-w-page` + `px-page-x` (Tailwind utilities reading
// --container-page / --spacing-page-x), so nothing here drives that layout
// directly. This mirror exists only so TILE_W (below) can compute a
// numeric cap — the mechanic needs an actual px width for the fixed tile
// element, which CSS alone can't hand back into JS. Thresholds (1024/1440)
// and values (20/30/50) must match globals.css's own --page-x ramp by
// hand — same constraint globals.css's own comment already states for its
// hand-written @media blocks.
function pageX(width: number): number {
  if (width >= 1440) return 50;
  if (width >= 1024) return 30;
  return 20;
}

function frameWidth(width: number): number {
  return Math.min(1610, width - 2 * pageX(width));
}

// --card-inset-x's own ramp (globals.css), mirrored for the same reason
// pageX is above — used by the tablet tier's TILE_W cap (and documented
// here for the phone tier's own, deliberately different, choice below).
function cardInsetX(width: number): number {
  if (width >= 1024) return 30;
  if (width >= 395) return 20;
  return 10;
}

// --- Per-tier design constants, measured off the rendered fallback cards ---
//
// TILE_H is measured, not estimated: rendered panel boxes on clean `main`
// before R4a (ProjectCardPhone/-Tablet, whose own content this session
// reuses verbatim for the mechanic — see ProjectTileContentPhone.tsx /
// -Tablet.tsx). Re-measure if either card's content changes; don't assume
// these hold the way the banner-height mistake above shows a flat carried
// number can quietly drift wrong.
const TIER_TILE_W: Record<ProjectTier, number> = { phone: 340, tablet: 659, desktop: 863 };
const TIER_TILE_H: Record<ProjectTier, number> = { phone: 361, tablet: 532, desktop: 660 };

// The frame height Figma actually draws for that tier's own static card —
// the ceiling FRAME_H may never exceed. 788 for phone/tablet (931:4274,
// 931:4275); desktop's is the existing 780 (441:5987), unchanged.
const TIER_FRAME_H_MAX: Record<ProjectTier, number> = { phone: 788, tablet: 788, desktop: 780 };

// Minimum visual margin between the card and its frame's edge, at the
// floor. Phone/tablet mirror --spacing-md / --spacing-lg (the same tokens
// --card-inset-x resolves to at their own widths); desktop keeps its
// original 60 (TILE_INSET_TOP/BOTTOM's old flat value) so FRAME_H_MIN ==
// FRAME_H_MAX == 780 there, below.
const TIER_MIN_INSET: Record<ProjectTier, number> = { phone: 20, tablet: 30, desktop: 60 };

// FRAME_H_MIN = TILE_H + 2*minInset — the floor is "the card fits with a
// visible band of gradient on both sides," not an arbitrary number. Note
// desktop's MIN equals its own MAX (780): making desktop height-fluid too
// would break the 1440/1710 byte-identical requirement this session must
// hold. See CLAUDE.md's "Deferred work" — tracked there, not silently.
function frameHMin(tier: ProjectTier): number {
  return TIER_TILE_H[tier] + 2 * TIER_MIN_INSET[tier];
}

// The phone tier's own tile-width floor, deliberately NOT cardInsetX above.
// That ramp steps 10 -> 20 at 395px, which would pull TILE_W to 320px at
// vw 400 — below the 325px wrap threshold measured for this card's own
// content (ProjectTileContentPhone.tsx's meta row wraps between 320 and
// 325px of tile width; see MIN_MECHANIC_FLOOR_W's own comment below for
// the full measurement). A flat 10px keeps the mechanic's own tile above
// that threshold at every width MIN_MECHANIC_FLOOR_W admits. The fallback
// ProjectCardPhone.tsx is free to use the real --card-inset-x ramp instead
// (and does) because it has no fixed TILE_H to protect — its panel simply
// grows taller if a row wraps.
const PHONE_MECHANIC_MIN_INSET = 10;

// TILE_W: capped, not scaled — rule 11's "content does not scale with the
// viewport" holds at every width the tier's own card fits, and only yields
// at the very edge, same concession ProjectCardPhone.tsx's fallback makes.
function tileWidth(width: number, tier: ProjectTier): number {
  const frameW = frameWidth(width);
  const inset = tier === "phone" ? PHONE_MECHANIC_MIN_INSET : cardInsetX(width);
  return Math.min(TIER_TILE_W[tier], frameW - 2 * inset);
}

// --- The gutter between stacked frames -----------------------------------
//
// Steps 30 -> 20 below the desktop tier, mirroring the fallback cards'
// own inter-card rhythm (ProjectSection.tsx's static branch: gap-lg at
// >=1440, gap-md below — Session R3). Not independently measured for the
// mechanic itself (no Figma reference exists below 1440 for this seam) —
// flagged for Alice's physical review, per this session's own plan.
function gutter(width: number): number {
  return width >= 1440 ? 30 : 20;
}

// --- The one function everything below this line is built from ----------

export type ProjectGeometry = {
  width: number;
  svh: number;
  tier: ProjectTier;

  FRAME_W: number; // the rendered frame's own numeric width at this vw
  FRAME_H: number;
  FRAME_H_MIN: number;
  FRAME_H_MAX: number;
  FRAME_PIN: number;
  GUTTER: number;
  BUFFER: number;
  FRAME_STRIP_H: number;
  PITCH: number;
  TRAVEL: number;

  TILE_W: number;
  TILE_H: number;
  TILE_INSET_TOP: number;
  TILE_INSET_BOTTOM: number;
  TILE_TOP: number; // offset from the pinned stage's own top edge
  TILE_BOTTOM: number;

  CONTENT_INSET_TOP: number;
  CONTENT_INSET_BOTTOM: number;

  STAGE_H: number;
  SECTION_H: number;

  MIN_VIEWPORT_H: number;

  // Scroll snap (useProjectSnap.ts) — PITCH-derived, kept alongside PITCH
  // rather than recomputed at the call site so there's one formula.
  SNAP_RADIUS: number;
};

// FRAME_H = clamp(FRAME_H_MIN, 100svh - FRAME_PIN - FRAME_BOTTOM_CLEARANCE,
// FRAME_H_MAX). FRAME_BOTTOM_CLEARANCE (30, --spacing-lg) mirrors the gap
// About's own pin holds under its frame (aboutGeometry.ts's BOTTOM_GAP) —
// a different thing from ACTIONS_GAP below (the section's own margin to
// the buttons row), which happens to share the same token value but isn't
// this same distance. `svh`, never window.innerHeight — see
// useProjectGeometry.ts for why (the iOS address-bar hazard this
// deliberately stays out of, per the session's own scope).
//
// No safe-area term: layout.tsx exports no `viewport` object, so Next
// emits the default `viewport-fit` (not `cover`) and env(safe-area-inset-*)
// already resolves to 0 in the visual viewport this measures. If a later
// session adds `viewport-fit=cover`, env(safe-area-inset-bottom) needs to
// join FRAME_BOTTOM_CLEARANCE here.
const FRAME_BOTTOM_CLEARANCE = 30;

export function geometryFor(width: number, svh: number): ProjectGeometry {
  const tier = tierFor(width);
  const FRAME_PIN = framePin(width);
  const FRAME_H_MIN = frameHMin(tier);
  const FRAME_H_MAX = TIER_FRAME_H_MAX[tier];
  const FRAME_H = clamp(FRAME_H_MIN, svh - FRAME_PIN - FRAME_BOTTOM_CLEARANCE, FRAME_H_MAX);

  const GUTTER = gutter(width);
  // Dwell buffer scales continuously with FRAME_H, holding desktop's tuned
  // dwell-to-frame ratio (200:780) rather than stepping per tier — at
  // desktop's flat 780 this resolves to exactly 200, so BUFFER (and
  // everything built from it) is byte-identical to before this session.
  const BUFFER = Math.round((FRAME_H * 200) / 780);
  const FRAME_STRIP_H = FRAME_H + 2 * BUFFER;
  const PITCH = FRAME_STRIP_H + GUTTER;
  const TRAVEL = (PROJECT_COUNT - 1) * PITCH;

  const TILE_W = tileWidth(width, tier);
  const TILE_H = TIER_TILE_H[tier];
  const TILE_INSET_TOP = (FRAME_H - TILE_H) / 2;
  const TILE_INSET_BOTTOM = TILE_INSET_TOP;
  const TILE_TOP = FRAME_PIN + TILE_INSET_TOP;
  const TILE_BOTTOM = TILE_TOP + TILE_H;

  const CONTENT_INSET_TOP = TILE_INSET_TOP + BUFFER;
  const CONTENT_INSET_BOTTOM = TILE_INSET_BOTTOM + BUFFER;

  const STAGE_H = FRAME_PIN + FRAME_H;
  const SECTION_H = TRAVEL + STAGE_H;

  // The card's own bottom edge, at FRAME_H's floor (FRAME_H_MIN) — the
  // narrowest the frame (and therefore the tightest TILE_INSET_TOP) ever
  // gets before the fallback takes over instead. FRAME_PIN + TILE_H +
  // minInset, algebraically the same quantity TILE_BOTTOM works out to
  // once FRAME_H = FRAME_H_MIN (TILE_INSET_TOP there reduces to exactly
  // minInset). Desktop's FRAME_H is flat at 780 = its own FRAME_H_MAX, so
  // this reduces to the historical TILE_BOTTOM = 882 exactly (162 + 60 +
  // 660), unchanged.
  const MIN_VIEWPORT_H = FRAME_PIN + TILE_H + TIER_MIN_INSET[tier];

  const SNAP_RADIUS = PITCH * 0.5;

  return {
    width,
    svh,
    tier,
    FRAME_W: frameWidth(width),
    FRAME_H,
    FRAME_H_MIN,
    FRAME_H_MAX,
    FRAME_PIN,
    GUTTER,
    BUFFER,
    FRAME_STRIP_H,
    PITCH,
    TRAVEL,
    TILE_W,
    TILE_H,
    TILE_INSET_TOP,
    TILE_INSET_BOTTOM,
    TILE_TOP,
    TILE_BOTTOM,
    CONTENT_INSET_TOP,
    CONTENT_INSET_BOTTOM,
    STAGE_H,
    SECTION_H,
    MIN_VIEWPORT_H,
    SNAP_RADIUS,
  };
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// --- The width floor below which the mechanic can't run at all ----------
//
// TILE_H is a per-tier constant (used for the clip math and the visibility
// masks) — a wrapped row silently breaks both. Measured, not estimated:
// ProjectTileContentPhone's own meta-row `dl` wraps to two lines somewhere
// between a 320px and a 325px tile, going from a 40px-tall row to a 58px
// one (panel height 361 -> 379). Only the meta rows move; title (21),
// media well (171), and CTA (53) are flat throughout. So the phone tile
// must stay >= 325px wide.
//
// tileWidth(vw, "phone") = min(340, (vw - 2*pageX(vw)) - 2*10), and pageX
// is 20 for every phone-tier width, so this is min(340, vw - 60). Solving
// vw - 60 >= 325 gives vw >= 385; 390 is the nearest round number with a
// few px of margin over that measured boundary. Below it, the fallback
// (ProjectCardPhone) renders instead — its own panel is free to wrap and
// grow taller, since it has no fixed TILE_H to protect.
export const MIN_MECHANIC_FLOOR_W = 390;

// --- Content clipping -----------------------------------------------------
//
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
// relying on any particular relationship between them. Unchanged by R4a
// except that every input now comes from `geo` instead of a module-scope
// constant.
export function contentClipPath(i: number, geo: ProjectGeometry): string {
  const s = `${i * geo.PITCH}px + var(--strip-y)`;
  const top = `max(0px, calc(${s} - ${geo.CONTENT_INSET_TOP}px))`;
  const bottom = `max(0px, calc(-1 * (${s}) - ${geo.CONTENT_INSET_BOTTOM}px))`;
  return `inset(${top} 0px ${bottom} 0px)`;
}

// --- The section's own margin to the buttons row -------------------------
//
// Figma measures 30px from frame 04's bottom edge to the buttons row's top
// edge (--spacing-lg) — held flat at every tier: it's a page-chrome margin
// (ProjectSection.tsx's root `mb-lg`), not part of the pinned stage's own
// scroll geometry, so it doesn't participate in the tier/height fluidity
// above. See FRAME_BOTTOM_CLEARANCE's own comment for the distinct
// same-valued gap this is not.
export const ACTIONS_GAP = 30;

// --- Scroll snap ------------------------------------------------------------
// useProjectSnap.ts. Rest slots are sectionTop + i*PITCH for i in 0..3 — the
// same offsets the mechanic already derives above, not a second source.
// SNAP_RADIUS itself now lives on the geometry object (PITCH-derived, see
// geometryFor above) since PITCH is no longer a module-scope constant.

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

// Below this distance from a slot, treat the scroll as already there —
// snapping a handful of px reads as jitter, not a snap.
export const SNAP_DEADZONE = 8;
