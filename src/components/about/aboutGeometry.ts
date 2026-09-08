// Frame-specific pixel geometry for the About page's gray frame (Figma
// "about", 523:6601) — not design tokens, so kept here as documented
// consts rather than in @theme, following the precedent set by
// Hero.tsx's own HERO_WIDTH/PHOTO_CELL consts and projectGeometry.ts.
// Re-measure from Figma rather than assuming these hold; see
// projectGeometry.ts's own comment for why that discipline matters.

// --- Base measurements, all read directly off 523:6601's subtree -------

export const FRAME_H = 940; // 523:6601
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

export const HERO_PHOTO = 256; // each hero photo, 523:6572
export const HERO_W = 868; // "hero" (523:6847), the title+photos column

// --- Derived: the left column's visible window --------------------------
//
// TEXT_WINDOW_H is arithmetic on the frame, not an independent
// measurement: the frame's own padding takes it top and bottom, and
// nothing else does. 940 - 2*100 = 740, matching 523:6602's own height
// exactly. Kept derived (not a literal) because from session 5B on FRAME_H
// becomes viewport-dependent — a hardcoded 740 would silently stop
// matching it.
export const TEXT_WINDOW_H = FRAME_H - 2 * FRAME_PAD_Y;

// --- PHOTO_WINDOW_H is NOT derived the same way — read this before "fixing" it ---
//
// The naive analogue — frame height minus its own padding, minus the pill
// and the gap below it — gives FRAME_H - 2*FRAME_PAD_Y - PILL_H - PILL_GAP
// = 940 - 200 - 32 - 20 = 688. Figma measures the photo scroll frame
// (523:6622) at 550, not 688.
//
// This is real, not a rounding artifact: the right column ("progress track
// + text", 523:6850) is 602px tall inside a 740px content box and sits
// items-start, so it simply ends 138px above the frame's padding box
// rather than filling it. That slack is why 5A's resting view shows photo
// 1 plus 61px of empty gap below its caption (§A3 of the 5A plan) instead
// of a second photo peeking in, the way the left column's 68px of overflow
// shows the top of block 3.
//
// So this is a measured constant, deliberately not expressed as
// arithmetic on FRAME_H/PILL_H/PILL_GAP — doing so would silently "fix"
// it back to 688 and stretch the photo window past what Figma shows.
export const PHOTO_WINDOW_H = 550; // 523:6622, measured — see comment above

// --- Note for session 5B: do not let the photo grow -----------------------
//
// Once FRAME_H (and therefore the derived TEXT_WINDOW_H) becomes
// viewport-dependent, the photo inside PhotoCaption must be
// `min(PHOTO_H, available)` — free to shrink on a short viewport, never to
// grow past PHOTO_H's 448px. A naive `flex-1` on the photo would stretch
// its aspect ratio on tall viewports, where the 138px of slack above
// already gives it headroom to spare. This is a max-height + object-cover
// constraint on the existing 448px asset, not an asset problem — the
// photos in public/about/ don't need re-exporting for it.
