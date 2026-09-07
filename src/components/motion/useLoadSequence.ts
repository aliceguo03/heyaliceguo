"use client"

import { useEffect, useState } from "react"
import { LOAD, usePrefersReducedMotion } from "@/lib/motion"

// Fire-once, per CLAUDE.md "Fire-once behavior": a hard reload re-evaluates
// this module and replays; client-side navigation keeps the module alive and
// does not. No localStorage/sessionStorage — both are forbidden outright.
//
// This is a *module-scope* flag, which means it is also shared across server
// requests in a long-lived Node process. It must only ever be written from
// inside an effect (below), never during render — a render-time write would
// happen during SSR too, flipping this `true` for every subsequent visitor's
// server render and hydration-mismatching against their own fresh client
// module (which still sees `false`). Effects don't run on the server at all,
// so the server's copy of this flag never changes, and the client is the only
// place that ever sets it.
let hasPlayed = false

// The one orchestrated moment on the page (CLAUDE.md "Hero load sequence").
// Owns a single clock for the wordmark's letter-by-letter rise-and-fade and
// the staggered arrival of the rest of the hero, so Hero.tsx has one source
// of truth for "should this play" and "has the sequence settled" rather than
// each child re-deriving it.
export function useLoadSequence() {
  const reducedMotion = usePrefersReducedMotion()

  // hasPlayed itself is captured once, via the initializer — whether *this
  // mount* is even eligible to play never changes over its lifetime, and
  // freezing it avoids re-reading a module-level mutable outside an effect.
  // reducedMotion is intentionally NOT captured the same way: it reads false
  // for both the SSR pass and the hydration render by design (see its own
  // comment in lib/motion.ts) and corrects on the render right after —
  // freezing `play` off that first, guaranteed-provisional value into a
  // useState initializer would lock in "play" for a reduced-motion viewer
  // forever, since nothing would ever re-run the initializer. `play` is
  // recomputed every render instead, so the correction actually reaches it.
  const [hasPlayedAtMount] = useState(() => hasPlayed)
  const play = !hasPlayedAtMount && !reducedMotion

  // Only ever flipped from inside a real setTimeout callback below — never
  // synchronously from the effect body itself. `loaded` (returned below)
  // folds `play` in at the point of use instead of being written by the
  // effect when `play` is false: that's genuinely derived state
  // (react-hooks' set-state-in-effect rule flags calling setState
  // synchronously inside an effect for exactly this shape of case), and it's
  // also what makes the reducedMotion hydration correction reach the DOM in
  // the same render that computes the new `play`, rather than waiting one
  // extra render for an effect to catch up.
  const [sequenceDone, setSequenceDone] = useState(false)

  // Keyed on `play`, not mount-only: when reducedMotion's hydration
  // correction (or a live OS toggle) flips play from true to false after
  // this effect already scheduled the timer under the provisional true
  // value, the cleanup below cancels it before it can fire.
  useEffect(() => {
    if (!play) return

    const doneTimer = window.setTimeout(() => {
      setSequenceDone(true)
      hasPlayed = true
    }, LOAD.total * 1000)

    return () => {
      window.clearTimeout(doneTimer)
    }
  }, [play])

  return {
    play,
    // Not playing (never eligible, or corrected to ineligible) means
    // already at rest — no need to wait on the timer that only exists for
    // the playing case.
    loaded: !play || sequenceDone,
  }
}
