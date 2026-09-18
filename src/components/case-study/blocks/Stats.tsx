"use client";

import { STAT_W, STAT_W_PHONE } from "@/components/case-study/caseStudyGeometry";
import { BREAKPOINT_TABLET, useViewportBelow } from "@/lib/motion";
import { StatValue } from "./StatValue";
import type { Block } from "@/content/case-studies/types";

type StatsBlock = Extract<Block, { kind: "stats" }>;

// 4 items -> 2 columns (736:6106, two rows of two 411px columns, 100px
// gap, left-packed in the 1077 content column rather than stretched full
// width — P1 plan "Flags" #7). 5-6 -> 3 columns, per the approved answer;
// Figma only shows the 4-item case, so 5/6 are this session's own
// extrapolation, not read from the file. Session R5 (case study responsive
// pass): this is a desktop/tablet-only rule — below --breakpoint-tablet
// the phone mock (1005:8095) always shows a single centered column
// regardless of item count, so Stats.tsx's own `cols` calculation checks
// tier before falling back to this.
function columnCount(itemCount: number) {
  return itemCount <= 4 ? 2 : 3;
}

export function Stats({ items, columnWidth = STAT_W }: Omit<StatsBlock, "kind">) {
  // Session R5: this makes Stats.tsx a client component for the first
  // time — item-count-based column logic is a runtime JS value that can't
  // be re-expressed as a pure CSS media-query ramp the way most of this
  // pass's other geometry was (contrast globals.css's --case-* vars, which
  // only ever depend on viewport width). `isPhone` overrides both `cols`
  // and the column width; a project's own `columnWidth` prop (e.g.
  // Blink's STAT_W_WIDE) is a tablet/desktop-only override, so it's simply
  // not read at phone.
  const isPhone = useViewportBelow(0, BREAKPOINT_TABLET);
  const cols = isPhone ? 1 : columnCount(items.length);
  const width = isPhone ? STAT_W_PHONE : columnWidth;

  return (
    <div
      // Session R5 (case study responsive pass): `justify-center` centers
      // the grid's own tracks within the content column below desktop —
      // GeminiCut's tablet mock (1029:8781) shows its 2-item row centered,
      // not left-packed the way desktop's own 4-item 2x2 is (P1 plan
      // "Flags" #7, unchanged and untouched by this session).
      // `desktop:justify-normal` restores the exact absence of a
      // justify-content value desktop had before this session (Tailwind's
      // `justify-normal` maps to `justify-content: normal`, CSS Grid's own
      // initial value) rather than leaving `justify-center` to also apply
      // at >=1440, which would have shifted every existing desktop stats
      // block.
      className="grid w-full justify-center gap-x-3xl gap-y-xl desktop:justify-normal"
      // minmax(0, width), not a flat width: each track holds exactly its
      // own width (STAT_W, a project's own columnWidth override, or
      // STAT_W_PHONE below tablet) whenever the content column has room,
      // but shrinks below it once the column itself shrinks under
      // caseStudyGeometry.ts's 1440px floor — the same clamp() shrink the
      // column's own width already gets, just expressed as a track
      // ceiling instead of a clamp() string, since CSS grid's own sizing
      // algorithm already does exactly this once a track is capped rather
      // than fixed.
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, ${width}px))` }}
    >
      {items.map((item, index) => (
        <div key={index} className="flex w-full flex-col items-center gap-sm tablet:gap-md">
          <StatValue value={item.value} />
          <p className="w-full text-body font-sans text-deep-black">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
