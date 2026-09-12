import { ProseFigure } from "./ProseFigure";
import type { Block } from "@/content/case-studies/types";

type CarouselBlock = Extract<Block, { kind: "carousel" }>;

// This session's carousel renders its items stacked as ordinary
// proseFigure blocks at gap-xl (50px, the standard between-block gap) —
// this is both the static build and the permanent reduced-motion fallback
// (CLAUDE.md "Stacked project cards" applies the same principle: build the
// real fallback now, not a placeholder to throw away). A later session
// adds a scroll/swipe mechanic beside this, not instead of it.
export function Carousel({ items }: Omit<CarouselBlock, "kind">) {
  return (
    <div className="flex w-full flex-col gap-xl">
      {items.map((item, index) => (
        <ProseFigure key={index} heading={item.heading} paragraphs={item.paragraphs} figure={item.figure} />
      ))}
    </div>
  );
}
