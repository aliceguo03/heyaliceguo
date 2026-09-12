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
      className="grid w-full gap-x-3xl gap-y-xl"
      // minmax(0, STAT_W), not a flat STAT_W: each track holds exactly
      // 411px (left-packed, per the approved answer) whenever the content
      // column has room, but shrinks below it once the column itself
      // shrinks under caseStudyGeometry.ts's 1440px floor — the same
      // clamp() shrink the column's own width already gets, just
      // expressed as a track ceiling instead of a clamp() string, since
      // CSS grid's own sizing algorithm already does exactly this once a
      // track is capped rather than fixed.
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, ${STAT_W}px))` }}
    >
      {items.map((item, index) => (
        <div key={index} className="flex w-full flex-col items-center gap-md">
          <p className="text-gradient-project w-full text-stat font-sans font-black">{item.value}</p>
          <p className="w-full text-body font-sans text-deep-black">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
