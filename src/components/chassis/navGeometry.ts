// Nav's own footprint, lifted out of about/aboutGeometry.ts (session
// "case-study panel behaviour") so a second feature (the case study's sticky
// info panel) can share it instead of forking a second copy. One definition;
// About and the case study template both import from here.

// Nav's own rendered height (mirrors --spacing-nav-height). Verified
// structurally, not assumed: Nav.tsx is `sticky top-0 h-nav-height`, so it
// occupies exactly this many px of viewport at every scroll position.
export const NAV_CLEARANCE = 94;

// Breathing room between the nav and whatever pins directly beneath it —
// About's frame, and now the case study panel. Figma variable
// "padding/small" — confirmed via get_variable_defs on the nav instance
// (523:6647) rather than invented — the same value as --spacing-sm.
export const NAV_FRAME_GAP = 12;

// The sticky offset every nav-adjacent pin uses: clears the nav, then this
// gap on top of it.
export const STICKY_TOP = NAV_CLEARANCE + NAV_FRAME_GAP;

// Session R1.1 Part C. The mobile takeover panel (MobileNav.tsx) sits 10px
// under the hamburger, not NAV_FRAME_GAP's 12 — 988:7255/935:4742: panel
// top y=104, trigger y=30 + h=64 = 94. A separate constant on purpose:
// NAV_FRAME_GAP is shared with About's frame pin and the case-study info
// panel, both of which really do measure Figma's padding/small (12), so a
// 12->10 edit there would move two things that were never wrong.
export const MOBILE_PANEL_GAP = 10;
export const MOBILE_PANEL_TOP = NAV_CLEARANCE + MOBILE_PANEL_GAP; // 104
