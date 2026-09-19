"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import type Lenis from "lenis";
import { PROGRAMMATIC_SCROLL_USER_DATA, useLenisRef } from "@/components/chassis/SmoothScroll";
import { READING_LINE } from "@/components/case-study/caseStudyGeometry";
import { nearestBlockIndex } from "./aboutGeometry";

// The mobile stacked layout's reading-line spotlight — adapted from
// useCaseStudyPanel.ts, whose own shape this borrows wholesale: a
// continuously-recomputed nearest-to-a-line index, committed as plain
// React state (not a MotionValue) because nothing downstream needs to
// read it continuously, only at a crossing.
//
// Two deliberate differences from that hook:
// - The index is NEAREST-CENTER (aboutGeometry.ts's nearestBlockIndex —
//   already built for exactly this, reused rather than re-implemented),
//   not "last top above the line." Case-study sections vary wildly in
//   height (3030px vs 470px in one case study alone), where "last top
//   above the line" reads as one unambiguous crossing regardless of a
//   neighbor's height; About's six pairs are comparable in height, where
//   nearest-center is what makes both scroll directions resolve
//   identically re-entering any point (the exact property
//   nearestBlockIndex's own ascending-midpoint search already gives the
//   pinned view for free).
// - No -1 "show metadata" state — About's spotlight has no metadata view
//   to fall back to. Index 0 is the initial value, matching TextBlock's
//   own `filled = true` default and useAboutPin.ts's currentIndex seed.
//
// `commit` (below) is hoisted into one function shared by the measurement
// effect and the scroll handler, rather than duplicated between them —
// useCaseStudyPanel.ts itself carries that duplication verbatim in both
// places (see its own header comment); this file doesn't repeat it.
//
// `disabled` mirrors useAboutPin.ts's own shape exactly: always called
// unconditionally (rules of hooks), a no-op internally — no
// ResizeObserver, no scroll listener — whenever the caller doesn't need
// the result (reduced motion, or any tier other than phone).
export function useAboutSpotlight(contentRef: RefObject<HTMLElement | null>, disabled: boolean) {
  const lenisRef = useLenisRef();

  // Each pair's own vertical CENTER, in absolute document pixels — not
  // top: nearestBlockIndex needs each target's own center to find the
  // nearest one, unlike useCaseStudyPanel.ts's "last top above the line"
  // search, which only ever needs tops.
  const centersRef = useRef<number[]>([]);
  const [current, setCurrent] = useState(0);

  const commit = useCallback((scrollY: number) => {
    const centers = centersRef.current;
    if (centers.length === 0) return;
    const line = scrollY + window.innerHeight * READING_LINE;
    const index = nearestBlockIndex(line, centers);
    setCurrent((prev) => (prev === index ? prev : index));
  }, []);

  useLayoutEffect(() => {
    if (disabled) return;

    const content = contentRef.current;
    if (!content) return;

    function measure() {
      const el = contentRef.current;
      if (!el) return;
      const pairs = Array.from(el.querySelectorAll<HTMLElement>("[data-about-pair]"));
      centersRef.current = pairs.map((pair) => {
        const rect = pair.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
      });
      // Commit at measure time too, not only on the next scroll event —
      // same reasoning as useCaseStudyPanel.ts's own measure(): a page
      // load that lands already scrolled (e.g. a reload mid-page) can
      // have the target pair already under the reading line with no
      // scroll event ever firing afterward.
      commit(window.scrollY);
    }

    measure();

    // Same ResizeObserver pairing useCaseStudyPanel.ts and useAboutPin.ts
    // both use: the content column itself (a width reflow moves every
    // pair's offset) and <html> (a font swap changes wrapped line counts
    // and therefore every pair's height).
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contentRef, commit, disabled]);

  const { scrollY } = useScroll();
  // Captured at the moment of each Lenis 'scroll' event, not re-read from
  // lenis.userData when this handler fires — copied verbatim from
  // useCaseStudyPanel.ts's own guard: Lenis clears userData back to {}
  // synchronously right after a scroll's own final event.
  const programmaticRef = useRef(false);

  useLayoutEffect(() => {
    if (disabled) return;

    const lenis = lenisRef.current;
    if (!lenis) return;

    function onScroll(instance: Lenis) {
      programmaticRef.current =
        (instance.userData as { source?: string } | undefined)?.source ===
        PROGRAMMATIC_SCROLL_USER_DATA.source;
    }

    const unsubscribe = lenis.on("scroll", onScroll);
    return unsubscribe;
  }, [lenisRef, disabled]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (disabled) return;
    // Guard: this scroll was app-initiated (e.g. the footer's BACK TO TOP,
    // which can animate a scroll straight through About's own content).
    // Reacting here would flicker the spotlight through every pair the
    // jump sweeps past on its way to the target.
    if (programmaticRef.current) return;
    commit(latest);
  });

  return current;
}
