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
// Fix pass (item 5): `--case-overview-text-max-w` (globals.css) caps the
// text group's own width between 744 and 1439px — narrower than its grid
// cell there — so the column wraps to more lines and its rendered height
// closes in on the metadata sidebar beside it. `none` outside that range
// (see the CSS var's own comment), so this is a no-op both below 744
// (single column, no sidebar to compare against) and at 1440+ (Figma's
// fixed-width column, byte-identical to before this session).
//
// Fix pass (round 2, item 4): `mx-auto`, unconditional. Once the cap above
// binds, the box (width:100% clamped down to the cap) is narrower than its
// own grid cell — with no auto margins that leftover space sat entirely on
// the right (default block/grid-item start alignment), reading as an
// unfinished edge rather than a deliberate layout. `margin: auto` on a
// grid item centers it within its own grid area exactly like it would in
// flow or flexbox, splitting that leftover space evenly instead. Harmless
// everywhere the cap isn't binding — below 744 and at 1440+, `width: 100%`
// already consumes the whole cell, leaving nothing for auto margins to
// distribute.
export function OverviewContent({ overview }: { overview: CaseStudy["overview"] }) {
  return (
    <div className="contents desktop:flex desktop:w-full desktop:flex-col desktop:gap-lg">
      <div
        className="col-start-1 row-start-2 mx-auto mt-lg flex w-full flex-col gap-md tablet:col-start-2 tablet:row-start-1 tablet:mt-0"
        style={{ maxWidth: "var(--case-overview-text-max-w)" }}
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
