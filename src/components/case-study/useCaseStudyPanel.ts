"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import type Lenis from "lenis";
import {
  PROGRAMMATIC_SCROLL_USER_DATA,
  useLenisRef,
  useScrollAction,
} from "@/components/chassis/SmoothScroll";
import { READING_LINE, STACK_WINDOW } from "./caseStudyGeometry";

// The sidebar stacking transition's own continuous read of scroll position,
// centered on the same crossing `commitFromScroll`/the scroll handler below
// use to flip `current` from -1 to 0 — see STACK_WINDOW's own comment for
// why that centering matters. 0 before the window starts, 1 once it's
// cleared, linear in between; CasePanel.tsx maps this straight onto the nav
// layer's `y` transform. Returns 0 when there is no section 0 to measure
// against yet (a render before the layout effect's first `measure()` has
// run) rather than NaN from dividing by STACK_WINDOW against an undefined
// top.
function computeStackProgress(scrollY: number, innerHeight: number, tops: number[]) {
  if (tops.length === 0) return 0;
  const boundary = tops[0] - innerHeight * READING_LINE;
  const start = boundary - STACK_WINDOW / 2;
  const end = boundary + STACK_WINDOW / 2;
  return Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
}

// The one committed index driving the case study's sticky panel — the
// panel's content variant, the sidebar's active item, and nothing else
// (CLAUDE.md: section numbers in the content column stay static). Same
// "one source, many consumers" rule as ProjectSection.tsx's --strip-y and
// useAboutPin.ts's currentIndex. -1 means "show metadata"; 0..n-1 means
// "show the section nav with item n active."
//
// Unlike --strip-y (a scroll-linked *position*, driven every frame through
// a shared CSS custom property because clip-path needs continuous math),
// this is a discrete index that only ever changes at a crossing — a plain
// committed React value is the right tool, not a MotionValue nobody reads
// continuously.
//
// Sidebar stacking transition (session "fix pass, item 1"): the metadata->
// nav swap itself is now driven by a SECOND, continuous value —
// `stackProgress` below — read every frame by CasePanel.tsx's nav-layer `y`
// transform, exactly the "position, not index" case --strip-y describes
// above. `current` and `stackProgress` are deliberately two values, not one
// derived from the other: `current` still gates which section's nav is
// active and the reduced-motion instant swap, while `stackProgress` alone
// drives the slide. See computeStackProgress's own comment for how the two
// stay centered on the same crossing.
export function useCaseStudyPanel(
  contentRef: RefObject<HTMLElement | null>,
): { current: number; jumpTo: (index: number) => void; stackProgress: MotionValue<number> } {
  const lenisRef = useLenisRef();
  const scrollTo = useScrollAction();

  // Each section's top, in absolute document pixels — read off real
  // `[data-section]` rects via a ResizeObserver, never hardcoded, so this
  // works unchanged whether the case study has three sections or six.
  const topsRef = useRef<number[]>([]);
  const idsRef = useRef<string[]>([]);
  const [current, setCurrent] = useState(-1);
  // Continuous, unlike `current` — see computeStackProgress's own comment.
  // A MotionValue, not React state: CasePanel.tsx feeds it straight into a
  // `y` transform, and it's written every scroll frame (see the
  // useMotionValueEvent handler below) — routing that through setState
  // would re-render the whole panel every frame for a value only the nav
  // layer's own style ever reads.
  const stackProgress = useMotionValue(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    function measure() {
      const el = contentRef.current;
      if (!el) return;
      const sections = Array.from(el.querySelectorAll<HTMLElement>("[data-section]"));
      idsRef.current = sections.map((s) => s.dataset.section ?? "");
      topsRef.current = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
      // Commit at measure time too, not only on the next scroll event — a
      // deep link can land on this page with the target section already
      // under the reading line and no scroll event ever fires afterward.
      commitFromScroll(window.scrollY);
    }

    // committed here (not just in the scroll handler below) so measure()
    // above can call it directly on mount/resize.
    function commitFromScroll(scrollY: number) {
      stackProgress.set(computeStackProgress(scrollY, window.innerHeight, topsRef.current));

      const line = scrollY + window.innerHeight * READING_LINE;
      const tops = topsRef.current;
      let index = -1;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] <= line) index = i;
      }
      setCurrent((prev) => (prev === index ? prev : index));
    }

    measure();

    // ResizeObserver on the content column (a width reflow across
    // CONTENT_MIN_W's clamp moves every section's offset) and on
    // <html> (a font swap changes wrapped line counts and therefore every
    // section's height) — same pairing useAboutPin.ts's own measure()
    // observes for the same two reasons.
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // stackProgress is stable across renders (useMotionValue, like useRef) —
    // listed for exhaustive-deps, not because its identity ever changes
    // (same convention useMagnet.ts's own x/y follow).
  }, [contentRef, stackProgress]);

  const { scrollY } = useScroll();
  // Captured at the moment of each Lenis 'scroll' event, not re-read from
  // lenis.userData when this handler fires — Lenis clears userData back to
  // {} synchronously right after a scroll's own final event, same reasoning
  // as useProjectSnap.ts's own lastScrollWasProgrammatic.
  const programmaticRef = useRef(false);

  useLayoutEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    function onScroll(instance: Lenis) {
      programmaticRef.current =
        (instance.userData as { source?: string } | undefined)?.source ===
        PROGRAMMATIC_SCROLL_USER_DATA.source;
    }

    const unsubscribe = lenis.on("scroll", onScroll);
    return unsubscribe;
    // Re-subscribes whenever SmoothScroll destroys/recreates its Lenis
    // instance (a prefers-reduced-motion toggle) — lenisRef.current is a
    // ref, so this effect has to re-run on something else to notice that;
    // scrollY's identity is stable for the life of the page, so this only
    // fires once in practice, same as intended.
  }, [lenisRef]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // stackProgress is written unconditionally, ahead of the programmatic
    // guard below — unlike `current`, a continuous 0..1 value has no
    // intermediate sections to flicker through, so there's nothing for the
    // guard to protect it from. Freezing it during a jump-nav click or
    // BACK TO TOP would instead strand the nav layer mid-slide until the
    // user's next manual scroll, which is worse than just letting it track
    // the jump like any other scroll.
    stackProgress.set(computeStackProgress(latest, window.innerHeight, topsRef.current));

    // Guard: this scroll was app-initiated (a jump-nav click, BACK TO TOP,
    // or any other button). Reacting here would flicker `current` through
    // every section a jump sweeps past on its way to the target — the exact
    // useProjectSnap.ts guard, applied to a read instead of a write.
    if (programmaticRef.current) return;

    const line = latest + window.innerHeight * READING_LINE;
    const tops = topsRef.current;
    let index = -1;
    for (let i = 0; i < tops.length; i++) {
      if (tops[i] <= line) index = i;
    }
    setCurrent((prev) => (prev === index ? prev : index));
  });

  // Commits the target index immediately (no flicker through intermediate
  // sections while the scroll animates) and hands the actual scroll off to
  // the app's one shared scrollTo. No `offsetVar` here: each
  // CaseStudySection already carries `scroll-mt-nav-height`, which Lenis's
  // own scrollTo reads directly (and SmoothScroll.tsx's reduced-motion
  // fallback now mirrors) — passing an explicit offset on top of that would
  // double-count the nav clearance instead of applying it once.
  function jumpTo(index: number) {
    const id = idsRef.current[index];
    if (!id) return;
    setCurrent(index);
    scrollTo(`#${id}`);
  }

  return { current, jumpTo, stackProgress };
}
