import { InfoPanel } from "./InfoPanel";
import { PanelNav } from "./PanelNav";
import { CaseStudySection } from "./CaseStudySection";
import { CONTENT_W } from "./caseStudyGeometry";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// "Project case study section" (736:6070) — the sidebar plus every
// section, at gap-3xl (100px) between sections. Static this session: no
// pin, no scroll-linked sidebar highlight (CLAUDE.md "this session is
// static only") — the sidebar is a plain block that scrolls away with the
// page, and its active topic is hardcoded to the first section.
export function CaseStudy({ project, sections }: { project: Project; sections: Section[] }) {
  return (
    <section className="flex w-full items-start gap-xl px-3xl pb-3xl pt-xl">
      <InfoPanel>
        <PanelNav sections={sections} activeId={sections[0]?.id ?? ""} status={project.status} />
      </InfoPanel>

      <div className="flex flex-col gap-3xl" style={{ width: CONTENT_W }}>
        {sections.map((section) => (
          <CaseStudySection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}
