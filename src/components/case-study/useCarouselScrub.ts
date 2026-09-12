"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { STICKY_TOP } from "@/components/chassis/navGeometry";
import { CAROUSEL_ITEM_SCRUB } from "@/lib/motion";
import { CAROUSEL_STAGE_H } from "./caseStudyGeometry";

// Drives the Design Decisions carousel's pin (CLAUDE.md "Design Decisions
// carousel"). Same "one source, several consumers" shape as
// useCaseStudyPanel.ts's `current` and useAboutPin.ts's `currentIndex` —
// here the one source is `progress`, a continuous MotionValue the
// pagination bars read directly through --carousel-progress (CSS, zero
// further JS once written), while the committed `index` is a coalesced
// React value CarouselStage.tsx's heading/body/figure slots read to decide
// which layer is opacity:1.
//
// Modeled on useAboutPin.ts's scrollY-minus-a-measured-lock-line shape,
// not ProjectSection.tsx's useScroll({ target, offset }) form: that form
// bakes the pinned element's own height into the offset string at setup
// time, and the carousel stage's height is content-driven (each item's
// body copy wraps differently, and the content column itself clamps
// narrower below 1710px) — motion reads useScroll's options once, so a
// resize could silently desync a baked-in offset. A plain scrollY value
// minus a re-measurable lock line has no such coupling, and the About page
// already does exactly this for the same reason.
//
// The spacer's own height, not padding-bottom: an earlier version of this
// hook gave the spacer a fixed height plus `paddingBottom: totalScrub`,
// reasoning that a sticky child's stuck range extends through its
// containing block's padding box the same way ProjectSection.tsx's
// explicit-height container does. Verified in the browser (this session's
// own instruction, given a prior single-frame-artifact miss) rather than
// trusted: it doesn't — a sticky child inside a padding-only container
// released almost immediately, confirmed even on a blank, dependency-free
// page. An explicit `height` on the spacer (content height + totalScrub)
// is what ProjectSection.tsx/AboutSection.tsx already rely on and what
// actually holds, so the stage's own rendered height is measured
// (ResizeObserver, since it's content-driven) and the spacer's height is
// set from that measurement rather than from padding.
//
// Always called unconditionally (rules of hooks) — a no-op internally
// whenever `disabled` (reduced motion, or below MIN_CAROUSEL_VIEWPORT_H)
// is true and Carousel.tsx renders the P1 stacked fallback instead; same
// shape as useAboutPin.ts's own `disabled` param.
export function useCarouselScrub(itemCount: number, disabled: boolean) {
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Written on every measure, read only inside the `progress` transform's
  // closure below — a ref, not state, for the same reason
  // useAboutPin.ts's lockStartRef is one: re-rendering on every write
  // would defeat the point of driving position off a MotionValue.
  const lockStartRef = useRef(0);

  const totalScrub = itemCount * CAROUSEL_ITEM_SCRUB;

  // Seeded with the Figma reference height so the very first paint's
  // spacer is already close to correct, corrected once the real
  // measurement lands — the same "assume the common case, correct after
  // mount" shape usePrefersReducedMotion/useViewportTooShort use for their
  // own getServerSnapshot.
  const [stageHeight, setStageHeight] = useState(CAROUSEL_STAGE_H);

  useLayoutEffect(() => {
    if (disabled) return;

    const spacer = spacerRef.current;
    const stage = stageRef.current;
    if (!spacer || !stage) return;

    function measure() {
      const spacerEl = spacerRef.current;
      const stageEl = stageRef.current;
      if (!spacerEl || !stageEl) return;
      // The spacer's own top edge is a stable document-pixel line to
      // measure scrollY against — it doesn't move once the page has laid
      // out, the same "lock line" role sectionTop plays in
      // useAboutPin.ts. (Stable regardless of the spacer's own height:
      // that height only extends the box downward, from this same top.)
      const top = spacerEl.getBoundingClientRect().top + window.scrollY;
      lockStartRef.current = top - STICKY_TOP;

      // position: sticky never changes an element's own box dimensions,
      // only its position — offsetHeight reads the stage's real content
      // height whether or not it happens to be stuck at measurement time.
      setStageHeight((prev) => (prev === stageEl.offsetHeight ? prev : stageEl.offsetHeight));
    }

    measure();

    // ResizeObserver on the stage (its content-driven height is exactly
    // what the spacer's own height must track) and on <html> (a font swap
    // changes earlier content's wrapped line counts, which moves this
    // section's top without necessarily resizing the stage itself) — the
    // same two-observer pairing useCaseStudyPanel.ts's own measure() uses,
    // for the same two reasons. Window resize is a third, coarser net
    // over both.
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [disabled]);

  const { scrollY } = useScroll();
  // Runs 0 -> itemCount across the pin's whole scroll range, so each item
  // owns exactly one unit regardless of itemCount — works unchanged for 2
  // or 4 items, not just this case study's 3.
  const progress = useTransform(scrollY, (latest) => {
    if (itemCount === 0 || totalScrub === 0) return 0;
    const raw = ((latest - lockStartRef.current) / totalScrub) * itemCount;
    return Math.min(itemCount, Math.max(0, raw));
  });

  // The committed index — coalesced to React state only when it actually
  // changes, same discipline as ProjectSection.tsx's visMask and
  // useAboutPin.ts's currentIndex. Clamped to itemCount - 1 so the last
  // item stays active for the remainder of the pin once progress reaches
  // itemCount, rather than pointing past the array right at release.
  const [index, setIndex] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    const next = Math.min(itemCount - 1, Math.floor(p));
    setIndex((prev) => (prev === next ? prev : next));
  });

  return { spacerRef, stageRef, progress, index, spacerHeight: stageHeight + totalScrub };
}
