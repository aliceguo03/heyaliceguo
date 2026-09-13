// Fixed pixel geometry for the case study template (736:6031), page "final",
// re-read this session — the same escape hatch home/projectGeometry.ts and
// StatusPill's DOT_SIZE already use for measures with no matching token.
// Applied via inline style, never an arbitrary Tailwind class (CLAUDE.md
// hard rule 2). Gaps and padding all map onto existing spacing tokens
// (space-md/xl/lg/3xl) and are used as Tailwind utilities directly, not
// duplicated here.

import { STICKY_TOP } from "@/components/chassis/navGeometry";

// info/panel shell (383x840 at x=100 — both the overview metadata panel,
// 736:6047, and the section sidebar, 736:6071). Fixed height, not
// content-driven: both variants pad their content to the same 840px so the
// panel behavior session's sticky shell doesn't change size as the active
// topic changes.
export const PANEL_W = 383;
export const PANEL_H = 840;

// Compact panel shell (839:3145 "type=info", 839:3144 "type=jump section",
// page "final") — the variant that keeps the panel sticky at viewports too
// short for the full 840px shell to fit under STICKY_TOP + PANEL_BOTTOM_GAP.
// Re-measured fresh this session: shell height shrinks to 600, and three
// type sizes step down to --text-mono-caption (16/21) inside it (nav header,
// meta label, meta value); everything else — padding, gaps, the pill, the
// vertical justify-between distribution — is identical to the full variant.
// See PanelMeta.tsx / PanelNav.tsx's own `compact` prop for exactly which
// classes swap.
export const PANEL_COMPACT_H = 600;

// Gap held between the panel's bottom edge and the viewport's bottom edge
// once it's sticky (mirrors --spacing-lg) — same role as aboutGeometry.ts's
// own BOTTOM_GAP, named separately here since the two aren't the same
// number by coincidence worth conflating.
export const PANEL_BOTTOM_GAP = 30;

// The viewport-height thresholds a sticky panel needs to fit *in full*, not
// just past some smaller structural floor — same "whole thing must fit"
// principle as projectGeometry.ts's MIN_VIEWPORT_H and aboutGeometry.ts's
// MIN_ABOUT_VIEWPORT_H. Below MIN_PANEL_VIEWPORT_H the full shell no longer
// fits and CasePanel.tsx switches to the compact shell; below
// MIN_PANEL_COMPACT_VIEWPORT_H the compact shell's own bottom clips (out of
// this project's supported viewport range — CLAUDE.md's 1440x760 floor sits
// 24px above it).
export const MIN_PANEL_VIEWPORT_H = STICKY_TOP + PANEL_H + PANEL_BOTTOM_GAP; // 976
export const MIN_PANEL_COMPACT_VIEWPORT_H = STICKY_TOP + PANEL_COMPACT_H + PANEL_BOTTOM_GAP; // 736

// The reading line: a section is "current" once its top has crossed this
// fraction of the viewport height (useCaseStudyPanel.ts). A judgment call,
// not a Figma measurement or a derived value — same exempt category as
// aboutGeometry.ts's HOLD_PX/PHOTO_MIN_H (interaction tuning, not a
// decorative duration or curve CLAUDE.md's hard rules govern). 40%, not
// center (50%): centering jitters at boundaries once sections are this
// unequal in height (3030px vs 470px in this case study alone) — a section
// boundary crossing the reading line once, near the top third of the
// screen, is a single unambiguous event regardless of how tall the
// sections on either side of it are.
export const READING_LINE = 0.4;

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

// Credits photo grid (Chase "photos", 801:2707/801:2716) — two columns at
// gap-md, cells 528.5x272.444 at the 1077px content column. Not the
// 1077:556 figure ratio (that would give 272.834): this is Figma's own
// 516:266 aspect, held as a ratio rather than a literal height so the grid
// still holds proportion if the content column ever clamps narrower
// (caseStudyGeometry.ts's own contentColumnWidthCss). Within 0.07px of the
// source photos' own 1057x545, so object-cover crops essentially nothing.
export const CREDITS_PHOTO_ASPECT = "516 / 266";

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

// --- Design Decisions carousel (760:6790) --------------------------------
//
// Re-read fresh this session, after a text->figure gap fix in Figma. Every
// internal gap in the node is now 20px/gap-md, identical to ProseFigure's
// own rhythm: 32 (heading) + 20 + 78 (body, item 0's own height) + 20 + 556
// (figure) + 20 + 8 (bars) = 734. The body height is specific to item 0's
// own copy — items 1 and 2 wrap to different line counts, and the column
// itself clamps narrower below 1710px — but CarouselStage.tsx's
// grid-stacked slots size themselves to whichever item is tallest at the
// current column width with zero measurement, so this constant is never
// used as a literal height on the component. It exists only to derive the
// viewport floor below, the same role FRAME_H/TILE_H play for
// MIN_VIEWPORT_H in projectGeometry.ts.
export const CAROUSEL_STAGE_H = 734;

