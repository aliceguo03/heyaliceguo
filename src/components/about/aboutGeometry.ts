// About page geometry — tablet pin reflow session. Rewritten from a flat,
// desktop-only module-scope constant file into a per-tier geometryFor(width,
// svh) + useAboutGeometry() hook, mirroring projectGeometry.ts /
// useProjectGeometry.ts exactly (same SSR-assumes-desktop convention, same
// "one function everything is built from" shape). Read that module's own
// header comment for the reasoning this one inherits wholesale.
//
// Source: Figma qOEfucW57jnzP1h7h0ehks, page "final". Desktop "about"
// (523:6601), tablet "about" (1045:9705, inside "ipad pro 12.9 (portrait)"
// 1040:9085), phone "about" (1064:9880, inside "iphone 16 pro" 1040:9289).
// Phone tier does not use most of what's in this file — About's mobile
// layout is a stacked spotlight (see CLAUDE.md's sub-session B/C), not a
// pin — but tierFor/frameWidth/rowWidth below are shared with it (the
// stacked layout still sits inside the same frame chrome), and the phone
// tier still needs a value from here wherever noted.

import { NAV_CLEARANCE, NAV_FRAME_GAP } from "@/components/chassis/navGeometry";

// Hero geometry (AboutHero.tsx) — untouched by this session (the mobile
// hero photo stack is its own later sub-session, CLAUDE.md's "D"). Kept
// here unchanged so AboutHero.tsx doesn't need to know this file was
// rewritten underneath it. Per Alice: the hero holds this same 868px row
// down to ABOUT_TIER_BREAKPOINT_W (980) below, in lockstep with the
// section rows, rather than switching at its own content-only floor
// (868 + 2*20 page gutter = 908) — see that constant's own comment.
export const HERO_PHOTO = 256; // each hero photo, 523:6572
export const HERO_W = 868; // "hero" (523:6847), the title+photos column

export type AboutTier = "phone" | "tablet" | "desktop";

// About's own tier boundary — deliberately NOT --breakpoint-tablet (744).
// See globals.css's own --breakpoint-about comment for the full derivation
// (the text column's floor, type-scaled for the tablet body size, against
// the 50/50 column split below) and for why this same boundary governs the
// hero's row->stack switch too, not just the section rows'.
export const ABOUT_TIER_BREAKPOINT_W = 980;

export function tierFor(width: number): AboutTier {
  if (width < ABOUT_TIER_BREAKPOINT_W) return "phone";
  if (width < 1440) return "tablet";
  return "desktop";
}

// Mirrors --page-x's own ramp (globals.css) by hand — same accepted
// duplication projectGeometry.ts's own pageX() already documents (CSS
// custom properties can't be read inside a bare JS conditional, and this
// file has no build step to import globals.css's computed values through).
function pageX(width: number): number {
  if (width >= 1440) return 50;
  if (width >= 1024) return 30;
  return 20;
}

function frameWidth(width: number): number {
  return Math.min(1610, width - 2 * pageX(width));
}

// The frame's own content width at this viewport/tier — frameWidth minus
// AboutFrame's own internal padding (FRAME_PAD_X, below). Factored out of
// columnWidth/geometryFor's own inline duplicates of this same expression
// (B follow-up cleanup) — behavior-neutral, verified against sub-session
// A's original tablet measurements before and after.
function rowWidth(width: number, tier: AboutTier): number {
  return frameWidth(width) - 2 * FRAME_PAD_X[tier];
}

// AboutFrame's own internal padding (px-*/py-* in AboutFrame.tsx) — tablet
// is identical to desktop (both 523:6601 and 1045:9705 measure 50/100),
// phone steps down to 20/50 (1064:9880). Exported so AboutFrame.tsx's own
// Tailwind classes (which key off --breakpoint-about, not these numbers
// directly) stay checkable against this file by eye.
export const FRAME_PAD_X: Record<AboutTier, number> = { phone: 20, tablet: 50, desktop: 50 };
export const FRAME_PAD_Y: Record<AboutTier, number> = { phone: 50, tablet: 100, desktop: 100 };

// The photo's own aspect ratio — 653x448 (523:7128, desktop). Confirmed
// identical (to within rounding) at tablet (1045:9751, 414x284) and phone
// (1064:9926, 330x226) — one ratio, not three independent measurements
// that happen to be close. 653 is prime and 448 = 2^6*7, so this is
// already fully reduced; used directly as a CSS aspect-ratio rather than
// scaled to either tier's own pixel pair.
export const PHOTO_ASPECT_W = 653;
export const PHOTO_ASPECT_H = 448;

