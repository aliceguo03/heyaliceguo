import Image from "next/image";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { CONTENT_W, CREDITS_PHOTO_ASPECT } from "@/components/case-study/caseStudyGeometry";
import type { Block } from "@/content/case-studies/types";

type CreditsBlock = Extract<Block, { kind: "credits" }>;

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
                sizes={`${CONTENT_W / 2}px`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