// Same "the whole thing must fit in full" rule as MIN_VIEWPORT_H (home)
// and MIN_PANEL_VIEWPORT_H above. Below this, Carousel.tsx renders the P1
// stacked fallback instead of pinning. Approximate below the 1710px
// reference width (CAROUSEL_STAGE_H is that width's own measure, and the
// stage can run a little taller once the column clamps and bodies wrap to
// more lines) — flagged in the plan rather than solved with a second
// measurement pass, since deciding "is the stage too tall" would otherwise
// require the stage already rendered.
export const MIN_CAROUSEL_VIEWPORT_H = STICKY_TOP + CAROUSEL_STAGE_H + PANEL_BOTTOM_GAP; // 870

// --- GeminiCut video figures ----------------------------------------------
//
// Every other figure in the template is CONTENT_W x FIGURE_H (1077x556, a
// 1.937:1 ratio) because every source image was cropped to it. GeminiCut's
// two video figures are real screen recordings with their own native
// aspect ratios, measured directly off the files (`mdls`/Spotlight, not
// assumed) rather than cropped to fit — cropping either would cut into real
// UI (the recordings' own header bar / prompt input), which CLAUDE.md's
// "faithful implementation" rule treats as content, not chrome to trim.
// Each gets its own named height rather than reusing FIGURE_H; see
// content/case-studies/types.ts's VideoSource.height.

// The four "design decisions" carousel recordings (gemini-regenerate/
// -timeline/-style/-sound.mp4) are all 1888x1080. 1077 * (1080/1888) =
// 616.08, rounded to the nearest px.
export const CAROUSEL_VIDEO_H = 616;

// "Gemini Cut Commercial.mp4" is 1920x1080 — true 16:9, and NOT the same
// ratio as the carousel recordings above, so it does not share their
// constant. 1077 * (1080/1920) = 605.8, rounded.
export const SHOWCASE_VIDEO_H = 606;

// The four carousel recordings carry a thin capture-window border along
// their edges (screen-recording artifact, not real UI) — a slight zoom
// crops it out, same treatment and reasoning as home/ProjectMedia.tsx's own
// VIDEO_ZOOM for the same kind of artifact. The commercial shows no such
// border and is left unzoomed (content/case-studies/gemini.ts omits `zoom`
// for it).
export const CAROUSEL_VIDEO_ZOOM = 1.02;

// Design Decisions carousel, tabs mode (767:7270, CarouselTabs.tsx): the
// outer flex-col sits at gap-lg (30px, re-read fresh — NOT ProseFigure's
// 20px/gap-md rhythm every other block in this template uses). --spacing-lg
// already exists as a token, so this is a call-site note, not a new
// constant — CarouselTabs.tsx uses the `gap-lg` utility directly.

// Tabs carousel short-viewport fallback: real measured heights, not a guess
// — same discipline as PANEL_COMPACT_H/CAROUSEL_STAGE_H above. Captured with
// Playwright against the live page at 1440px viewport width, where the
// content column clamps to CONTENT_MIN_W (807px) — the narrowest width this
// project supports, so also the widest text-wrap (most lines) any of the
// four tab items ever reach. All four items measured identically at that
// width (each heading holds to a single line, each paragraph wraps to
// exactly 4 lines), so there's no per-item worst case to pick between:
//   47  (tab row, SelectTab's own px-md/py-sm + text-mono-caption box)
// + 30  (gap-lg, tab row -> text/figure group)
// + 32  (heading, Statement/text-body-large, 1 line)
// + 20  (gap-md)
// + 104 (paragraph, Prose/text-body, 4 lines at 26px line-height)
// + 20  (gap-md)
// + 616 (video well, CAROUSEL_VIDEO_H)
// = 869
export const CAROUSEL_TABS_STACK_H = 869;

// Below this viewport height, that stack no longer fits below the nav
// (STICKY_TOP) without scrolling — CarouselTabs.tsx drops the heading line
// (Statement) and keeps the tab row, paragraph, and video well, the same
// "measure, then degrade gracefully" shape as MIN_PANEL_VIEWPORT_H and
// MIN_CAROUSEL_VIEWPORT_H above. Deliberately scoped to just these four
// elements per the approved answer — this doesn't touch PANEL_W, the
// sidebar, or its own compact-panel threshold, which are addressed
// separately in content. Below the 1440x760 floor (760 < 975): the heading
// drops, same as this design's normal rendering on a 13" Air, not an edge
// case. At the 1710x1040 reference size (1040 > 975): unaffected, heading
// stays — confirmed against MIN_PANEL_VIEWPORT_H (976) too, which is a
// coincidentally close but entirely independent number for a different
// element (the sidebar's own full-vs-compact switch).
export const MIN_CAROUSEL_TABS_VIEWPORT_H = STICKY_TOP + CAROUSEL_TABS_STACK_H; // 975
