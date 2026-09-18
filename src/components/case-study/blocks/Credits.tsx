import Image from "next/image";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { CREDITS_PHOTO_ASPECT } from "@/components/case-study/caseStudyGeometry";
import type { Block } from "@/content/case-studies/types";

type CreditsBlock = Extract<Block, { kind: "credits" }>;

// Half the content column at tablet+desktop (each tier's own inset —
// --case-x: 50 from 744, 100 from 1440 — and the two-column grid's own
// gap-md, 20px, subtracted), full width at phone: the grid itself is now
// `grid-cols-1 tablet:grid-cols-2` (Session R5, case study responsive
// pass — the two were flagged together in commit 1's own comment here so
// they wouldn't drift apart, and this is that follow-through). GeminiCut's
// own credits block passes no `photos`, so this remains inert for this
// project either way; the follow-up session's Chase content is what
// exercises it.
const CREDITS_PHOTO_SIZES =
  "(max-width: 743px) calc(100vw - 40px), (max-width: 1439px) calc((100vw - 100px - 20px) / 2), 528.5px";

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
        <div className="grid w-full grid-cols-1 gap-md tablet:grid-cols-2">
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
