"use client";

import { motion, type MotionValue } from "motion/react";
import type { RefObject } from "react";
import { ABOUT_SECTIONS } from "@/content/about";
import { TextBlock } from "./TextBlock";
import { BLOCK_GAP, textColumnWidthCss } from "./aboutGeometry";

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
// Fix pass: the window's width is textColumnWidthCss (a clamp) — below
// ~1510px of row width the column shrinks rather than overflowing past the
// photo column. The content motion.div only ever needs width: 100% of that
// window — it must NOT re-apply the same clamp itself. Session 5D fix:
// doing so was a live bug — the clamp's middle branch is
// `calc(100% - PHOTO_COL_W - MIN_COLUMN_GAP)`, and inside the content div
// that `100%` resolves against the *window* (663px at the 1710px
// reference), not the row the window itself is clamped against. That
// computes negative (663 - 653 - 100 = -90) and the clamp floors out at
// TEXT_COL_MIN_W (480px) — so the text rendered 183px narrower than Figma
// at every viewport, including the reference width, until this fix.
// `AboutFallbackRow.tsx`'s own use of the clamp is correct and unchanged:
// its containing block genuinely is the row, not a window already sized by
// the same expression.
//
// `windowRef` and `contentRef` let useAboutPin.ts measure this window's
// actual rendered height and the content's own height (font-dependent,
// not knowable at build time) — see that hook's own comment. A width
// change also re-triggers that same ResizeObserver (the content's height
// changes as text reflows at a narrower measure), so no separate handling
// is needed for that case.
//
// `currentIndex`: the single live index useAboutPin.ts derives from the
// continuous nearest-target mapping (aboutGeometry.ts's nearestBlockIndex).
// Block `i` is filled only while `i === currentIndex` — a plain equality,
// not a high-water mark, so a paragraph already passed returns to gray as
// soon as scroll carries it out of the spotlight, in either direction.
//
// Paragraph-isolation pass (session 5E): the gap between blocks is
// BLOCK_GAP (320px, aboutGeometry.ts) applied as an inline style, not a
// `gap-*` utility class — unlike the earlier 100px→212px tuning pass this
// widens to, 320px isn't backed by any Figma variable (this page's Figma
// file has no scroll mechanic to have measured it from), and globals.css's
// own header rules out adding an @theme token without one. See BLOCK_GAP's
// comment for the isolation requirement that sets its value.
// AboutFallback.tsx's own gap-3xl is untouched on purpose: it renders a
// different Figma mock (705:5453) with its own documented 100px row gap,
// not derived from this column.
export function TextColumn({
  windowHeight,
  y,
  windowRef,
  contentRef,
  currentIndex,
}: {
  windowHeight: string;
  y: MotionValue<number>;
  windowRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
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
        className="flex w-full flex-col items-start"
        style={{ y, gap: BLOCK_GAP }}
      >
        {ABOUT_SECTIONS.map((section, index) => (
          <TextBlock
            key={section.id}
            header={section.header}
            body={section.body}
            filled={index === currentIndex}
          />
        ))}
      </motion.div>
    </div>
  );
}
