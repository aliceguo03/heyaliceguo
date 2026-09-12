import { Statement } from "./Statement";
import type { Block } from "@/content/case-studies/types";

type TilesBlock = Extract<Block, { kind: "tiles" }>;

// 2x2 grid (736:6135, "Takeaways"). CSS grid's default cross-axis
// alignment (stretch) already equalizes each row's card heights with no
// extra utility — a screenshot check (736:6135) confirmed the shorter
// card's *outer* border simply grows to match its row-mate while its
// content stays top-anchored with slack space below, rather than any
// flex-grow trick pushing the body down. Cards hug their own content.
export function Tiles({ heading, items }: Omit<TilesBlock, "kind">) {
  return (
    <div className="flex w-full flex-col gap-md">
      {heading && <Statement text={heading} />}
      <div className="grid w-full grid-cols-2 gap-md">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-start gap-sm rounded-card border border-divider p-lg">
            <p className="w-full text-body font-sans text-dark-gray">{item.title}</p>
            <p className="w-full text-body font-sans text-deep-black">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