// Gap between the text and photo columns, side-by-side tiers only (tablet,
// desktop — phone stacks instead, see below).
//
// Desktop's is NOT a designed gap: 523:6601 lays the row out with
// `justify-between` and no declared gap at all — 194px is what's left
// over once TEXT_COL_W (663) and PHOTO_COL_W (653) sit inside the 1510px
// content box (1610 frame - 2*50 padding). The 50/50 split below changes
// its ROLE from leftover space to a designed constant (each column is now
// (rowW - gap)/2, not two independently fixed widths), but its VALUE
// carries over unchanged, re-derived from the same Figma numbers it
// always came from (confirmed via get_design_context on 523:6601 during
// this session, not assumed from the old file). The 50/50 split does move
// each column by 5px versus the old fixed 663/653 split (658/658) —
// visually inert, flagged for Alice's own visual pass rather than treated
// as silently correct.
//
// Tablet's own value. 1045:9707 draws it at 40px, and it was confirmed
// (Playwright, not a visual read) to be rendering exactly that at every
// width from 1024 to 1439 — no bug. B follow-up: changed to 50px anyway,
// a deliberate design override on top of a confirmed-correct number, not
// a fix. 50 already exists as --spacing-xl (globals.css), so this reads
// that value directly rather than keeping a redundant --spacing-ml token
// around at the same number (see globals.css's own note on that token's
// retirement).
const COLUMN_GAP: Record<"tablet" | "desktop", number> = {
  tablet: 50, // --spacing-xl
  desktop: 194,
};

function columnGap(tier: "tablet" | "desktop"): number {
  return COLUMN_GAP[tier];
}

// Each side-by-side column's own width at this viewport — rowWidth minus
// the gap, split in half. Phone has no meaning for this (stacked, full
// rowWidth instead) and isn't called with "phone".
function columnWidth(width: number, tier: "tablet" | "desktop"): number {
  return (rowWidth(width, tier) - columnGap(tier)) / 2;
}

// --- Pin frame ceiling, per tier ------------------------------------------
//
// Desktop unchanged (940, 523:6601). Tablet is NOT in Figma — the file has
// no scroll mechanic, so there is no tablet-tier pinned frame to measure
// (same exemption BLOCK_GAP below already documents). Measured off a real
// render at this session's own reference tablet width (1024) rather than
// guessed: the shortest block ("everything else", body text at the
// tablet-tier colW) needs enough window to isolate a paragraph the same
// way desktop's BLOCK_GAP isolates one at 320px — see BLOCK_GAP's own
// comment for the paired derivation. Both numbers were tuned together
// against a live render; re-derive both if colW, type size, or copy ever
// changes, don't assume either alone still holds.
const FRAME_H_MAX: Record<AboutTier, number> = {
  phone: 0, // unused — phone tier has no pin
  // Measured, not guessed: at colW ~370-620px (this tier's own width
  // range), the photo+pill+caption stack needs ~370px of vertical room
  // (real render, scripts/measure-sweep.mjs). 660 leaves a 460px text
  // window, ~19% slack below that stack — matching desktop's own
  // documented ~19% slack ratio (940 -> 740 window vs a ~602px content
  // stack) rather than an independently chosen number.
  tablet: 660,
  desktop: 940,
};

// Pre-measurement seed for --about-pin-scroll (useAboutPin.ts). Low
// stakes: SSR always assumes the desktop tier (useAboutGeometry's own
// convention), so this tablet value is only ever read for the brief
// window between a tablet-width client's hydration and useAboutPin's own
// useLayoutEffect correcting it (synchronous, pre-paint) — never during
// SSR itself. Desktop unchanged (2637, measured at 1710x1040 reference).
// Tablet's is a real measured range across the tier (980-1439px,
// scripts/measure-pin-scroll.mjs): 1790 at the wide end to 2219 at the
// narrow end. 2000 sits mid-range rather than picking either extreme.
const PIN_SCROLL_ESTIMATE: Record<"tablet" | "desktop", number> = {
  tablet: 2000,
  desktop: 2637,
};

