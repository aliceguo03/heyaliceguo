import { useSyncExternalStore } from "react"

export const EASE = [0.16, 1, 0.3, 1] as const

export const DUR = {
  hover: 0.2,
  reveal: 0.5,
  page: 0.8,
  // Lenis-driven scrollTo jumps (button-triggered scroll navigation) — both
  // Lenis's base wheel-smoothing config and individual scrollTo calls use
  // this, so a click reads as "weighted and settling" rather than a snap.
  // Distinct from page/reveal/hover, which are motion/react transitions.
  scroll: 1.2,
} as const

export const STAGGER = 0.07

// Hero load sequence (CLAUDE.md "Hero load sequence"). Each letter of
// "alice guo." (10 characters: 9 glyphs + the word space) rises into place
// while fading in, staggered left→right with heavy overlap — several
// letters mid-motion at once is what reads as a flowing wave rather than
// letters popping in one at a time. No rotation, no perspective, no
// shimmer: this is a soft ~1.4-1.5s target for the wordmark alone and ~2s
// for the whole hero, not a hard ceiling — everything else in the sequence
// (photo stack, bio lines, button) measures its offset in seconds from t=0
// via the *Start fields below, using EASE throughout.
export const LOAD = {
  letterStagger: 0.1,
  letterDuration: 0.5,
  letterRiseY: 24, // px, start offset below rest — top of the 16-24px reveal-travel ceiling
  photoStart: 1.2,
  bioStart: 1.4,
  bioStagger: 0.15,
  buttonStart: 1.85,
  fadeDuration: 0.3,
  fadeY: 16, // scroll reveals travel 16-24px, never more — same floor here
  total: 2.15, // last element (button) at rest; gates the fire-once flag
} as const

