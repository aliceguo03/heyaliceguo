"use client";

import { motion } from "motion/react";
import { DUR, EASE, STAGGER, usePrefersReducedMotion } from "@/lib/motion";

// Adapted from the Magic UI FlipText reference per the third-party
// component protocol (CLAUDE.md). Four required fixes, all applied below:
//   1. No space-x-* — CHAR_CLASS carries no horizontal spacing, so letters
//      sit in natural flow and Gambarino's own kerning holds at 104px.
//   2. The word space survives the character split as an explicit
//      (splitChars) rather than collapsing as an empty span.
//   3. `perspective` sits on the parent (PERSPECTIVE_PX below) — without
//      it, rotateX reads as a vertical squash, not a flip.
//   4. Every letter span is aria-hidden. The accessible name is NOT set
//      here (a role-less <span> doesn't reliably expose aria-label to
//      assistive tech) — it belongs on the caller's own <h1>, which has a
//      role and honors it. See Wordmark.tsx / PageTitle.tsx.
//
// Two independently-centered layers, not index-aligned slots — this is
// what makes unequal-length titles ("alice guo." vs "about.") a
// non-problem:
//   - the DESTINATION layer sits in normal flow, sizing the box from frame
//     0, so the caller's centered title never resizes or drifts mid-flip.
//   - the SOURCE layer is absolutely positioned on the destination's own
//     center point and contributes no width.
//
// Each character rotates a full 180°, not 90°+opacity: source i goes
// 0 -> -180, destination i goes 180 -> 360, both over DUR.page + a
// per-letter stagger delay. At eased progress p, the source crosses its
// own backface (hidden past |−180p| > 90, i.e. p > 0.5) at the exact
// instant the destination clears its own backface (180+180p > 270, same
// p > 0.5) — exact complements, so there's never a frame where both or
// neither are visible. That's what keeps this correct under EASE's heavy
// eased-out shape without an opacity keyframe array or a `times` offset
// (either of which would be a second, undocumented timing value — rule 8).
const PERSPECTIVE_PX = 600;

// Screenshotted the actual render before trusting this (CLAUDE.md's own
// "measured, not assumed" standard): when the DEPARTING word is longer
// than the ARRIVING one (only "alice guo." (10) -> "about." (6) today),
// plain per-letter STAGGER on both layers means the shorter destination's
// stagger sweep finishes first while the longer source's tail characters
// are still mid-rotation — and since both layers share one center point,
// those stragglers visibly overlap the already-settled destination text.
// At a real 1710px render this reads as garbled ligature-like debris for
// roughly 400-500ms, not a deliberate cascading tail.
//
// The reverse direction ("about." -> "alice guo.") has no such problem:
// there the SHORTER word departs (vanishes quickly) while the LONGER one
// arrives via its own natural left-to-right cascade with nothing left to
// overlap — confirmed clean by the same screenshot pass, so this fix is
// deliberately asymmetric rather than a blanket "compress whichever is
// longer" rule, which would also compress (and needlessly rush) that
// already-good arrival.
//
// Fix: only the SOURCE layer's stagger is compressed, and only when it's
// the longer of the two, so its own stagger sweep finishes in the same
// span the destination's natural (unmodified) STAGGER sweep already takes.
// Still derived entirely from STAGGER — no new duration or curve (rule 8).
function staggerFor(sourceLen: number, destLen: number) {
  if (sourceLen <= destLen || sourceLen <= 1) return STAGGER;
  return (STAGGER * (destLen - 1)) / (sourceLen - 1);
}

const CHAR_CLASS = "inline-block align-top";

function splitChars(text: string) {
  return text.split("").map((char) => (char === " " ? " " : char));
}

export type FlipTextSource = { text: string; colorVar: string };

type FlipTextProps = {
  /** Destination text — what this page's title actually is. */
  text: string;
  /** Destination color token, e.g. "--color-ink". */
  colorVar: string;
  /**
   * The title flipped in FROM. null only for a hard load — renders `text`
   * as a plain, unsplit text node, with the caller's own color class
   * (already on its <h1>) supplying the color. Every other caller-resolved
   * case (see pageTransition.ts's flipSourceFor) is a real FlipTextSource,
   * including `{ text: "", colorVar: <this destination's own token> }` for
   * a client-side arrival from a route outside PAGE_TITLES — an empty
   * source needs no special case here: `splitChars("")` is `[]`, so the
   * source layer simply renders no characters and the destination flips in
   * from nothing. (Reduced motion is a separate gate, checked below via
   * `usePrefersReducedMotion` — it forces the same plain-text render
   * regardless of what `from` is, not by making `from` itself null.)
   */
  from: FlipTextSource | null;
};

export function FlipText({ text, colorVar, from }: FlipTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const active = from !== null && !reducedMotion;

  if (!active) {
    return <>{text}</>;
  }

  const destChars = splitChars(text);
  const sourceChars = splitChars(from.text);
  const sourceStagger = staggerFor(sourceChars.length, destChars.length);

  return (
    <motion.span
      // The color tween lives HERE, not on the caller's <h1> — color is
      // inherited downward only, so a script (or a future reader) checking
      // the h1's own computed color mid-flip would see the static class
      // color, never the animated value. data-flip-root is the stable hook
      // for reading the real, live-tweened color.
      data-flip-root
      className="relative inline-block"
      style={{ perspective: `${PERSPECTIVE_PX}px` }}
      initial={{ color: `var(${from.colorVar})` }}
      animate={{ color: `var(${colorVar})` }}
      transition={{ duration: DUR.page, ease: EASE }}
    >
      {/* Source layer — out of flow, centered on the destination's own
          center point. Never contributes width. data-flip-source is a
          stable hook for scripts/verify-page-transition.mjs — its presence
          in the DOM at all is itself the signal that a flip is active,
          since the static (from=null) branch above never renders it. */}
      <span
        data-flip-source
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap"
      >
        {sourceChars.map((char, index) => (
          <motion.span
            // Static, ordered list that never reorders or changes length —
            // index is a stable, correct key (same reasoning Wordmark.tsx
            // gives for its own identical letter list).
            key={index}
            aria-hidden
            className={CHAR_CLASS}
            style={{ backfaceVisibility: "hidden" }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -180 }}
            transition={{ duration: DUR.page, ease: EASE, delay: index * sourceStagger }}
          >
            {char}
          </motion.span>
        ))}
      </span>

      {/* Destination layer — in normal flow, sizes the box from frame 0. */}
      <span data-flip-dest aria-hidden>
        {destChars.map((char, index) => (
          <motion.span
            key={index}
            aria-hidden
            className={CHAR_CLASS}
            style={{ backfaceVisibility: "hidden" }}
            initial={{ rotateX: 180 }}
            animate={{ rotateX: 360 }}
            transition={{ duration: DUR.page, ease: EASE, delay: index * STAGGER }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
