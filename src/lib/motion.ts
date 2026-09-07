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
