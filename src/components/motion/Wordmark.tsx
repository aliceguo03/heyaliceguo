"use client"

import { motion } from "motion/react"
import { EASE, LOAD } from "@/lib/motion"
import { FlipText } from "./FlipText"
import { usePreviousRoute } from "./PageTransitionProvider"
import { PAGE_TITLES, isPageTitleRoute } from "./pageTransition"

// The hero wordmark: each letter rises into place while fading in, left→right,
// with heavy overlap between letters — see CLAUDE.md "Component specs" →
// Wordmark and "Hero load sequence". No rotation, no perspective, no
// shimmer — translateY + opacity only.
//
// Two DOM trees now, not one: the load-sequence path below (rise + fade,
// unchanged) and the page-transition flip (FlipText — rotateX, a different
// component entirely, see pageTransition.ts). They can never both apply to
// one mount: `from` below is non-null only on a client-side arrival from
// another PAGE_TITLES route, and useLoadSequence's own `play` is false
// whenever that's true (see its own comment), so a mount is either
// replaying the load sequence or flipping in, never both. The
// reduced-motion / already-played path within the load-sequence tree
// (play=false) still renders the exact same spans with initial===animate,
// so *that* half keeps the "one DOM tree" guarantee CLAUDE.md's "Reduced
// motion" section asks for — it just isn't the only tree anymore.
const WORDMARK_TEXT = "alice guo."

type WordmarkProps = {
  play: boolean
  loaded: boolean
}

export function Wordmark({ play, loaded }: WordmarkProps) {
  // Non-null only when the previous route is itself a PAGE_TITLES entry
  // (currently just "/about") — arriving from anywhere else (a hard load,
  // or a non-participating route like a case study) leaves this null and
  // FlipText renders WORDMARK_TEXT as a plain, unanimated text node.
  const previousRoute = usePreviousRoute()
  const from = previousRoute && isPageTitleRoute(previousRoute) ? PAGE_TITLES[previousRoute] : null

  if (from) {
    return (
      <h1
        id="page-top"
        tabIndex={-1}
        aria-label={WORDMARK_TEXT}
        data-loaded={loaded}
        className="text-display font-display text-center text-ink"
      >
        <FlipText text={WORDMARK_TEXT} colorVar={PAGE_TITLES["/"].colorVar} from={from} />
      </h1>
    )
  }

  return (
    <h1
      id="page-top"
      tabIndex={-1}
      aria-label={WORDMARK_TEXT}
      data-loaded={loaded}
      className="text-display font-display text-center text-ink"
    >
      {WORDMARK_TEXT.split("").map((char, index) => (
        <motion.span
          // Static, ordered list that never reorders or changes length —
          // index is a stable, correct key here.
          key={index}
          aria-hidden="true"
          data-load-letter
          // inline-block + no space-x-*: letters sit flush, kerning comes
          // from the font (FlipText fix #1). align-top keeps the line box
          // from growing off the baseline-aligned inline-block children —
          // this is about inline-block/baseline behavior in general, not
          // about which transform property animates, so it still applies
          // here even without a rotation.
          className="inline-block align-top"
          initial={play ? { opacity: 0, y: LOAD.letterRiseY } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: LOAD.letterDuration,
            ease: EASE,
            delay: play ? index * LOAD.letterStagger : 0,
          }}
        >
          {/* Non-breaking space ( ) so the word gap survives the
              character split instead of collapsing (FlipText fix #2) — a
              plain " " text node here is subject to HTML whitespace
              collapsing and can vanish. */}
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </h1>
  )
}
