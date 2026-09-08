"use client";

import { motion, type MotionValue } from "motion/react";
import type { RefObject } from "react";
import { ABOUT_SECTIONS } from "@/content/about";
import { TextBlock } from "./TextBlock";
import { textColumnWidthCss } from "./aboutGeometry";

// Left column (Figma "text scroll", 523:6602). Session 5A rendered all six
// blocks clipped with overflow:hidden at a fixed TEXT_WINDOW_H. Session 5B
// (the pin): the window height is now a CSS length that tracks the
// viewport (`windowHeight`, from aboutGeometry.ts's textWindowCss), and
// the content moves by `y` — a single MotionValue owned by
// useAboutPin.ts, never computed here — via `transform` only. Never
// native scroll of this div, never a layout change: the outer window
// stays overflow-hidden with a fixed height, and only the inner
// motion.div's translateY moves.
//
// Fix pass: width is textColumnWidthCss (a clamp), not the fixed TEXT_COL_W
// number — below ~1510px of row width the column shrinks rather than
// overflowing past the photo column. Both the window and the content
// motion.div need the same width: if only the window narrowed while the
// content stayed hard-coded at 663, overflow-hidden would clip text off
// the right edge instead of letting it reflow at the narrower measure.
//
// `windowRef` and `contentRef` let useAboutPin.ts measure this window's
// actual rendered height and the content's own height (font-dependent,
// not knowable at build time) — see that hook's own comment. A width
// change also re-triggers that same ResizeObserver (the content's height
// changes as text reflows at a narrower measure), so no separate handling
// is needed for that case.
//
// `filledCount` (session 5C): the latched high-water mark useAboutPin.ts
// derives from aboutProgress. Block `i` is filled once `i < filledCount` —
// a plain index comparison, so a paragraph that's already filled stays
// filled on every re-render regardless of which direction progress last
// moved.
export function TextColumn({
  windowHeight,
  y,
  windowRef,
  contentRef,
  filledCount,
}: {
  windowHeight: string;
  y: MotionValue<number>;
  windowRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  filledCount: number;
}) {
  return (
    <div
      ref={windowRef}
      data-testid="about-text-window"
      className="flex shrink-0 flex-col items-start overflow-hidden"
      style={{ width: textColumnWidthCss, height: windowHeight }}
    >
      <motion.div
        ref={contentRef}
        data-testid="about-text-content"
        className="flex flex-col items-start gap-3xl"
        style={{ width: textColumnWidthCss, y }}
      >
        {ABOUT_SECTIONS.map((section, index) => (
          <TextBlock
            key={section.id}
            header={section.header}
            body={section.body}
            filled={index < filledCount}
          />
        ))}
      </motion.div>
    </div>
  );
}
