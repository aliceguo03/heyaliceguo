"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { BOTTOM_GAP, HOLD_PX, pinSchedule } from "./aboutGeometry";

// Drives the About page's pin (session 5B — see CLAUDE.md's "session-5b"
// plan). Layout itself is CSS (aboutGeometry.ts's *Css exports) — this
// hook measures only what CSS can't know (the text content's own rendered
// height, which depends on font metrics, not viewport) and derives one
// MotionValue, `pinScroll`, that everything else (the text column's
// translateY here; the paragraph reveal and photo/counter snap) must read
// rather than compute its own copy of — the same one-source rule
// projectGeometry / ProjectSection.tsx applies to --strip-y.
//
// Session 5D, "center-locked reading rhythm," reworks this hook's schedule
// rather than forking it: the paragraph reveal and the photo/counter snap
// both still need "which block is current," but that's now piecewise
// (aboutGeometry.ts's pinSchedule) — six hold points, each block's own
// vertical CENTER within the window (which CSS can't know either — it
// depends on where text wraps, which depends on rendered Satoshi metrics
// at whatever width the text column has clamped to), connected by travel
// segments. Replaces 5C's single continuous progress + latched high-water
// mark entirely — see the plan's Part A for why "header reaches top" and
// the latch are both gone, not tuned.
//
// Always called unconditionally (rules of hooks), same shape as
// useProjectSnap: a no-op internally — the ResizeObserver and resize
// listener are never attached — whenever `disabled` (reduced motion, or
// below MIN_ABOUT_VIEWPORT_H) is true and AboutSection renders the
// fallback instead. useScroll/useTransform themselves are still called in
// that branch (same precedent as ProjectSection.tsx's stripY: rules of
// hooks require it, and they're inert since nothing reads pinScroll from
// the fallback tree).
export function useAboutPin(disabled: boolean) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // A ref, not state: written on every measure, read only inside the
  // pinScroll transform below — re-rendering on every write would defeat
  // the point of driving position off a MotionValue.
  const lockStartRef = useRef(0);
  // Each block's own held y (px, relative to the content column's own
  // untransformed top) — ascending, one per block. DOES need to be state:
  // it's read by textY's closure below, and that closure must see a fresh
  // value whenever a resize or font swap changes it — but this only
  // happens on ResizeObserver/resize events, not per scroll frame, so a
  // re-render here is cheap and correct rather than a performance concern.
  const [holds, setHolds] = useState<number[]>([]);

  // The single live index driving the paragraph reveal AND the
  // photo/counter snap — both read this directly, so "which block is
  // current" is computed exactly once per scroll frame (in the
  // pinScroll listener below) and never disagrees between the two. Session
  // 5D replaces 5C's latched filledCount / activeIndex pair entirely: no
  // high-water mark survives, this can move in both directions. Seeded at
  // 0 (block 01 filled and active) — before the first measure() lands,
  // `holds` is empty and the listener below leaves this untouched, so the
  // seed IS the pre-measurement and SSR render, with no flash once
  // measurement completes.
  const [currentIndex, setCurrentIndex] = useState(0);

  useLayoutEffect(() => {
    if (disabled) return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;

    function measure() {
      const windowEl = windowRef.current;
      const content = contentRef.current;
      if (!section || !wrapper || !windowEl || !content) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const frameH = wrapper.offsetHeight;
      // Measured off the DOM, not re-derived from frameH via the same
      // arithmetic textWindowCss uses — this is the actual, CSS-resolved
      // value (subject to browser rounding), so the schedule can never
      // disagree with what the window really renders at.
      const textWindowH = windowEl.offsetHeight;

      // Each block's own held y: normally its vertical CENTER within the
      // content column (top + height/2 - windowH/2), so it lands centered
      // in the text window at its hold — except a block taller than the
      // window itself (measured: block 02 is 462px in a 424px window at
      // 1440x760), which centering would clip at BOTH edges. That one
      // top-aligns instead (header at the window's top edge, all overflow
      // at the bottom) — its identity stays visible even though its last
      // line doesn't fit. Clamped to [previous hold, ∞) so the schedule is
      // monotonic even if font metrics ever produced a shorter gap than
      // the previous block's own height (not expected at these six blocks'
      // measured sizes, but the schedule's own correctness — one direction
      // of travel per segment — depends on it, not just this content).
      // Both rects come from the same (possibly translated) element tree,
      // so the translateY useAboutPin applies to `content` cancels out of
      // every subtraction below regardless of current scroll position —
      // this is a layout-position read, not a "where is it on screen right
      // now" read.
      const contentTop = content.getBoundingClientRect().top;
      const blocks = content.querySelectorAll<HTMLElement>("[data-about-block]");
      let prevHold = 0;
      const nextHolds = Array.from(blocks, (block) => {
        const rect = block.getBoundingClientRect();
        const top = rect.top - contentTop;
        const raw = rect.height > textWindowH ? top : top + rect.height / 2 - textWindowH / 2;
        const hold = Math.max(prevHold, Math.max(0, raw));
        prevHold = hold;
        return hold;
      });

      lockStartRef.current = sectionTop - (window.innerHeight - BOTTOM_GAP - frameH);
      // The schedule's total post-lock scroll: HOLD_PX for every one of
      // the six holds, plus the travel between them — which telescopes to
      // just the last hold's own y (each interior segment's length cancels
      // against the next). Written directly to the DOM (mirrors --strip-y's
      // own pattern in ProjectSection.tsx) rather than through React state
      // + inline style: this is a plain CSS custom property that
      // sectionHeightCss's calc() reads, and React's next render only ever
      // touches the `height` key in this element's style object — a custom
      // property set imperatively outside that object survives untouched.
      // Renamed from --about-text-travel (session 5D): what
      // sectionHeightCss needs is now the schedule's total scroll, not a
      // single travel distance — see that export's own comment.
      const nextScroll = nextHolds.length > 0 ? nextHolds.length * HOLD_PX + nextHolds[nextHolds.length - 1] : 0;
      section.style.setProperty("--about-pin-scroll", `${nextScroll}px`);
      setHolds((prev) =>
        prev.length === nextHolds.length && prev.every((v, i) => v === nextHolds[i]) ? prev : nextHolds,
      );
    }

    measure();

    // ResizeObserver, not a one-shot measurement: textContentH depends on
    // rendered Satoshi metrics, so a font swap (next/font's display:
    // 'swap') changes it after mount, same as a window resize would. A
    // width change (e.g. crossing into TEXT_COL_MIN_W's clamp) reflows the
    // column and moves every block's offset, which this same measure()
    // call picks up — no second observer needed for the offsets.
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    if (windowRef.current) observer.observe(windowRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [disabled]);

  const { scrollY } = useScroll();
  const pinScroll = useTransform(scrollY, (latest) => {
    if (holds.length === 0) return 0;
    // Total post-lock scroll the schedule spans — same telescoping sum
    // aboutGeometry.ts's --about-pin-scroll uses. Clamping here (rather
    // than leaving it unbounded) is what makes pinSchedule's own upper
    // branch (the last hold's dwell) safe to evaluate right up to the
    // sticky pin's release: scrollY can keep increasing past this point
    // (that's the rest of the page), but the schedule itself must not.
    const total = holds.length * HOLD_PX + holds[holds.length - 1];
    return Math.min(total, Math.max(0, latest - lockStartRef.current));
  });
  // Transform only — this MotionValue is what TextColumn's motion.div
  // binds its `y` style to. Never native scroll of an inner element, never
  // a layout change. Pure function of pinScroll + holds, so reverse-scroll
  // symmetry falls out for free: re-entering any point from either
  // direction resolves to the same y.
  const textY = useTransform(pinScroll, (s) => -pinSchedule(s, holds).y);

  // The one listener that derives "which block is current" from
  // pinScroll, feeding both the paragraph reveal and the photo/counter
  // snap — both read `currentIndex` directly, so this is computed exactly
  // once per scroll frame, not twice. Session 5D: no latch, no high-water
  // mark — index can move either direction. Guarded on `holds.length > 0`
  // (see currentIndex's own comment): before the first measure() lands,
  // this is a no-op and the seeded value (0) stands.
  useMotionValueEvent(pinScroll, "change", (s) => {
    if (holds.length === 0) return;
    const { index } = pinSchedule(s, holds);
    setCurrentIndex((prev) => (prev === index ? prev : index));
  });

  return {
    sectionRef,
    wrapperRef,
    windowRef,
    contentRef,
    textY,
    currentIndex,
  };
}
