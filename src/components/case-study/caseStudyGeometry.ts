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

// figure / proseFigure figure — always this ratio, everywhere, no
// per-project override (CLAUDE.md "figure and the figure inside
// proseFigure are always 1077x556"). Session R5 (responsive pass):
// converted from a flat FIGURE_H=556 px height to an aspect ratio. Every
// source still image in the template is pre-cropped to exactly this ratio
// (the JPGs measure 2154x1112 = 1077x556 at 2x — confirmed with `sips`,
// not assumed), so a fixed height was never faithful once the column
// itself started clamping narrower than 1077px (contentColumnWidthCss
// below, and the new sub-1440 tiers this session adds): object-cover was
// silently cropping real image content out of every figure below the
// 1710px reference width. aspect-ratio fixes that everywhere, including
// at the existing 1440px floor — approved as a visible desktop change
// (Figure.tsx's well goes 556px tall -> 417px tall at exactly 1440px
// width, matching the ratio exactly rather than over-cropping).
export const FIGURE_ASPECT = "1077 / 556";

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

// Blink's own stat column width (808:2790 etc.), re-read fresh and
// confirmed as a real difference from STAT_W, not the stale pre-correction
// value Chase's node once had (chase.ts's own header comment) — same
// gap-3xl (100px), just a wider 425px track. See types.ts's `stats.
// columnWidth` for how a content file opts into this instead of STAT_W.
export const STAT_W_WIDE = 425;

// Phone tier's own stat column width (1005:8095/1005:8073) — Session R5
// (case study responsive pass). A single centered column, not a scaled
// fraction of STAT_W/STAT_W_WIDE: Figma's phone mock measures 298px,
// which fits the 375px SE floor (375 - 2*20 page inset - some slack =
// 335px available) with room to spare. Unlike STAT_W_WIDE, this isn't a
// per-project override — Stats.tsx applies it below --breakpoint-tablet
// unconditionally, regardless of which `columnWidth` a project's own
// content passes for tablet+desktop.
export const STAT_W_PHONE = 298;

// --- Fix pass (item 2): the sub-1440 sidebar floor ------------------------
//
// Below 1440 the info-panel/sidebar shell (globals.css's --case-grid-cols)
// narrows proportionally with the content column instead of staying a flat
// 383px (PANEL_W) all the way to 744 — see that variable's own comment for
// the full reasoning. This is its floor: the narrowest the sidebar may get
// before its own content overflows.
//
// The binding case is the longest unbreakable token across all four case
// studies' metadata (PanelMeta.tsx's ROLE/TIMELINE/TYPE/TOOLS/TEAM values —
// content/projects.ts — a CSS word can't break mid-word without a hyphen
// point, and none of these have one). Measured directly (not counted by
// eye) in --text-mono (20px JetBrains Mono, the type size these rows render
// at from --breakpoint-tablet up — PanelMeta.tsx's `text-mono-mobile
// tablet:text-mono`):
//   "CROSS-FUNCTIONAL" (Chase, Blink)   211px  <- longest
//   "AI-ASSISTED"      (GeminiCut, F3)  145px
// 211 + 2 * 30 (p-lg, InfoPanel.tsx's own padding) = 271px is the hard
// overflow floor. PANEL_MIN_W leaves a small margin above it rather than
// sitting flush.
//
// Measured `min-content` panel widths corroborate this is generous, not
// tight: 207 (f3global) / 234 (chase) / 242 (geminicut) / 234 (blink).
//
// This floor sits above 40% of the row in the 744-800px band (40% of 744 is
// 257.6px, below the 271px overflow floor), so the sidebar runs slightly
// wider than the nominal 40% split at the very bottom of that range — the
// floor always wins over the percentage there. Out of scope to "fix"
// further: any narrower sidebar overflows PANEL_MIN_W's own binding case.
export const PANEL_MIN_W = 280;

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
//
// Fix pass (commit 8, found while verifying item 5): this formula wrote
// correctly the day it was authored — CaseStudy.tsx's row was a flex
// container back then, so `100%` really did mean "the row's own content
// box." Session R5 (50501f7) converted that row to a CSS grid
// (CaseStudyBody.tsx, --case-grid-cols) without moving this formula off
// the content DIV's own inline `width`. At >=1440 that div is a real grid
// item (not `display: contents` there — see CaseStudyBody.tsx), so its
// `width` now helps size the very `1fr` track it sits in: a circular
// percentage the browser can't resolve, so `calc()`'s middle branch
// collapsed and every desktop viewport silently landed on the clamp's
// floor, CONTENT_MIN_W (807px) — correct by coincidence at exactly 1440
// (807 IS the right answer there), visibly wrong everywhere above it
// (1710's reference width should render 1077, not 807).
//
// The fix moves this exact formula onto the grid TRACK itself
// (globals.css's `--case-grid-cols`, >=1440 branch) instead of the grid
// ITEM's width. A percentage inside a grid-template-columns track
// function resolves against the grid container's own (definite,
// non-circular) content box — the same quantity `100%` meant here before
// R5 — so the same arithmetic is circularity-free once it's the track's
// job instead of the item's. The content div no longer needs its own
// `width` at desktop at all: CSS Grid's default `justify-items: stretch`
// already fills a item to its track's size with no explicit width, which
// is what `desktop:flex` alone now relies on (see CaseStudyBody.tsx).
//
// This string is no longer imported anywhere (CaseStudyBody.tsx used to
// be its one consumer) — kept exported as the derivation record for the
// literal duplicated into globals.css, same "TS is the source, CSS
// duplicates the literal with a comment pointing back" convention
// --case-grid-cols's own PANEL_W literal already follows.
export const contentColumnWidthCss = `clamp(${CONTENT_MIN_W}px, calc(100% - ${PANEL_W}px - ${PANEL_CONTENT_GAP}px), ${CONTENT_W}px)`;

