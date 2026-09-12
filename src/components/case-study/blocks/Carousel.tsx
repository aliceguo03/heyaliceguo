"use client";

import { ProseFigure } from "./ProseFigure";
import { CarouselStage } from "./CarouselStage";
import { useCarouselScrub } from "../useCarouselScrub";
import { MIN_CAROUSEL_VIEWPORT_H } from "../caseStudyGeometry";
import { usePrefersReducedMotion, useViewportTooShort } from "@/lib/motion";
import type { Block } from "@/content/case-studies/types";

type CarouselBlock = Extract<Block, { kind: "carousel" }>;

// Design Decisions carousel (CLAUDE.md "Design Decisions carousel"). Pins
// for a bounded scroll distance and scrubs its three items by scroll
// position — no auto-advance, no timers, no interval of any kind. This
// was P1's stacked-proseFigure build; that build hasn't changed at all —
// it's now this component's fallback rather than its only rendering, per
// the "P2 adds motion beside this, not instead of it" comment already on
// the `carousel` block kind in content/case-studies/types.ts.
//
// Reduced motion, or a viewport shorter than MIN_CAROUSEL_VIEWPORT_H (the
// pinned stage can't fit in full — this is short of the 1440x760 reference
// floor, so it's this design's normal rendering on a 13" Air, not an edge
// case): no pin, no scrub, no crossfade. The same P1 stack renders
// instead, reusing ProseFigure rather than a second hand-written layout —
// one fallback, not two, same as ProjectSection.tsx and AboutSection.tsx.
export function Carousel({ items }: Omit<CarouselBlock, "kind">) {
  const reducedMotion = usePrefersReducedMotion();
  const tooShort = useViewportTooShort(MIN_CAROUSEL_VIEWPORT_H);
  const disabled = reducedMotion || tooShort;

  // Always called (rules of hooks) — a no-op internally whenever the
  // fallback below renders instead; see useCarouselScrub.ts's own comment.
  const { spacerRef, stageRef, progress, index, spacerHeight } = useCarouselScrub(items.length, disabled);

  if (disabled) {
    return (
      <div className="flex w-full flex-col gap-xl">
        {items.map((item, i) => (
          <ProseFigure key={i} heading={item.heading} paragraphs={item.paragraphs} figure={item.figure} />
        ))}
      </div>
    );
  }

  return (
    <CarouselStage
      items={items}
      spacerRef={spacerRef}
      stageRef={stageRef}
      progress={progress}
      index={index}
      spacerHeight={spacerHeight}
    />
  );
}
