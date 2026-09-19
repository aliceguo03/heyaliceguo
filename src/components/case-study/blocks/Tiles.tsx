import { Statement } from "./Statement";
import { Prose } from "./Prose";
import type { Block } from "@/content/case-studies/types";

type TilesBlock = Extract<Block, { kind: "tiles" }>;

// 2x2 grid (736:6135, "Takeaways"). CSS grid's default cross-axis
// alignment (stretch) already equalizes each row's card heights with no
// extra utility — a screenshot check (736:6135) confirmed the shorter
// card's *outer* border simply grows to match its row-mate while its
// content stays top-anchored with slack space below, rather than any
// flex-grow trick pushing the body down. Cards hug their own content.
//
// `lead` (Chase's "our approach section", 736:6320) is plain prose sitting
// between `heading`/no-heading and the grid, at this same gap-md rhythm —
// see types.ts's own comment on why it lives here rather than as a
// preceding `prose` block.
//
// Session R5 (case study responsive pass): a single stacked column below
// --breakpoint-tablet (the phone mock, 1005:8095, stacks both takeaway
// cards full-width) — `grid-cols-1 tablet:grid-cols-2`. The grid's own
// gap and each card's own padding step down to match: gap-sm/p-md at
// phone, gap-md/p-lg at tablet+ (unchanged from before this session).
export function Tiles({ heading, lead, items }: Omit<TilesBlock, "kind">) {
  return (
    <div className="flex w-full flex-col gap-sm tablet:gap-md">
      {heading && <Statement text={heading} />}
      {lead && <Prose paragraphs={lead} />}
      <div className="grid w-full grid-cols-1 gap-sm tablet:grid-cols-2 tablet:gap-md">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start gap-sm rounded-card border border-divider p-md tablet:p-lg"
          >
            <p className="w-full text-body font-sans text-dark-gray">{item.title}</p>
            <p className="w-full text-body font-sans text-deep-black">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
