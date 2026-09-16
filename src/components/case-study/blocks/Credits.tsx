import Image from "next/image";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { CREDITS_PHOTO_ASPECT } from "@/components/case-study/caseStudyGeometry";
import type { Block } from "@/content/case-studies/types";

type CreditsBlock = Extract<Block, { kind: "credits" }>;

// Half the content column, at each tier's own inset (--case-x: 20 below
// 744, 50 from 744, 100 from 1440) and the two-column grid's own gap-md
// (20px) subtracted — the same reasoning as Figure.tsx's FIGURE_SIZES,
// just halved for this block's 2-column grid. Assumes `grid-cols-2` at
// every tier, which matches this component's current (session-R5-commit-1)
// behavior; GeminiCut's own credits block passes no `photos` so this is
// inert for this project either way. If a later commit makes the grid
// `grid-cols-1` below 744 (per the responsive-pass plan), this string's
// phone branch needs to become the full-width case (`100vw - 40px`, no
// halving) at the same time — flagging here so the two don't drift apart.
const CREDITS_PHOTO_SIZES =
  "(max-width: 743px) calc((100vw - 40px - 20px) / 2), (max-width: 1439px) calc((100vw - 100px - 20px) / 2), 528.5px";

// "The Team" (736:6156) — a statement heading plus prose paragraphs at
// gap-md, same rhythm as every other block. Structurally identical to
// statement + prose, kept as its own block kind because it names a
// distinct, optional part of a case study (CLAUDE.md: "credits is
// optional and absent from most projects").
//
// `photos` (Chase's own addition, 736:6401) renders a 2x2 grid at the same
// gap-md, each cell CREDITS_PHOTO_ASPECT with `fill` inside a
// aspect-ratio-sized parent (CLAUDE.md rule 12 — no layout shift).
export function Credits({ heading, paragraphs, photos }: Omit<CreditsBlock, "kind">) {
  return (
    <div className="flex w-full flex-col gap-md">
      <Statement text={heading} />
      <Prose paragraphs={paragraphs} />
      {photos && (
        <div className="grid w-full grid-cols-2 gap-md">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="relative w-full overflow-hidden rounded-card"
              style={{ aspectRatio: CREDITS_PHOTO_ASPECT }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={CREDITS_PHOTO_SIZES}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
