"use client";

import { motion } from "motion/react";
import { ABOUT_SECTIONS } from "@/content/about";
import { SectionCount } from "./SectionCount";
import { PhotoCaption } from "./PhotoCaption";
import { PHOTO_COL_W } from "./aboutGeometry";
import { DUR, EASE } from "@/lib/motion";

// Right column (Figma "progress track + text", 523:6850). Session 5A
// rendered all six photo/caption pairs at rest, clipped with
// overflow:hidden at a fixed PHOTO_WINDOW_H. Session 5B (the pin):
// `windowHeight`/`photoHeight` are now CSS lengths that track the
// viewport (aboutGeometry.ts's photoWindowCss/photoHeightCss).
//
// The photo/counter snap. `activeIndex` (useAboutPin.ts's currentIndex —
// one source, shared verbatim with the paragraph reveal) selects which of
// the six PhotoCaptions is on screen. Session 5D: derived from the
// hold/travel schedule's held block centers, not header-top thresholds,
// and switches at each hold's start rather than being a latched value.
//
// All six stay mounted, stacked in one CSS grid cell (col/row-start-1) and
// cross-faded by opacity via motion.div — no mount/unmount, no absolute
// positioning, no measurement of our own. The grid's own height is the
// tallest layer's; since every layer shares the same photoHeightCss, that
// height never changes across an index swap, so there's no layout shift
// and the caption never moves. `initial={false}` so nothing fades in on
// first paint — only index changes animate. `aria-hidden` on every
// non-active layer keeps only the visible photo's alt text in the
// accessibility tree.
export function PhotoColumn({
  windowHeight,
  photoHeight,
  activeIndex,
}: {
  windowHeight: string;
  photoHeight: string;
  activeIndex: number;
}) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-md" style={{ width: PHOTO_COL_W }}>
      <SectionCount current={activeIndex + 1} total={ABOUT_SECTIONS.length} />

      <div
        data-testid="about-photo-window"
        className="grid overflow-hidden"
        style={{ width: PHOTO_COL_W, height: windowHeight }}
      >
        {ABOUT_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ opacity: index === activeIndex ? 1 : 0 }}
            transition={{ duration: DUR.reveal, ease: EASE }}
            aria-hidden={index !== activeIndex}
          >
            <PhotoCaption
              photo={section.photo}
              alt={section.alt}
              caption={section.caption}
              priority={index === 0}
              height={photoHeight}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