// Gap between text blocks inside the pinned column (TextColumn.tsx),
// applied as an inline style, not a `gap-*` utility class — not a design
// token, same exemption as PHOTO_MIN_H/TEXT_COL_MIN_W below: this page's
// Figma file has no scroll mechanic, so nothing in globals.css's @theme
// block can back it, and that file's own header rules out inventing a
// token without a matching Figma variable.
//
// Desktop unchanged (320) — see this constant's own derivation from
// before this session: the binding case is the shortest block ("Everything
// Else") in the tallest window, isolated with ~40px of margin.
//
// Tablet's own value, from the SAME derivation re-run at the tablet
// tier's own colW and FRAME_H_MAX above (not a scaled copy of desktop's).
// Real render, scripts/measure-sweep.mjs, every 90px step from 980 to
// 1439: "Everything Else" is the shortest block at every width sampled,
// bottoming out at 124px (wide end of the tier, ~1400-1439px, where the
// column is widest and the block wraps least). Binding case: windowH=460
// (this tier's own TEXT_WINDOW_H at FRAME_H_MAX), blockH=124 — isolation
// needs gap >= (460-124)/2 = 168px. 200px clears it with 32px (~19%)
// margin, matching desktop's own ~14-19% margin ratio rather than an
// independently chosen number.
const BLOCK_GAP: Record<"tablet" | "desktop", number> = {
  tablet: 200,
  desktop: 320,
};

// --- Section-count pill, per tier -----------------------------------------
//
// Desktop's is a clamped fixed 32px tall (PILL_PAD_X 16, gap to photo 20 —
// --spacing-md). Tablet's (1076:10221) is genuinely smaller type
// (--text-mono-mobile, 14px) with its own content-derived height (18px
// line box + 2*8px padding = 34px — taller than desktop's despite the
// smaller type) and a tighter 12px gap to the photo (--spacing-sm).
const PILL_H: Record<"tablet" | "desktop", number> = { tablet: 34, desktop: 32 };
const PILL_GAP: Record<"tablet" | "desktop", number> = { tablet: 12, desktop: 20 };
export const PILL_PAD_X = 16; // same at both tiers (523:7254, 1076:10221)

// Caption + the gap between photo and caption — unchanged across tablet
// and desktop (--text-mono-caption 16px both tiers; --spacing-md gap both
// tiers, confirmed via get_design_context on both nodes this session).
const CAPTION_H = 21; // --text-mono-caption's own line box
const PHOTO_CAPTION_GAP = 20; // --spacing-md

// Gap held between the frame's bottom edge and the viewport's bottom edge
// for the whole pinned range — unchanged across tiers (mirrors
// --spacing-lg, same as before this session).
export const BOTTOM_GAP = 30;

// --- MIN_VIEWPORT_H: the svh floor below which the pin can't fit ---------
//
// Session before this one used a single PHOTO_MIN_H judgment call (300px —
// "below this a photo reads as letterboxed") added into a flat formula,
// and let the photo SHRINK below its natural 448px to satisfy it — the old
// photoHeightCss was a min() chain, not a fixed value, and at the 1440x760
// reference viewport it actually rendered the photo at 331px tall, not
// 448. That flex is what let the pin keep running that low.
//
// That no longer applies: with the photo's height now aspect-ratio-derived
// from its own column width (Alice's own call — 50/50 columns, photo
// height from aspect-ratio, not an independent pixel value), the photo can
// no longer shrink vertically without ALSO shrinking horizontally, which
// would break the 50/50 split with the text column. So its REQUIRED
// height at a given viewport WIDTH is now a fixed, computable quantity —
// this function asks "given the photo this viewport's WIDTH forces us to
// render, how much viewport HEIGHT does fitting it, the pill, the gaps,
// the frame padding, and the nav clearance actually need."
//
// Real, flagged consequence: this raises desktop's own threshold from the
// previous flat 729 to ~880 (verified: scripts/measure-min-viewport.mjs).
// The 1440x760 reference viewport (13" Air) now renders AboutFallback
// instead of the pin — it did not before this session. This is not a
// silent regression: AboutFallback is a real, Figma-sourced layout with
// no clipping or overflow at that viewport (verified,
// scripts/measure-overflow.mjs) — rule 11's actual requirement ("without
// overflow or clipping") still holds, just via a different one of the two
// mechanisms this page has always had. Flagged for Alice's own review
// rather than silently accepted or silently worked around (e.g. by
// letting the photo shrink independently of its column width, which would
// violate the 50/50 instruction this consequence follows from).
// --- Phone tier: the stacked pair's own text width ------------------------
//
// Mobile static stack session. The phone mock (1064:9880, "text with
// photo" 1064:9882) draws the photo at the full 330px pair column but the
// text block narrower, 267px — a real, deliberate difference (Alice: "the
// pair fills the 350px content box... keep the text/photo width
// difference, which reads as deliberate in the render"), not drift to
// normalize away. 267/330 is exact (both Figma-measured widths, not
// approximations), so kept as a fraction rather than a rounded ratio.
// Photo/caption still get the FULL row width (geo.ROW_W, via
// PhotoCaption's own `width` prop) — only the text column narrows.
const PHONE_TEXT_WIDTH_RATIO = 267 / 330;

