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
// Fix pass (item 5, round 1): the text group's own width is narrower than
// its grid cell between 744 and 1439px, so the column wraps to more lines
// and its rendered height closes in on the metadata sidebar beside it.
// `--case-overview-text-w` (globals.css) resolves to `100%` outside that
// range, so this is a no-op both below 744 (single column, no sidebar to
// compare against) and at 1440+ (Figma's fixed-width column, byte-
// identical to before round 1).
//
// Round 2 added `mx-auto` to center the leftover space the cap left in its
// grid cell — reverted in round 3 (see below); this is back to a plain
// `width`, no auto margins.
//
// Fix pass (round 3): back to left-aligned (no `mx-auto` — round 2's
// centering didn't hold up on review) with a real `width` (not
// `max-width`) driving the column, per OVERVIEW_TEXT_W's own comment
// (caseStudyGeometry.ts) for why round 3 replaced round 1/2's flat-75%-
// fill-target reasoning with a tiered one instead. With no auto margins,
// the column starts flush against the sidebar's own gap (`gap-x-xl` on
// CaseStudyBody.tsx's row) and whatever's left of the grid cell sits as
// plain margin on the right — not split between both sides.
export function OverviewContent({ overview }: { overview: CaseStudy["overview"] }) {
  return (
    <div className="contents desktop:flex desktop:w-full desktop:flex-col desktop:gap-lg">
      <div
        className="col-start-1 row-start-2 mt-lg flex w-full flex-col gap-md tablet:col-start-2 tablet:row-start-1 tablet:mt-0"
        style={{ width: "var(--case-overview-text-w)" }}
      >
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
