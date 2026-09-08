"use client";

import type { ReactNode } from "react";
import { DUR, usePrefersReducedMotion } from "@/lib/motion";

// The About page's paragraph reveal (session 5C — CLAUDE.md's session-5c
// plan, Part A). Inspired by React Bits' ScrollReveal in name only: that
// component is GSAP + ScrollTrigger animating per-word rotation, opacity,
// and blur, all three of which this session bans outright, and it depends
// on a library CLAUDE.md's hard rule 5 forbids. Nothing from it survives
// the third-party normalization protocol (see the plan's Part A) — this is
// a from-scratch component that shares only the idea "text state advances
// with scroll progress."
//
// Color only, ever: pre-fill gray (--color-dark-gray, #5C5C5C — distinct
// from the mono header's #8A8A8A, and 5.4-6.1:1 against the frame
// background, passing WCAG AA for 24px body text) to deep black
// (--color-deep-black). No rotation, no blur, no opacity, no transform, no
// scale. Whole paragraph fills as one unit — no per-word spans — per the
// two decisions locked before this session started.
//
// `filled` is a plain boolean, not a MotionValue: useAboutPin.ts already
// derives a single live currentIndex from its hold/travel schedule
// (session 5D — a spotlight, not a latch: only the currently-centered
// paragraph is filled, and this reverses cleanly as scroll direction
// reverses), so this component has nothing of its own to compute or
// subscribe to. Because the animated property is `color`, not a
// transform, this doesn't need motion/react at all — a className swap plus
// a CSS transition (built from DUR.reveal and --ease-standard, never
// inline literals) does the whole job with zero per-frame JS.
export function ColorReveal({
  filled,
  className,
  children,
}: {
  filled: boolean;
  className?: string;
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <p
      data-color-reveal
      className={`${className ?? ""} ${filled ? "text-deep-black" : "text-dark-gray"}`}
      style={
        reducedMotion
          ? undefined
          : {
              transitionProperty: "color",
              transitionDuration: `${DUR.reveal}s`,
              transitionTimingFunction: "var(--ease-standard)",
            }
      }
    >
      {children}
    </p>
  );
}
