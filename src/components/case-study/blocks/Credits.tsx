import { Statement } from "./Statement";
import { Prose } from "./Prose";
import type { Block } from "@/content/case-studies/types";

type CreditsBlock = Extract<Block, { kind: "credits" }>;

// "The Team" (736:6156) — a statement heading plus prose paragraphs at
// gap-md, same rhythm as every other block. Structurally identical to
// statement + prose, kept as its own block kind because it names a
// distinct, optional part of a case study (CLAUDE.md: "credits is
// optional and absent from most projects").
export function Credits({ heading, paragraphs }: Omit<CreditsBlock, "kind">) {
  return (
    <div className="flex w-full flex-col gap-md">
      <Statement text={heading} />
      <Prose paragraphs={paragraphs} />
    </div>
  );
}
