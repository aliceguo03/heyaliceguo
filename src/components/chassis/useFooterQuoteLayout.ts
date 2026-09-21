"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { fitQuoteLines, type Measure } from "./footerQuoteFit";

// Mirrors --spacing-icon (globals.css) — the reload button's own size.
// Hardcoded rather than read live from the CSS custom property, same
// convention lib/motion.ts's BREAKPOINT_TABLET already uses for a value
// that has to match a CSS token: keep in sync by hand.
const BUTTON_WIDTH = 26;
// Mirrors --spacing-footer-quote-gap (globals.css) — the fixed gap fix #1
// locks every wrap case to, measured from the single-line case where the
// CSS flex gap and the actual button-to-glyph gap happened to coincide.
const MINIMUM_GAP = 16;

// A fresh hidden probe per computation, not a persistent module-scope one
// (contrast useProjectGeometry.ts's reused probe): this only runs on
// discrete triggers (a quote pick, a reroll, a resize's end) rather than
// continuously during a drag, so the cost of creating and removing one
// short-lived element each time is not worth the bookkeeping a shared,
// ref-counted probe would need.
function createMeasurer(): { measure: Measure; cleanup: () => void } {
  const el = document.createElement("span");
  // Same font-affecting classes as the rendered quote text (Footer.tsx) —
  // family, size, tracking. Color/alignment don't affect width and are
  // left off. Real DOM measurement, not a canvas + hand-rolled tracking
  // add-on: this automatically matches whatever the browser actually does
  // with kerning and the 0.06em letter-spacing, not an approximation of it.
  el.className = "text-mono font-mono";
  el.style.position = "fixed";
  el.style.visibility = "hidden";
  el.style.whiteSpace = "nowrap";
  el.style.left = "-9999px";
  el.style.top = "0";
  document.body.appendChild(el);
  return {
    measure(text) {
      el.textContent = text;
      return el.getBoundingClientRect().width;
    },
    cleanup() {
      el.remove();
    },
  };
}

// Computes and positions the footer quote's fitted lines (CLAUDE.md
// "Footer quote"). Three refs the caller attaches to real DOM nodes
// (`rowRef` on row 1, `clusterRef` on the "LET'S CIRCLE BACK" cluster,
// `quoteGroupRef` on the quote's own positioned wrapper) plus two the hook
// itself uses for output (`textRef` on the line container, `buttonRef` on
// the reload button) are all it needs — everything else is measured, not
// assumed, same as useAboutPin.ts's own real-block-height measurements.
//
// Two phases:
//   1. Measure how much width is actually available to the quote (row
//      width minus the cluster's own width) and refit the current quote
//      against it, in the SAME function — recomputed on mount, on a
//      width-affecting resize (ResizeObserver), AND on a quote change
//      (the effect's own `[quote]` dependency re-subscribes and re-runs
//      it). One function serving both an external subscription and a
//      dependency-driven re-run, not two separate effects, is deliberate:
//      React's own set-state-in-effect lint rule (rightly) flags a bare
//      `setState` call sitting directly in an effect body with no
//      external trigger as "you might not need an effect" — useAboutPin.ts
//      avoids the same flag the same way, folding its own recompute into
//      the function it ALSO hands to its ResizeObserver.
//   2. Once the DOM reflects those lines, measure line 1's OWN rendered
//      left edge and position the button exactly MINIMUM_GAP to its left —
//      written directly to the button's style (imperative, like
//      useAboutPin.ts's --about-pin-scroll custom property), not through
//      React state, since nothing else needs to re-render off this value.
export function useFooterQuoteLayout(quote: string) {
  const rowRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const quoteGroupRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // null only until the very first computation lands — never reset to null
  // again after that (recomputeLines below always calls setLines with a
  // real result), so a reroll or a resize swaps directly from the old
  // lines to the new ones with nothing in between for the user to see.
  const [lines, setLines] = useState<string[] | null>(null);

  // Phase 1: measure available width and refit — see this function's own
  // doc comment above for why both triggers share one function.
  useLayoutEffect(() => {
    const row = rowRef.current;
    const cluster = clusterRef.current;
    if (!row || !cluster) return;

    function recomputeLines() {
      const rowWidth = row!.getBoundingClientRect().width;
      const clusterWidth = cluster!.getBoundingClientRect().width;
      const availableWidth = Math.max(0, rowWidth - clusterWidth);

      const { measure, cleanup } = createMeasurer();
      const decorated = `“${quote}”`;
      const firstLineWidth = Math.max(0, availableWidth - BUTTON_WIDTH - MINIMUM_GAP);
      const next = fitQuoteLines(decorated, { firstLineWidth, fullLineWidth: availableWidth, measure });
      cleanup();

      setLines((prev) =>
        prev && prev.length === next.length && prev.every((line, i) => line === next[i]) ? prev : next,
      );
    }

    recomputeLines();
    const observer = new ResizeObserver(recomputeLines);
    observer.observe(row);
    observer.observe(cluster);
    window.addEventListener("resize", recomputeLines);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recomputeLines);
    };
    // `quote` deliberately IS a dependency (unlike useAboutPin.ts's own
    // effect, keyed only on `disabled`): that hook's content changes always
    // come with a real size change on the elements it already observes, so
    // the ResizeObserver alone re-triggers it; a quote change here does NOT
    // resize row1 or the cluster (row1's height is flat, its width is
    // viewport-driven), so nothing would otherwise notice the text itself
    // changed. Re-subscribing on every quote change re-creates the
    // ResizeObserver too, which is unnecessary work but not incorrect —
    // ResizeObserver setup/teardown is cheap and this only happens on a
    // real navigation or reroll, not per frame.
  }, [quote]);

  // Phase 2: line 1 now exists in the DOM with its final content — measure
  // where it actually starts and pin the button MINIMUM_GAP to its left.
  // Real rendered position, not the fit budget re-applied a second time:
  // line 1 can use LESS than its full budget (the greedy fit stops as soon
  // as the next word wouldn't fit, not when the budget is exactly used up),
  // so trusting the budget instead of the real rect would under-shoot the
  // gap on any line that didn't happen to fill it exactly.
  useLayoutEffect(() => {
    const button = buttonRef.current;
    const quoteGroup = quoteGroupRef.current;
    const text = textRef.current;
    if (!lines || !button || !quoteGroup || !text) return;
    const firstLine = text.firstElementChild as HTMLElement | null;
    if (!firstLine) return;

    const ancestorLeft = quoteGroup.getBoundingClientRect().left;
    const firstLineLeft = firstLine.getBoundingClientRect().left;
    const left = firstLineLeft - ancestorLeft - MINIMUM_GAP - BUTTON_WIDTH;
    button.style.left = `${left}px`;
  }, [lines]);

  return { rowRef, clusterRef, quoteGroupRef, textRef, buttonRef, lines };
}