// --- Design Decisions carousel (760:6790) --------------------------------
//
// Re-read fresh this session, after a text->figure gap fix in Figma. Every
// internal gap in the node is now 20px/gap-md, identical to ProseFigure's
// own rhythm: 32 (heading) + 20 + 78 (body, item 0's own height) + 20 + 556
// (figure, FIGURE_ASPECT's height at the reference 1077px width) + 20 + 8
// (bars) = 734. The body height is specific to item 0's own copy — items 1
// and 2 wrap to different line counts, and the column itself clamps
// narrower below 1710px — but CarouselStage.tsx's
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

// --- Overview column width, sidebar+content row (item 5, round 1; retargeted
// round 2; rebuilt round 3; simplified round 4) -----------------------------
//
// Rounds 1-3 chased a fill-ratio target (text column height vs. the
// metadata sidebar's own height) with a flat pixel width and various
// alignment schemes — round 2's centering didn't hold up on review, and
// round 3's percentage-of-remaining-space attempt was scoped only to
// 744-1439px and rejected as too narrow once retargeted against that
// fill ratio. Round 4 drops the fill-ratio reasoning entirely per a direct
// design call: the text column should simply read as a deliberate,
// proportional column next to the sidebar — not tuned against the
// sidebar's own height at all. See OverviewContent.tsx's own `tablet:
// w-7/10` for the current mechanism: a plain width fraction of the
// content track (the space remaining after the sidebar + its gap), no CSS
// var or JS constant needed for a single unconditional value. Unlike
// rounds 1-3, this now holds from 744px all the way through desktop —
// there is no revert to Figma's full 1077px column at 1440+ this time;
// the same 70% figure applies wherever the sidebar+content row is active.

// --- GeminiCut video figures ----------------------------------------------
//
// Every other figure in the template is FIGURE_ASPECT (1077x556, a 1.937:1
// ratio) because every source image was cropped to it. GeminiCut's two
// video figures are real screen recordings with their own native aspect
// ratios, measured directly off the files (`mdls`/Spotlight, not assumed)
// rather than cropped to fit — cropping either would cut into real UI (the
// recordings' own header bar / prompt input), which CLAUDE.md's "faithful
// implementation" rule treats as content, not chrome to trim. Each gets its
// own named aspect ratio rather than reusing FIGURE_ASPECT; see
// content/case-studies/types.ts's VideoSource.aspect.
//
// Session R5: converted from a flat px height (CAROUSEL_VIDEO_H=616,
// SHOWCASE_VIDEO_H=606) to a ratio, same reasoning and same fix as
// FIGURE_ASPECT above — the posters are pre-cropped to these exact ratios
// (2154x1232 = 1077x616 at 2x for the carousel; 2154x1211 measures 606 at
// the 1077 column, within the same rounding this constant always carried).

// The four "design decisions" carousel recordings (gemini-regenerate/
// -timeline/-style/-sound.mp4). Three are 1888x1080; gemini-regenerate.mp4
// is actually 1884x1080 (re-measured this session, correcting the prior
// "all four are 1888x1080" note here — the 4px difference doesn't move the
// rounded well height, 616 either way, so one shared ratio still covers
// all four without a second constant).
export const CAROUSEL_VIDEO_ASPECT = "1888 / 1080";

// "Gemini Cut Commercial.mp4" is 1920x1080 — true 16:9, and NOT the same
// ratio as the carousel recordings above, so it does not share their
// constant.
export const SHOWCASE_VIDEO_ASPECT = "16 / 9";

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
// + 616 (video well, CAROUSEL_VIDEO_ASPECT's height at the 1077px reference
//        width — this stack height is itself only ever seeded/compared at
//        that width, so the ratio resolves to the same 616 the old flat
//        constant held)
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
