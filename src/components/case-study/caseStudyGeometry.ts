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
