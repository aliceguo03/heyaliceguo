"use client";

import { motion, type MotionValue } from "motion/react";
import type { RefObject } from "react";
import { ABOUT_SECTIONS } from "@/content/about";
import { TextBlock } from "./TextBlock";
import { TEXT_COL_W } from "./aboutGeometry";

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
// `windowRef` and `contentRef` let useAboutPin.ts measure this window's
// actual rendered height and the content's own height (font-dependent,
// not knowable at build time) — see that hook's own comment.
export function TextColumn({
  windowHeight,
  y,
  windowRef,
  contentRef,
}: {
  windowHeight: string;
  y: MotionValue<number>;
  windowRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={windowRef}
      data-testid="about-text-window"
      className="flex shrink-0 flex-col items-start overflow-hidden"
      style={{ width: TEXT_COL_W, height: windowHeight }}
    >
      <motion.div
        ref={contentRef}
        data-testid="about-text-content"
        className="flex flex-col items-start gap-3xl"
        style={{ width: TEXT_COL_W, y }}
      >
        {ABOUT_SECTIONS.map((section) => (
          <TextBlock key={section.id} header={section.header} body={section.body} />
        ))}
      </motion.div>
    </div>
  );
}
