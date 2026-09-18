"use client";

import { useRef } from "react";
import { CasePanel } from "./CasePanel";
import { OverviewContent } from "./OverviewContent";
import { CaseStudySection } from "./CaseStudySection";
import { useCaseStudyPanel } from "./useCaseStudyPanel";
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
// Desktop vertical rhythm, in tokens, reproducing Figma's own measured gaps
// exactly (736:6046, 736:6070): the outer row's own gap-3xl (100) between
// OverviewContent and the sections wrapper, plus that wrapper's own pt-xl
// (50, now `desktop:pt-xl` — see below), gives the overview-to-§01 gap its
// measured 150px; the wrapper's gap-3xl (100) reproduces every §n-to-§n+1
// gap; the row's own p-3xl gives the section 100px of padding on every
// side, including below the last section — Figma's own §04-to-buttons-row
// gap. No z-index on this section (CLAUDE.md's ProjectSection.tsx rule,
// same reasoning: giving it one would compare the whole row against the
// nav's z-50 as one number instead of case-by-case, and nothing here needs
// its own stacking order against the nav).
//
// Session R5 (case study responsive pass): this section is now a CSS grid
// at every tier, not just a flex row at desktop. Below --breakpoint-
// desktop there is no sticky sidebar (CasePanel.tsx's own comment), and
// the overview text/figure/sections need independent placement — the
// panel beside the text at tablet, the figure and sections both breaking
// to full width below that. Grid is what makes this possible without
// duplicating any DOM: `--case-grid-cols` (globals.css) is a single 1fr
// track below 744 and `383px 1fr` (PANEL_W | content) from 744 up,
// unchanged at 1440 — one CSS var read through an inline style, since
// "383px 1fr" isn't expressible as a spacing-token utility (CLAUDE.md hard
// rule 2 forbids the arbitrary-value class this would otherwise need).
// `gap-x-xl` is the real column gap between panel and content at tablet+
// (50px, same value the old flex row's own `gap-xl` supplied) — harmless
// at phone's single column, where there's nothing to separate. Row gaps
// are NOT a single `gap-y`: every boundary's own value differs by tier
// (see the plan's "Vertical rhythm" table), so each is a margin on the
// specific item that needs it (InfoPanel.tsx, OverviewContent.tsx, and the
// sections wrapper below) rather than one uniform grid gap.
//
// `contentRef` and the sections wrapper below both become `display:
// contents` (Tailwind's `contents` utility) below desktop — the same
// technique OverviewContent.tsx uses for its own two children, for the
// same reason: it lets `contentRef`'s children (OverviewContent's own
// already-flattened children, and the sections wrapper) become direct
// grid items of THIS section's grid, without changing where any of them
// live in the DOM. `useCaseStudyPanel.ts`'s querySelectorAll still finds
// every `[data-section]` regardless — `display: contents` removes an
// element from the layout tree, never from the DOM tree.
//
// Fix pass (commit 8): `contentRef` used to carry its own inline `width`
// (caseStudyGeometry.ts's contentColumnWidthCss) to reproduce the pre-grid
// flex row's clamp(807px, ..., 1077px) shape. At desktop that div is a
// real grid item (not `display: contents` there), so its own width was
// circularly sizing the very `1fr` track it sat in — the browser can't
// resolve a percentage against a track whose own size depends on that
// percentage, so the clamp's `calc()` branch silently failed and every
// desktop viewport landed on the clamp's floor (807px) instead of growing
// up to 1077px at wider widths. That clamp now lives on the grid TRACK
// itself (`--case-grid-cols`'s >=1440 branch, globals.css), where a
// percentage resolves against the grid container's own definite width —
// no circularity. This div needs no width of its own any more: CSS
// Grid's default `justify-items: stretch` already fills a grid item to
// its track's size, so `desktop:flex` alone is enough.
//
// Fix pass (item 6): `pb-lg tablet:pb-case-x` splits the bottom padding
// out of the flat `p-case-x` it used to share with every other side. Below
// 744 this section's own bottom padding is what supplies the gap between
// the last content block and CaseStudyActions.tsx's buttons row — Figma
// specifies 30px there, but `--case-x` is 20px at phone, so the flat
// version under-supplied it. `pb-lg` is a literal 30px, independent of
// `--case-x`'s own ramp; `tablet:pb-case-x` restores the previous
// (correct, unchanged) 50/100 behaviour from 744 up. Horizontal padding
// stays on `--case-x` (`px-case-x`, unaffected).
//
// Fix pass (item 7, "F9"): `pt-md tablet:pt-0 desktop:pt-3xl` replaces the
// flat `pt-case-x` above with Figma's own measured gap between the hero
// card and this section — 20px phone, 0px tablet, 100px desktop — rather
// than the judgment call the tablet/phone build made (CaseStudyHero.tsx
// relies entirely on this top padding for its own below-card gap; see that
// component's own comment). `--case-x` happens to already equal 20 at
// phone, so `pt-md` is the same rendered value there, just no longer tied
// to a ramp whose tablet/desktop steps (50/100) were wrong for this
// specific gap.
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
    <section
      className="grid w-full items-start gap-x-xl px-case-x pt-md pb-lg tablet:pt-0 tablet:pb-case-x desktop:pt-3xl"
      style={{ gridTemplateColumns: "var(--case-grid-cols)" }}
    >
      <CasePanel project={project} sections={sections} current={current} onJump={jumpTo} />

      <div ref={contentRef} className="contents desktop:flex desktop:flex-col desktop:gap-3xl">
        <OverviewContent overview={overview} />
        <div className="col-start-1 row-start-4 mt-lg flex flex-col gap-3xl tablet:col-span-2 tablet:row-start-3 desktop:mt-0 desktop:pt-xl">
          {sections.map((section) => (
            <CaseStudySection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}
