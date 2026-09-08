"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { BOTTOM_GAP, PAUSE_PX } from "./aboutGeometry";

// Drives the About page's pin (session 5B — see CLAUDE.md's "session-5b"
// plan). Layout itself is CSS (aboutGeometry.ts's *Css exports) — this
// hook measures only what CSS can't know (the text content's own rendered
// height, which depends on font metrics, not viewport) and derives one
// MotionValue, `aboutProgress`, that everything else (the text column's
// translateY here; session 5C's reveals and photo index) must read rather
// than compute its own copy of — the same one-source rule projectGeometry
// / ProjectSection.tsx applies to --strip-y.
//
// Session 5C extends this hook rather than forking it: the paragraph
// reveal and the photo/counter snap both need "which block is current,"
// derived from the same aboutProgress this hook already owns, plus each
// block's own vertical offset (which CSS can't know either — it depends on
// where text wraps, which depends on rendered Satoshi metrics at whatever
// width the text column has clamped to). See the plan's Part A for why the
// trigger ("the next header reaches the top of the frame") requires travel
// itself to be redefined as block 06's own offset, not contentH - windowH.
//
// Always called unconditionally (rules of hooks), same shape as
// useProjectSnap: a no-op internally — the ResizeObserver and resize
// listener are never attached — whenever `disabled` (reduced motion, or
// below MIN_ABOUT_VIEWPORT_H) is true and AboutSection renders the
// fallback instead. useScroll/useTransform themselves are still called in
// that branch (same precedent as ProjectSection.tsx's stripY: rules of
// hooks require it, and they're inert since nothing reads aboutProgress
// from the fallback tree).
export function useAboutPin(disabled: boolean) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // A ref, not state: written on every measure, read only inside the
  // aboutProgress transform below — re-rendering on every write would
  // defeat the point of driving position off a MotionValue.
  const lockStartRef = useRef(0);
  // travel DOES need to be state: it's read by textY's closure below, and
  // that closure must see a fresh value whenever a resize or font swap
  // changes it — but this only happens on ResizeObserver/resize events,
  // not per scroll frame, so a re-render here is cheap and correct rather
  // than a performance concern.
  const [travel, setTravel] = useState(0);
  // Each block's own offset (px, relative to the content column's own
  // untransformed top) — the per-block analogue of `travel`. Needed to
  // derive thresholds; a ref would work just as well since it's only read
  // inside the aboutProgress listener below, but state keeps it visible in
  // devtools and the cost is identical (fires alongside `travel`, not per
  // scroll frame).
  const [thresholds, setThresholds] = useState<number[]>([]);

  // Latched high-water mark for the paragraph reveal, and the freely
  // reversible index for the photo/counter snap — both derived from the
  // same thresholds array and the same aboutProgress listener below, so
  // "which block is current" is computed exactly once per scroll frame,
  // not twice. Seeded at 1 / 0 (block 01 filled, block 01 active) rather
  // than 0 / -1: before the first measure() lands, `thresholds` is empty
  // and the listener below leaves these untouched, so the seed IS the
  // pre-measurement and SSR render — block 01 black, 02-06 gray, at rest,
  // with no flash once measurement completes (see aboutProgress's own
  // comment on why thresholds must be non-empty before they're evaluated).
  const [filledCount, setFilledCount] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

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
      // value (subject to browser rounding), so the section's travel can
      // never disagree with what the window really renders at.
      const textWindowH = windowEl.offsetHeight;
      const textContentH = content.offsetHeight;

      // Per-block offsets: each [data-about-block] element's top, relative
      // to the content column's own top. Both rects come from the same
      // (possibly translated) element tree, so the translateY that
      // useAboutPin applies to `content` cancels out of the subtraction
      // regardless of current scroll position — this is a layout-position
      // read, not a "where is it on screen right now" read.
      const contentTop = content.getBoundingClientRect().top;
      const blocks = content.querySelectorAll<HTMLElement>("[data-about-block]");
      const offsets = Array.from(blocks, (block) => block.getBoundingClientRect().top - contentTop);

      // "Extend the runway" (plan Part A): travel is the last header's own
      // offset, not textContentH - textWindowH — so every header genuinely
      // reaches the window's top edge, which is what the photo/counter
      // snap's trigger requires. The old arithmetic survives only as a
      // defensive floor: it can't bind in the pinned range (the window is
      // always taller than the last block alone), but keeping it means the
      // invariant is checkable rather than silently assumed.
      const lastHeaderOffset = offsets.length > 0 ? offsets[offsets.length - 1] : 0;
      const nextTravel = Math.max(lastHeaderOffset, textContentH - textWindowH, 0);
      const nextThresholds = nextTravel > 0 ? offsets.map((offset) => offset / nextTravel) : offsets.map(() => 0);

      lockStartRef.current = sectionTop - (window.innerHeight - BOTTOM_GAP - frameH);
      // Written directly to the DOM (mirrors --strip-y's own pattern in
      // ProjectSection.tsx) rather than through React state + inline
      // style: this is a plain CSS custom property that sectionHeightCss's
      // calc() reads, and React's next render only ever touches the
      // `height` key in this element's style object — a custom property
      // set imperatively outside that object survives untouched. Renamed
      // from --about-text-content-h (session 5C): what sectionHeightCss
      // needs is now the travel distance itself, not the content's full
      // height — see that export's own comment.
      section.style.setProperty("--about-text-travel", `${nextTravel}px`);
      setTravel((prev) => (prev === nextTravel ? prev : nextTravel));
      setThresholds((prev) =>
        prev.length === nextThresholds.length && prev.every((v, i) => v === nextThresholds[i])
          ? prev
          : nextThresholds,
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
  const aboutProgress = useTransform(scrollY, (latest) => {
    if (travel <= 0) return 0;
    // PAUSE_PX dead zone: the first PAUSE_PX of scroll past lockStart holds
    // progress at 0 — the frame is already locked (that's lockStart's own
    // job, unaffected), only the text withholds its own motion a beat
    // longer. Pure function of scrollY, so reverse-scroll symmetry falls
    // out for free: re-entering this same stretch from either direction
    // clamps to 0 the same way, no latched state needed.
    const afterPause = latest - lockStartRef.current - PAUSE_PX;
    // Clamped to [0, 1] here, same as before session 5C — TAIL_DWELL_PX
    // (aboutGeometry.ts's sectionHeightCss) adds scroll room AFTER this
    // saturates at 1, so the sticky pin stays engaged with progress held
    // at exactly 1 for that stretch rather than this clamp needing to know
    // about the dwell at all.
    return Math.min(1, Math.max(0, afterPause / travel));
  });
  // Transform only — this MotionValue is what TextColumn's motion.div
  // binds its `y` style to. Never native scroll of an inner element, never
  // a layout change.
  const textY = useTransform(aboutProgress, (progress) => -progress * travel);

  // Session 5C: the one listener that derives "which block is current"
  // from aboutProgress, feeding both the paragraph reveal (filledCount,
  // latched) and the photo/counter snap (activeIndex, freely reversible).
  // Same pattern as ProjectSection.tsx:115's stripY listener — one
  // computation per change, committed to state only when it actually
  // differs. Guarded on `thresholds.length > 0` (see filledCount/
  // activeIndex's own comment): before the first measure() lands, this is
  // a no-op and the seeded values stand.
  useMotionValueEvent(aboutProgress, "change", (progress) => {
    if (thresholds.length === 0) return;
    const count = thresholds.reduce((n, threshold) => (progress >= threshold ? n + 1 : n), 0) || 1;
    setFilledCount((prev) => (count > prev ? count : prev));
    setActiveIndex((prev) => (count - 1 === prev ? prev : count - 1));
  });

  return {
    sectionRef,
    wrapperRef,
    windowRef,
    contentRef,
    aboutProgress,
    textY,
    filledCount,
    activeIndex,
  };
}
