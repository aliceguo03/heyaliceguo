"use client"

import { motion } from "motion/react"
import { EASE, LOAD } from "@/lib/motion"

// The hero wordmark: each letter rises into place while fading in, left→right,
// with heavy overlap between letters — see CLAUDE.md "Component specs" →
// Wordmark and "Hero load sequence". No rotation, no perspective, no
// shimmer — translateY + opacity only.
//
// One component, one DOM tree — the reduced-motion / already-played path
// (play=false) renders the exact same spans with initial===animate, so
// there's no second copy of this markup to keep in sync (CLAUDE.md "Reduced
// motion": "This must not require a second copy of the wordmark markup").
const WORDMARK_TEXT = "alice guo."

type WordmarkProps = {
  play: boolean
  loaded: boolean
}

export function Wordmark({ play, loaded }: WordmarkProps) {
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
