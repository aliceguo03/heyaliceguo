import { Statement } from "./blocks/Statement";
import { Figure } from "./blocks/Figure";
import { Segments } from "./Segments";
import type { CaseStudy } from "@/content/case-studies/types";

// Overview section's content column (736:6063) — hook, two paragraphs, and a
// figure, at gap-lg (30px) between the text group and the figure — the one
// place in the template that uses 30 rather than the gap-md (20px) every
// other proseFigure uses (P1 plan "Flags" #5), which is why this stays its
// own component rather than a reuse of ProseFigure. Extracted from the old
// OverviewSection.tsx (which also owned its own InfoPanel) once the panel
// behaviour session merged the metadata panel and section sidebar into one
// shell shared across the whole case study — see CaseStudyBody.tsx, this
// component's one caller.
//
// Session R5 (case study responsive pass): the root becomes `display:
// contents` below --breakpoint-desktop (Tailwind's `contents` utility) —
// an element with `display: contents` generates no box of its own, so its
// children become direct grid items of CaseStudyBody.tsx's own grid
// instead of one nested flex column. This is what lets the text group sit
// beside the metadata panel at tablet while the figure breaks out to full
// width below it (see CaseStudyBody.tsx's own comment for the full grid
// diagram) — CSS can't move a child across sibling boundaries any other
// way without duplicating the DOM. At desktop (`desktop:flex desktop:flex-
// col desktop:gap-lg`) this reverts to exactly the original nested flex
// column, byte-identical to before this session; the grid-placement
// classes on the two children below are simply inert then, since grid
// placement properties have no effect on a non-grid-item.
//
// The figure is now its own wrapping div (it wasn't before) so it can
// carry its own grid placement and margins independently of the text
// group — Figure.tsx itself stays a plain, unwrapped component elsewhere
// (every other caller still renders it bare).
//
// Fix pass (item 5, round 1-3): rounds 1-3 chased a fill-ratio target
// (text column height vs. the metadata sidebar's own height) — see
// caseStudyGeometry.ts's own comment on that constant's history, including
// why round 2's `mx-auto` centering didn't hold up on review.
//
// Fix pass (round 4, simplified): the fill-ratio reasoning is dropped
// entirely. `tablet:w-7/10` is a plain width fraction — 70% of whatever
// this div's own grid/flex cell resolves to, which is exactly "the row's
// remaining width after the sidebar and its gap" at every tier this row
// applies (a percentage width always resolves against its own containing
// block, never the full row). At tablet that cell is CaseStudyBody.tsx's
// own `1fr` grid track; at desktop it's the flex wrapper above, itself
// `desktop:w-full` inside the same track — so 70% means the same thing in
// both cases with no separate desktop override needed, unlike rounds 1-3,
// which reverted to Figma's full-width column at 1440+. No auto margins:
// the column stays flush against the sidebar's own gap (`gap-x-xl` on
// CaseStudyBody.tsx's row), and the remaining 30% sits as plain margin on
// the right. `w-full` below `tablet:` is unaffected — this row is a single
// stacked column there, with no sidebar beside it to leave a margin against.
export function OverviewContent({ overview }: { overview: CaseStudy["overview"] }) {
  return (
    <div className="contents desktop:flex desktop:w-full desktop:flex-col desktop:gap-lg">
      <div className="col-start-1 row-start-2 mt-lg flex w-full flex-col gap-md tablet:col-start-2 tablet:row-start-1 tablet:mt-0 tablet:w-7/10">
        <Statement text={overview.hook} />
        {overview.paragraphs.map((paragraph, index) => (
          <p key={index} className="m-0 w-full text-body font-sans text-deep-black">
            <Segments segments={paragraph} />
          </p>
        ))}
      </div>
      <div className="col-start-1 row-start-3 mt-md mb-lg tablet:col-span-2 tablet:row-start-2 tablet:mt-3xl tablet:mb-0 desktop:mt-0 desktop:mb-0">
        <Figure figure={overview.figure} />
      </div>
    </div>
  );
}
