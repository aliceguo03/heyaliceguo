"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Ref } from "react";
import { useRevealed } from "@/components/motion/ScrollReveal";
import { DUR, EASE, usePrefersReducedMotion } from "@/lib/motion";

// Splits "30+" into a numeral ("30") and a static suffix ("+") — a split
// Figma's own node doesn't have (736:6109 etc. are each one text node, one
// gradient fill across the whole string; see CaseStudySection.tsx's own
// comment). No match (a future non-numeric stat like "N/A") falls back to
// rendering the raw string, static, rather than throwing.
const NUMERAL = /^(\d[\d,]*)(.*)$/;

// Fix pass (round 2, item 5): --text-stat is a flat 100px at every tier
// (globals.css has no mobile/tablet step for it, unlike the site's other
// type scales), and digit count varies per stat *and* per project ("4" vs
// "14,000+") — a single CSS breakpoint tuned to the worst case across all
// four projects would either shrink short numerals that never needed it or
// still overflow the longest one. This measures each item's own full
// rendered width against its own column's real available width (Stats.tsx's
// grid track — 411/425 tablet+desktop, 298 phone, per project) and shrinks
// font-size only when that item's own text would actually overflow it —
// the same "measure real content, don't assume" discipline as F3Global's
// own stat column derivation (caseStudyGeometry.ts's STAT_W).
//
// `whitespace-nowrap` on the visible text is what turns "would wrap" into
// "would overflow, measurably" — wrapping onto a second line is exactly
// what this must never do at either tier, so preventing it structurally
// and then shrinking to fit is the whole mechanism. There's no separate
// tablet-vs-mobile branch: one measurement against whatever column width
// the current tier's own grid track resolves to covers both.
//
// The hidden measurer (`Measurer` below) is rendered as a child of the
// same <p>, but is never affected by the dynamic font-size this hook
// applies to that <p> — an element with its own `text-stat` class declares
// its own font-size rather than inheriting the ancestor's (a normal CSS
// rule on the element always wins over inheritance), so it keeps reporting
// the *unscaled* natural width to compare against, however far the visible
// text has already shrunk. `position:absolute` takes it out of flow
// entirely, so it never affects the <p>'s own `clientWidth` — the
// "available width" side of the same comparison. The base size to scale
// from is read off the measurer via `getComputedStyle` rather than
// hardcoded, so this stays correct if `--text-stat` itself ever changes.
//
// The <p> itself needs `relative overflow-hidden` for this to be inert,
// not just `position:absolute` on the measurer alone: without a
// positioned ancestor, `absolute` resolves against the initial containing
// block (the viewport), not the <p> — confirmed the hard way, as a real
// page-width overflow from the measurer's own *unscaled* "14,000+" (418px)
// leaking in at 393px wide before this was added. `relative` makes the <p>
// the measurer's containing block (so `left:0 top:0` anchors inside it,
// not the viewport); `overflow-hidden` then keeps that (frequently wider
// than the box) measurer from contributing to the page's own scrollable
// overflow at all. Harmless for the visible content, which is exactly what
// the shrink-to-fit above guarantees fits.
function useStatFontSize(fullText: string) {
  const boxRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;

    function recompute() {
      const available = box!.clientWidth;
      const natural = measure!.scrollWidth;
      const baseSizePx = parseFloat(getComputedStyle(measure!).fontSize);
      if (!available || !natural || !baseSizePx) return;
      const scale = Math.min(1, available / natural);
      const next = scale < 1 ? Math.floor(baseSizePx * scale) : null;
      setFontSizePx((prev) => (prev === next ? prev : next));
    }

    recompute();
    // ResizeObserver, not a one-shot measurement: the column's own
    // available width changes at every tablet<->mobile step and at every
    // width in between (Stats.tsx's grid track is fluid, not fixed), same
    // reasoning as useAboutPin.ts's own ResizeObserver on its text column.
    const observer = new ResizeObserver(recompute);
    observer.observe(box);
    return () => observer.disconnect();
  }, [fullText]);

  const style = fontSizePx ? { fontSize: `${fontSizePx}px`, lineHeight: `${fontSizePx}px` } : undefined;
  return { boxRef, measureRef, style };
}

// Hidden, unscaled reference `useStatFontSize` measures against — see that
// hook's own comment for why its own `text-stat` class (not inherited)
// keeps it stable regardless of the visible text's current shrink state.
function Measurer({ text, ref }: { text: string; ref: Ref<HTMLSpanElement> }) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap text-stat font-sans font-black"
    >
      {text}
    </span>
  );
}

export function StatValue({ value }: { value: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const revealed = useRevealed();
  const match = value.match(NUMERAL);
  // Called unconditionally, above every early return (Rules of Hooks) —
  // `value` is what's visibly rendered on every branch below, matched or
  // not, animated or not, so one hook call covers all three.
  const { boxRef, measureRef, style } = useStatFontSize(value);

  if (!match) {
    return (
      <p
        ref={boxRef}
        className="relative w-full overflow-hidden whitespace-nowrap text-gradient-project text-stat font-sans font-black"
        style={style}
      >
        {value}
        <Measurer ref={measureRef} text={value} />
      </p>
    );
  }

  const [, numeralText, suffix] = match;
  const target = Number(numeralText.replace(/,/g, ""));

  if (reducedMotion || Number.isNaN(target)) {
    return (
      <p
        ref={boxRef}
        className="relative w-full overflow-hidden whitespace-nowrap text-gradient-project text-stat font-sans font-black"
        style={style}
      >
        {value}
        <Measurer ref={measureRef} text={value} />
      </p>
    );
  }

  return (
    <p
      ref={boxRef}
      aria-hidden="true"
      className="relative w-full overflow-hidden whitespace-nowrap text-gradient-project text-stat font-sans font-black"
      style={style}
    >
      {/* Single-cell grid, same col-start-1/row-start-1 stacking
          CarouselStage.tsx already uses for its slots — an invisible copy
          of the final numeral reserves the string's final width so the
          suffix never shifts as the digit count grows (e.g. 0 -> 30).
          Inherits whatever font-size the <p> above currently has, so this
          reservation stays accurate at any shrink scale. */}
      <span className="inline-grid">
        <span className="invisible col-start-1 row-start-1">{numeralText}</span>
        <span className="col-start-1 row-start-1">
          <Counter target={target} play={revealed} />
        </span>
      </span>
      {suffix}
      <span className="sr-only">{value}</span>
      <Measurer ref={measureRef} text={value} />
    </p>
  );
}

// The animated numeral itself. A MotionValue driving textContent directly
// (motion/react's own DOM writer skips React's render for a `motion.span`
// child bound this way) rather than counting through React state — the
// same "zero further JS-triggered re-renders" shape ProjectSection.tsx's
// --strip-y and useCarouselScrub.ts's --carousel-progress already use for
// continuous values, applied here to a value in the DOM instead of a CSS
// custom property. Renders at whatever font-size its ancestor <p> current
// carries (inherited, no font-size of its own) — the shrink-to-fit above
// only ever touches that one property, never this animation.
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