// motion/react's own useReducedMotion reads a ref that is `null` on the
// server and only set from matchMedia during the client's *hydration*
// render — before that render's useState can see it. Server renders the
// motion branch, client's first render renders the reduced branch: a
// hydration mismatch on any component that branches its output on the
// value (e.g. ScrollReveal). useSyncExternalStore's getServerSnapshot is
// used for both the SSR pass and the hydration render, so the two agree by
// construction; React reconciles to the live value right after hydrating.
// This also makes the preference reactive to a live OS toggle, unlike
// motion/react's version, matching SmoothScroll's own change listener.
function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Server and hydration both assume motion is on; corrected immediately
// after hydration once the client can read the real preference.
function getServerSnapshot() {
  return false
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Same useSyncExternalStore shape as usePrefersReducedMotion, and for the
// same reason: a component that renders a different tree depending on
// viewport height (ProjectSection.tsx, falling back to normal-flow cards
// below its fixed-tile mechanic's minimum) needs SSR and the hydration
// render to agree, or it hydration-mismatches. getServerSnapshot assumes
// the viewport is tall enough — the common case for this desktop-first
// site — and corrects immediately after hydration, same as reduced motion
// assumes "on" until proven otherwise.
function subscribeResize(callback: () => void) {
  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}

export function useViewportTooShort(minHeightPx: number) {
  return useSyncExternalStore(
    subscribeResize,
    () => window.innerHeight < minHeightPx,
    () => false,
  )
}

// Third instance of the same useSyncExternalStore shape as
// usePrefersReducedMotion and useViewportTooShort above — SSR and the
// hydration render must agree, or components branching on this
// hydration-mismatch. Shared by every desktop-only interaction (magnetic
// buttons, the custom cursor bubble); the photo stack deliberately does NOT
// consume this — it stays interactive on touch, see PhotoStack.tsx.
//
// getServerSnapshot assumes a fine pointer (`true`), the mirror of reduced
// motion assuming motion is "on" until proven otherwise: both guess the
// richer capability and correct down after hydration. Safe here because
// nothing that branches on this value affects layout — a magnet only
// attaches listeners and the cursor bubble is `position: fixed` — so a
// touch visitor's one-frame "fine pointer" guess never shows up as a
// hydration flash the way a layout-affecting branch would.
function subscribePointerFine(callback: () => void) {
  const media = window.matchMedia("(hover: hover) and (pointer: fine)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

export function usePointerFine() {
  return useSyncExternalStore(
    subscribePointerFine,
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => true,
  )
}

// Photo stack drag (PhotoStack.tsx, CLAUDE.md "Photo stack"). Gesture
// tuning, not a duration or easing curve, so it sits outside DUR/EASE rather
// than under the "no new easing curves or durations" rule, which governs
// those specifically. First-pass values — expected to be tuned once
// reviewed rendered, per this session's own working style.
export const DRAG = {
  // Fraction of the photo's own box width the pointer must travel left,
  // past release, to complete an advance — a fraction rather than a fixed
  // px figure so it scales if the box is ever re-measured from Figma.
  thresholdFraction: 0.28,
  // Below this many px of total travel, a pointer gesture is a click, not
  // a drag — see PhotoStack.tsx's click-suppression logic.
  slop: 5,
} as const

// The outgoing photo's "deal-left" exit path (PhotoStack.tsx, CLAUDE.md
// "Photo stack — outgoing photo's exit path"). A single data definition —
// swapping to a different path later is editing these numbers, not the
// component. See PhotoStack.tsx for why a literal pass-behind isn't
// achievable in this geometry (z-index can't tween, and the fanned slots
// overlap too much for any point on a rightward path to hide a flip), so
// every viable path hides the flip behind opacity instead. Path A (chosen):
// the photo continues left past its rest position while fading out, then
// reappears already in its hidden slot once fully transparent.
//
// Tuning fix, session 4 (visible-flash bug). Screenshotting the transition
// frame-by-frame (sampling computed style turned out to distort the very
// timing it was measuring — see PhotoLayer's own comment) caught a real
// paint frame where the outgoing photo was faintly but unmistakably
// visible. First attempt: assume opacity and the z-index flip were painting
// a frame apart despite both reading the same exitProgress value, and widen
// a hold straddling the flip to buy margin. Re-screenshotted: the flash was
// still there, just ~20ms later — proof the paint-skew theory was
// incomplete. The actual defect was upstream of z-index entirely: opacity
// was recovering [0,0.55,1] on the *same* schedule as position's own return
// trip from the extremum, so for the whole return trip the photo was
// genuinely visible (opacity > 0) while its geometry hadn't yet reached the
// coincident spot z-index occlusion depends on — nothing to hide it, at any
// z-index. `zSwapAt` was never wrong; the shared timeline was.
//
// The fix: opacity gets its OWN, later schedule than position
// (`opacityTimes`, below) — it reaches 0 at the same instant position
// reaches the extremum (times[1], "fades out while traveling left"), but
// stays at 0 until 0.85, not until 1. By p=0.85, position — per EASE's own
// shape, cubicBezier(EASE) sampled and confirmed, not assumed — has covered
// 99.4% of its 191.65px return trip (1.2px short), so opacity only starts
// recovering once position is, for any practical purpose, already home.
// There is no longer a window where the photo is visible and not yet where
// it needs to be, so z-index no longer needs to land at a precise instant —
// `zSwapAt` just needs to fall anywhere opacity is still provably 0.
export const PHOTO_EXIT = {
  exitX: -140, // px past rest, continuing the advancing (leftward) direction
  exitY: -18,
  exitRotate: -6, // degrees, continuing counter-clockwise
  exitScale: 0.94,
  // Position: reach the extremum at 0.55, return to rest by 1 — no hold
  // needed here, since hiding position was never the actual problem.
  times: [0, 0.55, 1] as const,
  // Opacity's own, later schedule — see this const's own comment above for
  // why it can't share `times`.
  opacityTimes: [0, 0.55, 0.85, 1] as const,
  // Anywhere in opacity's wide zero window (0.55–0.85) works now; picked
  // the middle for symmetry, not because precision matters here anymore.
  zSwapAt: 0.7,
} as const

// motion/react and the CSS --ease-standard var consume EASE directly as a
// cubic-bezier curve. Lenis's `easing` option instead expects a sampling
// function (t: 0..1) => progress: 0..1 — so this adapts the *same* EASE
// control points into that shape via Newton-Raphson, rather than giving
// Lenis a different curve. Not a new easing, just a different API shape for
// the one curve this project uses everywhere.
export function cubicBezier(points: readonly [number, number, number, number]) {
  const [x1, y1, x2, y2] = points

  function sampleCurveX(t: number) {
    const mt = 1 - t
    return 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t
  }

  function sampleCurveY(t: number) {
    const mt = 1 - t
    return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t
  }

  function sampleCurveDerivativeX(t: number) {
    const mt = 1 - t
    return 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2)
  }

  function solveCurveX(x: number) {
    let t = x
    for (let i = 0; i < 8; i++) {
      const derivative = sampleCurveDerivativeX(t)
      if (Math.abs(derivative) < 1e-6) break
      t -= (sampleCurveX(t) - x) / derivative
    }
    return t
  }

  return function easing(x: number) {
    if (x <= 0) return 0
    if (x >= 1) return 1
    return sampleCurveY(solveCurveX(x))
  }
}