function minViewportH(width: number, tier: "tablet" | "desktop"): number {
  const colW = columnWidth(width, tier);
  const photoH = (colW * PHOTO_ASPECT_H) / PHOTO_ASPECT_W;
  return (
    photoH +
    CAPTION_H +
    PHOTO_CAPTION_GAP +
    PILL_H[tier] +
    PILL_GAP[tier] +
    2 * FRAME_PAD_Y[tier] +
    NAV_CLEARANCE +
    NAV_FRAME_GAP +
    BOTTOM_GAP
  );
}

// --- The one function everything above is built from ----------------------

export type AboutGeometry = {
  width: number;
  svh: number;
  tier: AboutTier;

  FRAME_PAD_X: number;
  FRAME_PAD_Y: number;
  ROW_W: number; // the frame's own content width (inside its padding)

  // Side-by-side tiers only (tablet, desktop). 0 at phone — the stacked
  // layout uses ROW_W directly (full width, text above photo) and has no
  // meaning for a column split.
  COLUMN_GAP: number;
  COLUMN_W: number;

  // Phone only — the stacked row's own narrower text width (see
  // PHONE_TEXT_WIDTH_RATIO above). 0 at tablet/desktop, where the text
  // column is COLUMN_W instead.
  PHONE_TEXT_W: number;

  // Pin-only fields — meaningless at phone (no pin there). 0/NaN-safe
  // zeros rather than undefined so callers that only ever render these at
  // tablet/desktop tiers (TextColumn, PhotoColumn, useAboutPin) don't need
  // an extra optional-chaining layer.
  FRAME_H_MAX: number;
  FRAME_H: number;
  TEXT_WINDOW_H: number;
  BLOCK_GAP: number;
  PIN_SCROLL_ESTIMATE: number;
  PILL_H: number;
  PILL_GAP: number;

  MIN_VIEWPORT_H: number;
};

export function geometryFor(width: number, svh: number): AboutGeometry {
  const tier = tierFor(width);
  const padX = FRAME_PAD_X[tier];
  const padY = FRAME_PAD_Y[tier];
  const rowW = rowWidth(width, tier);

  if (tier === "phone") {
    return {
      width,
      svh,
      tier,
      FRAME_PAD_X: padX,
      FRAME_PAD_Y: padY,
      ROW_W: rowW,
      COLUMN_GAP: 0,
      COLUMN_W: rowW,
      PHONE_TEXT_W: rowW * PHONE_TEXT_WIDTH_RATIO,
      FRAME_H_MAX: 0,
      FRAME_H: 0,
      TEXT_WINDOW_H: 0,
      BLOCK_GAP: 0,
      PIN_SCROLL_ESTIMATE: 0,
      PILL_H: 0,
      PILL_GAP: 0,
      // Phone never gates on this (no pin to fall back from) — 0 so any
      // accidental comparison can't spuriously trigger a fallback.
      MIN_VIEWPORT_H: 0,
    };
  }

  const frameHMax = FRAME_H_MAX[tier];
  const frameH = Math.min(frameHMax, svh - NAV_CLEARANCE - NAV_FRAME_GAP - BOTTOM_GAP);

  return {
    width,
    svh,
    tier,
    FRAME_PAD_X: padX,
    FRAME_PAD_Y: padY,
    ROW_W: rowW,
    COLUMN_GAP: columnGap(tier),
    COLUMN_W: columnWidth(width, tier),
    PHONE_TEXT_W: 0,
    FRAME_H_MAX: frameHMax,
    FRAME_H: frameH,
    TEXT_WINDOW_H: frameH - 2 * padY,
    BLOCK_GAP: BLOCK_GAP[tier],
    PIN_SCROLL_ESTIMATE: PIN_SCROLL_ESTIMATE[tier],
    PILL_H: PILL_H[tier],
    PILL_GAP: PILL_GAP[tier],
    MIN_VIEWPORT_H: minViewportH(width, tier),
  };
}

// --- Session before this one: continuous nearest-block mapping -----------
//
// Unchanged by this session — still a pure function of the current
// (clamped) pin scroll and each block's own measured target, so it works
// identically at any tier's own BLOCK_GAP/window height.
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

// --- Text column's own minimum width, at desktop's own 24px type ---------
//
// Kept for documentation and for globals.css's --breakpoint-about comment
// to reference — no longer consumed directly by any component (the 50/50
// split replaces the old clamp-based textColumnWidthCss this constant used
// to feed). See that breakpoint's own comment for the type-scaled value
// (400px at tablet's 20px body) this derives 980 from.
export const TEXT_COL_MIN_W = 480;
