"use client";

import { ProseFigure } from "./ProseFigure";
import { CarouselStage } from "./CarouselStage";
import { CarouselTabs } from "./CarouselTabs";
import { useCarouselScrub } from "../useCarouselScrub";
import { MIN_CAROUSEL_VIEWPORT_H } from "../caseStudyGeometry";
import { usePrefersReducedMotion, useViewportTooShort } from "@/lib/motion";
import type { Block } from "@/content/case-studies/types";

type CarouselBlock = Extract<Block, { kind: "carousel" }>;
type ScrubItems = Extract<CarouselBlock, { mode?: "scrub" }>["items"];

// Plain `Omit<CarouselBlock, "kind">` doesn't work once `carousel` is a
// two-member union (types.ts): `Omit` is built on `Pick`, which indexes a
// union type structurally rather than distributing over it, so it collapses
// `mode`/`items` into one merged shape and loses the correlation between
// them — `props.mode === "tabs"` would no longer narrow `props.items`. This
// distributes the omission over each member first, so the result is still a
// discriminated union `Carousel`'s own narrowing below can rely on.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

// One entry point for both carousel mechanics — `mode` (types.ts) picks the
// mechanism, not a second block kind, since both share the same item shape.
// Dispatching here, before either mechanic's own hooks run, keeps
// ScrubCarousel's viewport/reduced-motion/scrub hooks and CarouselTabs' own
// state entirely separate — each is its own component, so neither runs the
// other's hooks even conditionally.
export function Carousel(props: DistributiveOmit<CarouselBlock, "kind">) {
  if (props.mode === "tabs") {
    return <CarouselTabs items={props.items} />;
  }

  return <ScrubCarousel items={props.items} />;
}

// Design Decisions carousel, scrub mode (CLAUDE.md "Design Decisions
// carousel"). Pins for a bounded scroll distance and scrubs its items by
// scroll position — no auto-advance, no timers, no interval of any kind.
// This was P1's stacked-proseFigure build; that build hasn't changed at all
// — it's now this component's fallback rather than its only rendering, per
// the "P2 adds motion beside this, not instead of it" comment already on
// the `carousel` block kind in content/case-studies/types.ts.
//
// Reduced motion, or a viewport shorter than MIN_CAROUSEL_VIEWPORT_H (the
// pinned stage can't fit in full — this is short of the 1440x760 reference
// floor, so it's this design's normal rendering on a 13" Air, not an edge
// case): no pin, no scrub, no crossfade. The same P1 stack renders
// instead, reusing ProseFigure rather than a second hand-written layout —
// one fallback, not two, same as ProjectSection.tsx and AboutSection.tsx.
function ScrubCarousel({ items }: { items: ScrubItems }) {
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
