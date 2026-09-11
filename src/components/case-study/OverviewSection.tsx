import { InfoPanel } from "./InfoPanel";
import { PanelMeta } from "./PanelMeta";
import { Statement } from "./blocks/Statement";
import { Figure } from "./blocks/Figure";
import { Segments } from "./Segments";
import { CONTENT_W } from "./caseStudyGeometry";
import type { Project } from "@/content/projects";
import type { CaseStudy } from "@/content/case-studies/types";

// Overview section (736:6046) — the metadata panel plus hook, two
// paragraphs, and a figure. gap-lg (30px) between the text group and the
// figure — the one place in the template that uses 30 rather than the
// gap-md (20px) every other proseFigure uses (P1 plan "Flags" #5), which
// is why this is its own component rather than a reuse of ProseFigure.
export function OverviewSection({
  project,
  overview,
}: {
  project: Project;
  overview: CaseStudy["overview"];
}) {
  return (
    <section className="flex w-full items-start gap-xl p-3xl">
      <InfoPanel>
        <PanelMeta project={project} />
      </InfoPanel>

      <div className="flex flex-col gap-lg" style={{ width: CONTENT_W }}>
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
    </section>
  );
}
