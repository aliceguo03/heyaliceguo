"use client";

import { motion, type MotionValue } from "motion/react";
import type { RefObject } from "react";
import { ABOUT_SECTIONS } from "@/content/about";
import { TextBlock } from "./TextBlock";
import type { AboutGeometry } from "./aboutGeometry";

// Left column (Figma "text scroll", 523:6602 desktop / 1045:9708 tablet).
// The outer window is overflow-hidden at a fixed height; only the inner
// motion.div's translateY moves (`y`, a single MotionValue owned by
// useAboutPin.ts, never computed here) — never native scroll of this div,
// never a layout change.
//
// Tablet pin reflow session: `width`/`windowHeight`/`gap` all come from
// `geo` (useAboutGeometry) now instead of flat module-scope CSS-calc
// strings — geo.COLUMN_W is the 50/50 split (see aboutGeometry.ts),
// geo.TEXT_WINDOW_H is FRAME_H minus the tier's own vertical padding, and
// geo.BLOCK_GAP is the paragraph-isolation gap, tier-specific (320
// desktop, 200 tablet — see that constant's own derivation).
//
// `currentIndex`: the single live index useAboutPin.ts derives from the
// continuous nearest-target mapping (aboutGeometry.ts's nearestBlockIndex).
// Block `i` is filled only while `i === currentIndex` — a plain equality,
// not a high-water mark, so a paragraph already passed returns to gray as
// soon as scroll carries it out of the spotlight, in either direction.
export function TextColumn({
  geo,
  y,
  windowRef,
  contentRef,
  currentIndex,
}: {
  geo: AboutGeometry;
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
      style={{ width: geo.COLUMN_W, height: geo.TEXT_WINDOW_H }}
    >
      <motion.div
        ref={contentRef}
        data-testid="about-text-content"
        className="flex w-full flex-col items-start"
        style={{ y, gap: geo.BLOCK_GAP }}
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
