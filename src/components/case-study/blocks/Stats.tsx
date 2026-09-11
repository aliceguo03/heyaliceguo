import { STAT_W } from "@/components/case-study/caseStudyGeometry";
import type { Block } from "@/content/case-studies/types";

type StatsBlock = Extract<Block, { kind: "stats" }>;

// 4 items -> 2 columns (736:6106, two rows of two 411px columns, 100px
// gap, left-packed in the 1077 content column rather than stretched full
// width — P1 plan "Flags" #7). 5-6 -> 3 columns, per the approved answer;
// Figma only shows the 4-item case, so 5/6 are this session's own
// extrapolation, not read from the file.
function columnCount(itemCount: number) {
  return itemCount <= 4 ? 2 : 3;
}

export function Stats({ items }: Omit<StatsBlock, "kind">) {
  const cols = columnCount(items.length);

  return (
    <div
      className="grid gap-x-3xl gap-y-xl"
      style={{ gridTemplateColumns: `repeat(${cols}, ${STAT_W}px)` }}
    >
      {items.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-md" style={{ width: STAT_W }}>
          <p className="text-gradient-project w-full text-stat font-sans font-black">{item.value}</p>
          <p className="w-full text-body font-sans text-deep-black">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
