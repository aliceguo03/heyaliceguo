"use client";

import { motion } from "motion/react";
import { ABOUT_SECTIONS } from "@/content/about";
import { SectionCount } from "./SectionCount";
import { PhotoCaption } from "./PhotoCaption";
import type { AboutGeometry } from "./aboutGeometry";
import { DUR, EASE } from "@/lib/motion";

// Right column (Figma "progress track + text", desktop 523:6850 / tablet
// 1076:10220-adjacent). All six photo/caption pairs stay mounted, stacked
// in one CSS grid cell (col/row-start-1) and cross-faded by opacity via
// motion.div — no mount/unmount, no absolute positioning, no measurement
// of our own.
//
// Tablet pin reflow session: dropped the explicit windowHeight/photoHeight
// props entirely. With the photo's own height now aspect-ratio-derived
// from its column width (PhotoCaption.tsx), every one of the six layers
// renders at the SAME height automatically (they all share geo.COLUMN_W) —
// there's no longer a separate "photo window" distinct from the photo's
// own natural height to compute, so the grid's height is just whatever
// its tallest (i.e. any) child renders at. Matches Figma's own documented
// behavior more closely than the old flexed-height version did: 523:6622
// already showed the photo column's real content NOT filling its
// available window (138px of slack) — empty space below the pill+photo+
// caption stack inside a taller frame is what Figma draws, not a
// regression.
//
// `activeIndex` (useAboutPin.ts's currentIndex) selects which of the six
// PhotoCaptions is on screen — the nearest block's target to the current
// post-lock scroll, not header-top thresholds, and it can move either
// direction. `initial={false}` so nothing fades in on first paint — only
// index changes animate. `aria-hidden` on every non-active layer keeps
// only the visible photo's alt text in the accessibility tree.
export function PhotoColumn({ geo, activeIndex }: { geo: AboutGeometry; activeIndex: number }) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: geo.COLUMN_W }}>
      <SectionCount
        current={activeIndex + 1}
        total={ABOUT_SECTIONS.length}
        size={geo.tier === "tablet" ? "compact" : "default"}
      />

      <div data-testid="about-photo-window" className="grid w-full">
        {ABOUT_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ opacity: index === activeIndex ? 1 : 0 }}
            transition={{ duration: DUR.photoFade, ease: EASE }}
            aria-hidden={index !== activeIndex}
          >
            <PhotoCaption
              photo={section.photo}
              alt={section.alt}
              caption={section.caption}
              priority={index === 0}
              width={geo.COLUMN_W}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
