"use client";

import { motion } from "motion/react";
import type { MotionStyle, MotionValue } from "motion/react";
import type { RefObject } from "react";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { Figure } from "./Figure";
import { STICKY_TOP } from "@/components/chassis/navGeometry";
import { DUR, EASE } from "@/lib/motion";
import type { Block } from "@/content/case-studies/types";

type CarouselItem = Extract<Block, { kind: "carousel" }>["items"][number];

// The Design Decisions carousel's pinned mechanic — the presentational
// half. Owns no scroll math of its own: `progress`/`index`/`spacerHeight`
// are useCarouselScrub.ts's output, handed down the same way
// AboutSection.tsx passes useAboutPin's `textY`/`currentIndex` to
// TextColumn/PhotoColumn rather than each computing its own copy.
//
// Four vertical slots (heading / body / figure / bars), not three stacked
// item columns. Each of the first three slots is a CSS grid with all
// three items placed in the same cell (`col-start-1 row-start-1`) — a
// single-column, single-row grid auto-sizes to whichever item is tallest,
// with zero measurement, so the figure never jumps when the index changes
// even though the three bodies wrap to different numbers of lines.
// Stacking whole item *columns* instead would put each item's figure
// below its own text, and the figure would jump on every swap.
//
// All three items' figures stay mounted the whole time — no `src` swap on
// an index change, so no flash, the same reasoning PhotoStack.tsx's
// eager-loaded stack documents for its own five images.
//
// Crossfade is opacity-only (DUR.reveal, EASE), the same treatment
// CasePanel.tsx's AnimatePresence crossfade uses for its two variants —
// except nothing here ever unmounts: all three items stay in the
// accessibility tree permanently (CLAUDE.md's ProjectStack rule — no
// `inert`, no `visibility: hidden`), same as the P1 fallback already
// exposes all three unconditionally.
//
// The pagination bars are aria-hidden: no click handlers, no hover state,
// no focus target, nothing above them. They are a progress indicator, and
// scroll progress means nothing to assistive tech — the three items are
// already available as ordinary prose in the slots above.
export function CarouselStage({
  items,
  spacerRef,
  stageRef,
  progress,
  index,
  spacerHeight,
}: {
  items: CarouselItem[];
  spacerRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  index: number;
  spacerHeight: number;
}) {
  return (
    // An explicit height, not padding-bottom: useCarouselScrub.ts measures
    // the stage's own content-driven height and sets this to that height
    // plus the total scrub distance, giving the sticky stage inside it a
    // containing block genuinely tall enough to travel through — the same
    // shape ProjectSection.tsx/AboutSection.tsx already rely on. A
    // padding-only container was tried first and doesn't actually hold
    // (verified in the browser, not assumed — see this hook's own
    // comment).
    <div data-carousel-spacer ref={spacerRef} style={{ height: spacerHeight }}>
      <motion.div
        ref={stageRef}
        data-carousel-stage
        data-carousel-index={index}
        className="sticky flex w-full flex-col gap-md"
        // MotionStyle's own type doesn't list custom properties, but
        // motion/react's DOM writer treats any "--"-prefixed key as a CSS
        // variable and writes the bound MotionValue to it every frame,
        // same cast precedent as ProjectSection.tsx's --strip-y.
        style={{ top: STICKY_TOP, "--carousel-progress": progress } as MotionStyle}
      >
        <div className="grid w-full">
          {items.map((item, i) => (
            <motion.div
              key={i}
              data-carousel-item={i}
              className="col-start-1 row-start-1"
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: DUR.reveal, ease: EASE }}
              style={{ pointerEvents: index === i ? "auto" : "none" }}
            >
              <Statement text={item.heading} />
            </motion.div>
          ))}
        </div>

        <div className="grid w-full">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="col-start-1 row-start-1"
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: DUR.reveal, ease: EASE }}
              style={{ pointerEvents: index === i ? "auto" : "none" }}
            >
              <Prose paragraphs={item.paragraphs} />
            </motion.div>
          ))}
        </div>

        <div className="grid w-full">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="col-start-1 row-start-1"
              animate={{ opacity: index === i ? 1 : 0 }}
              transition={{ duration: DUR.reveal, ease: EASE }}
            >
              <Figure figure={item.figure} />
            </motion.div>
          ))}
        </div>

        <div className="flex w-full gap-md" aria-hidden="true">
          {items.map((_, i) => (
            <div
              key={i}
              data-carousel-bar={i}
              className="relative h-s flex-1 overflow-hidden rounded-card bg-subtle-gray"
            >
              {/* translateX inside an overflow-hidden rounded track, not
                  `width`/`scaleX`: width puts layout work on every frame,
                  and scaleX on an 8px-tall pill squashes the end caps at
                  low fill. A translate is pure compositor work, and the
                  track's own border-radius re-rounds the fill's leading
                  edge as it approaches full. clamp()'s middle argument
                  subtracts this bar's own index from the one shared
                  progress value — bar i is empty until progress passes i,
                  fills continuously from i to i+1, then stays full. */}
              <div
                className="absolute inset-0 rounded-card bg-disabled"
                style={{
                  transform: `translateX(calc(-100% + (100% * clamp(0, calc(var(--carousel-progress) - ${i}), 1))))`,
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
