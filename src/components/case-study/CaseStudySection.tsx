import { BLOCK_REGISTRY } from "./blocks/registry";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Block, Section } from "@/content/case-studies/types";

// The carousel owns a pinned, `position: sticky` stage (CarouselStage.tsx)
// — ScrollReveal's own header comment is explicit that a transformed
// ancestor becomes the containing block for a sticky descendant, breaking
// it. Every other block kind is ordinary static-flow content, safe to
// wrap. This covers both of the carousel's own renderings (the pinned
// mechanic and its short-viewport/reduced-motion stacked fallback) since
// neither should be wrapped, not just the pinned one.
const NO_REVEAL: ReadonlySet<Block["kind"]> = new Set(["carousel"]);

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
export function CaseStudySection({ section }: { section: Section }) {
  return (
    <div
      id={section.id}
      data-section={section.id}
      tabIndex={-1}
      className="flex w-full scroll-mt-nav-height flex-col"
    >
      <ScrollReveal as="div" className="flex w-full items-center justify-between py-sm text-mono-header font-mono">
        <p className="text-deep-black">{section.navLabel}</p>
        <p className="text-muted-gray">{section.number}</p>
      </ScrollReveal>

      <div className="mt-md flex w-full flex-col gap-xl">
        {section.blocks.map((block, index) => {
          const { kind, ...props } = block;
          const BlockComponent = BLOCK_REGISTRY[kind];
          const rendered = <BlockComponent {...props} />;
          return NO_REVEAL.has(kind) ? (
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
