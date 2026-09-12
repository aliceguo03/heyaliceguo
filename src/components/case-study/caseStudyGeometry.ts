// Fixed pixel geometry for the case study template (736:6031), page "final",
// re-read this session — the same escape hatch home/projectGeometry.ts and
// StatusPill's DOT_SIZE already use for measures with no matching token.
// Applied via inline style, never an arbitrary Tailwind class (CLAUDE.md
// hard rule 2). Gaps and padding all map onto existing spacing tokens
// (space-md/xl/lg/3xl) and are used as Tailwind utilities directly, not
// duplicated here.

// info/panel shell (383x840 at x=100 — both the overview metadata panel,
// 736:6047, and the section sidebar, 736:6071). Fixed height, not
// content-driven: both variants pad their content to the same 840px so a
// later session can pin this shell against the content column's own
// height without it changing size as the active topic changes.
export const PANEL_W = 383;
export const PANEL_H = 840;

// Content column width shared by the overview section and every
// case-study section (736:6063, 736:6072).
export const CONTENT_W = 1077;

// figure / proseFigure figure — always this size, everywhere, no
// per-project override (CLAUDE.md "figure and the figure inside
// proseFigure are always 1077x556").
export const FIGURE_H = 556;

// Hero card's three-photo strip (730:6000). Each photo is ~785px wide by
// 522 tall; the 1px differences between photos in Figma are rounding
// noise, not a real second measure, so one constant covers all three.
export const HERO_PHOTO_W = 785;
export const HERO_PHOTO_H = 522;

// Hero card's header text column (730:5994).
export const HERO_HEADER_W = 929;

// stats block column width (736:6108) — two 411px columns at gap-3xl
// (100px), left-packed in the 1077 content column rather than stretched
// full width (P1 plan "Flags" #7 — this deviates from the brief's "full
// 1077px," Figma's own measure was taken instead per the approved answer).
export const STAT_W = 411;

// --- The content column's 1440px floor -----------------------------------
//
// The row (InfoPanel + gap + content column) sums to exactly 1510px at the
// 1710px reference width — Figma's own split, held exactly via CONTENT_W
// above. Below that, the fixed 1077px column stops fitting: the same "kind
// of clamp()-based fix already used for the About page's two-column row"
// (aboutGeometry.ts's textColumnWidthCss) — one side of the row
// (PANEL_W/sidebar there, InfoPanel here) stays genuinely fixed, and the
// other absorbs the shrink down to a floor.
//
// SECTION_PAD_X and PANEL_CONTENT_GAP mirror px-3xl and gap-xl, the same
// Tailwind utilities OverviewSection.tsx and CaseStudy.tsx already use for
// this row — kept as their own named constants (not re-derived from a
// Tailwind class string) so the arithmetic below is checkable by eye,
// same discipline as aboutGeometry.ts's own NAV_CLEARANCE/BOTTOM_GAP.
export const SECTION_PAD_X = 100; // --spacing-3xl (px-3xl)
export const PANEL_CONTENT_GAP = 50; // --spacing-xl (gap-xl) — held fixed, not clamped

// This site's standing floor (CLAUDE.md hard rule 11: "the design must
// hold at 1440x760 (13" Air) without overflow or clipping"), not a new
// breakpoint — the clamp below simply resolves to exactly this floor
// value once the viewport reaches 1440px, same as About's own
// TEXT_COL_MIN_W does for its row at the same width. Nothing is asked to
// hold below 1440px (CLAUDE.md's deferred responsive pass owns that).
const CONTENT_FLOOR_VIEWPORT_W = 1440;

// The content column's width at exactly the 1440px floor: viewport minus
// the section's own horizontal padding, minus the fixed panel, minus the
// fixed gap. 1440 - 200 - 383 - 50 = 807.
export const CONTENT_MIN_W =
  CONTENT_FLOOR_VIEWPORT_W - 2 * SECTION_PAD_X - PANEL_W - PANEL_CONTENT_GAP;

// The content column's actual rendered width — CONTENT_W (Figma's 1077) at
// and above the 1710px reference width, shrinking fluidly with the
// viewport once the row can no longer hold that, floored at CONTENT_MIN_W
// (reached exactly at 1440px browser width and held flat below it, same
// "not a hard ceiling below the floor" behavior as textColumnWidthCss).
// `100%` resolves against the flex row's own content box — both
// OverviewSection.tsx and CaseStudy.tsx's row is `w-full` with no other
// width constraint, so that box is exactly the viewport minus
// 2*SECTION_PAD_X, the same box PANEL_CONTENT_GAP and PANEL_W are
// subtracted from here.
export const contentColumnWidthCss = `clamp(${CONTENT_MIN_W}px, calc(100% - ${PANEL_W}px - ${PANEL_CONTENT_GAP}px), ${CONTENT_W}px)`;
