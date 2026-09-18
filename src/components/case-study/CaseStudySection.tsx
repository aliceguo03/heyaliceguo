import { BLOCK_REGISTRY } from "./blocks/registry";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Block, Section } from "@/content/case-studies/types";

// The *scrub* carousel owns a pinned, `position: sticky` stage
// (CarouselStage.tsx) — ScrollReveal's own header comment is explicit that a
// transformed ancestor becomes the containing block for a sticky descendant,
// breaking it. This covers both of the scrub carousel's own renderings (the
// pinned mechanic and its short-viewport/reduced-motion stacked fallback)
// since neither should be wrapped, not just the pinned one.
//
// The *tabs* carousel (GeminiCut, CarouselTabs.tsx) has no sticky anything —
// it's ordinary static-flow content, same as every other block kind — so it
// deliberately does NOT skip ScrollReveal. A predicate rather than a
// Set<kind> because the two carousel modes need different answers under the
// same `kind`.
function skipsReveal(block: Block): boolean {
  return block.kind === "carousel" && block.mode !== "tabs";
}

// One case-study section (e.g. 736:6074 "our approach"): title row, then
// gap-md down to the first block, then gap-xl between every block after
// that — verified against all four sections in the template (title-row ->
// block[0] is always 20px; block[n] -> block[n+1] is always 50px). Section
// number renders in muted-gray, not the accent (CLAUDE.md) — static always,
// per the panel behaviour session's own decision not to add a third
// consumer of the sidebar's active index here.
//
// `data-section` is what useCaseStudyPanel.ts's ResizeObserver reads to
// build its tops array — never a hardcoded id list, so this works unchanged
// for a case study with three sections or six. `tabIndex={-1}` gives a jump
// (PanelNav's onJump) a real, non-tab-order focus target, the same
// `#page-top` precedent Hero's wordmark already uses for BACK TO TOP.
//
// Session R5 (case study responsive pass): title type steps
// `text-mono tablet:text-mono-header` — the phone mock (1005:8026) shows
// this row at --text-mono (which the sitewide mobile step already renders
// at 16/21), not --text-mono-header's own 24/32; tablet/desktop keep the
// header size, unchanged from before this session.
export function CaseStudySection({ section }: { section: Section }) {
  return (
    <div
      id={section.id}
      data-section={section.id}
      tabIndex={-1}
      className="flex w-full scroll-mt-nav-height flex-col"
    >
      <ScrollReveal as="div" className="flex w-full items-center justify-between py-sm text-mono font-mono tablet:text-mono-header">
        <p className="text-deep-black">{section.navLabel}</p>
        <p className="text-muted-gray">{section.number}</p>
      </ScrollReveal>

      <div className="mt-md flex w-full flex-col gap-xl">
        {section.blocks.map((block, index) => {
          const { kind, ...props } = block;
          const BlockComponent = BLOCK_REGISTRY[kind];
          const rendered = <BlockComponent {...props} />;
          return skipsReveal(block) ? (
            <div key={index} className="w-full">
              {rendered}
            </div>
          ) : (
            <ScrollReveal key={index} as="div" className="w-full">
              {rendered}
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
