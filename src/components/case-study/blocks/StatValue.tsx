"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { useRevealed } from "@/components/motion/ScrollReveal";
import { DUR, EASE, usePrefersReducedMotion } from "@/lib/motion";

// Splits "30+" into a numeral ("30") and a static suffix ("+") — a split
// Figma's own node doesn't have (736:6109 etc. are each one text node, one
// gradient fill across the whole string; see CaseStudySection.tsx's own
// comment). No match (a future non-numeric stat like "N/A") falls back to
// rendering the raw string, static, rather than throwing.
const NUMERAL = /^(\d[\d,]*)(.*)$/;

export function StatValue({ value }: { value: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const revealed = useRevealed();
  const match = value.match(NUMERAL);

  if (!match) {
    return <p className="text-gradient-project w-full text-stat font-sans font-black">{value}</p>;
  }

  const [, numeralText, suffix] = match;
  const target = Number(numeralText.replace(/,/g, ""));

  if (reducedMotion || Number.isNaN(target)) {
    return <p className="text-gradient-project w-full text-stat font-sans font-black">{value}</p>;
  }

  return (
    <p aria-hidden="true" className="text-gradient-project w-full text-stat font-sans font-black">
      {/* Single-cell grid, same col-start-1/row-start-1 stacking
          CarouselStage.tsx already uses for its slots — an invisible copy
          of the final numeral reserves the string's final width so the
          suffix never shifts as the digit count grows (e.g. 0 -> 30). */}
      <span className="inline-grid">
        <span className="invisible col-start-1 row-start-1">{numeralText}</span>
        <span className="col-start-1 row-start-1">
          <Counter target={target} play={revealed} />
        </span>
      </span>
      {suffix}
      <span className="sr-only">{value}</span>
    </p>
  );
}

// The animated numeral itself. A MotionValue driving textContent directly
// (motion/react's own DOM writer skips React's render for a `motion.span`
// child bound this way) rather than counting through React state — the
// same "zero further JS-triggered re-renders" shape ProjectSection.tsx's
// --strip-y and useCarouselScrub.ts's --carousel-progress already use for
// continuous values, applied here to a value in the DOM instead of a CSS
// custom property.
function Counter({ target, play }: { target: number; play: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const startedRef = useRef(false);

  useEffect(() => {
    if (!play || startedRef.current) return;
    startedRef.current = true;
    const controls = animate(count, target, { duration: DUR.statCount, ease: EASE });
    return () => controls.stop();
  }, [play, target, count]);

  return <motion.span aria-hidden="true">{rounded}</motion.span>;
}
