"use client";

import { useRef } from "react";
import { CasePanel } from "./CasePanel";
import { OverviewContent } from "./OverviewContent";
import { CaseStudySection } from "./CaseStudySection";
import { useCaseStudyPanel } from "./useCaseStudyPanel";
import { contentColumnWidthCss } from "./caseStudyGeometry";
import type { Project } from "@/content/projects";
import type { CaseStudy } from "@/content/case-studies/types";

// The case study's one info-panel-plus-content row — what used to be two
// separate sections (OverviewSection.tsx's metadata panel + overview column,
// CaseStudy.tsx's sidebar + sections), each with its own InfoPanel. Merged
// into a single row this session so a single sticky panel (CasePanel.tsx)
// has one containing block to pin against instead of two independent ones —
// `position: sticky` only sticks inside its own containing block, so two
// sections could never have shared one sticky shell.
//
// Vertical rhythm, in tokens, reproducing Figma's own measured gaps exactly
// (736:6046, 736:6070, re-read this session): the outer row's own gap-3xl
// (100) between OverviewContent and the sections wrapper, plus that
// wrapper's own pt-xl (50), gives the overview-to-§01 gap its measured
// 150px; the wrapper's gap-3xl (100) reproduces every §n-to-§n+1 gap; the
// row's own p-3xl gives the section 100px of padding on every side,
// including below the last section — Figma's own §04-to-buttons-row gap.
// No z-index on this section (CLAUDE.md's ProjectSection.tsx rule, same
// reasoning: giving it one would compare the whole row against the nav's
// z-50 as one number instead of case-by-case, and nothing here needs its
// own stacking order against the nav).
export function CaseStudyBody({
  project,
  overview,
  sections,
}: {
  project: Project;
  overview: CaseStudy["overview"];
  sections: CaseStudy["sections"];
}) {
  // contentRef is what useCaseStudyPanel.ts measures every `[data-section]`
  // against — the sections wrapper below is a descendant of it, however
  // deeply nested, so this one ref covers all of them regardless of count.
  const contentRef = useRef<HTMLDivElement>(null);
  const { current, jumpTo } = useCaseStudyPanel(contentRef);

  return (
    <section className="flex w-full items-start gap-xl p-3xl">
      <CasePanel project={project} sections={sections} current={current} onJump={jumpTo} />

      <div ref={contentRef} className="flex flex-col gap-3xl" style={{ width: contentColumnWidthCss }}>
        <OverviewContent overview={overview} />
        <div className="flex flex-col gap-3xl pt-xl">
          {sections.map((section) => (
            <CaseStudySection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}
