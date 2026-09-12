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
export function OverviewContent({ overview }: { overview: CaseStudy["overview"] }) {
  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex w-full flex-col gap-md">
        <Statement text={overview.hook} />
        {overview.paragraphs.map((paragraph, index) => (
          <p key={index} className="m-0 w-full text-body font-sans text-deep-black">
            <Segments segments={paragraph} />
          </p>
        ))}
      </div>
      <Figure figure={overview.figure} />
    </div>
  );
}
