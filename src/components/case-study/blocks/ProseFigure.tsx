import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { Figure } from "./Figure";
import type { Block } from "@/content/case-studies/types";

type ProseFigureBlock = Extract<Block, { kind: "proseFigure" }>;

// Every proseFigure block's own elements sit at gap-md (20px), regardless
// of order — verified against every instance in the template (736:6075,
// 736:6083, 736:6087, 736:6092, 760:6803, 736:6126). `figureFirst` swaps
// heading/figure/paragraphs into hook -> figure -> prose (the two section
// hooks, 736:6075 and 736:6126) instead of the default heading -> prose ->
// figure every other instance uses — see types.ts's comment on the flag.
export function ProseFigure({ heading, paragraphs, figure, figureFirst }: Omit<ProseFigureBlock, "kind">) {
  const headingEl = heading && <Statement text={heading} />;
  const proseEl = paragraphs && <Prose paragraphs={paragraphs} />;
  const figureEl = <Figure figure={figure} />;

  return (
    <div className="flex w-full flex-col gap-md">
      {figureFirst ? (
        <>
          {headingEl}
          {figureEl}
          {proseEl}
        </>
      ) : (
        <>
          {headingEl}
          {proseEl}
          {figureEl}
        </>
      )}
    </div>
  );
}
