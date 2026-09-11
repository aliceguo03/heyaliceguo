import { BLOCK_REGISTRY } from "./blocks/registry";
import type { Section } from "@/content/case-studies/types";

// One case-study section (e.g. 736:6074 "our approach"): title row, then
// gap-md down to the first block, then gap-xl between every block after
// that — verified against all four sections in the template (title-row ->
// block[0] is always 20px; block[n] -> block[n+1] is always 50px). Section
// number renders in muted-gray, not the accent (CLAUDE.md).
export function CaseStudySection({ section }: { section: Section }) {
  return (
    <div id={section.id} className="flex w-full scroll-mt-nav-height flex-col">
      <div className="flex w-full items-center justify-between py-sm text-mono-header font-mono">
        <p className="text-deep-black">{section.navLabel}</p>
        <p className="text-muted-gray">{section.number}</p>
      </div>

      <div className="mt-md flex w-full flex-col gap-xl">
        {section.blocks.map((block, index) => {
          const { kind, ...props } = block;
          const Block = BLOCK_REGISTRY[kind];
          return <Block key={index} {...props} />;
        })}
      </div>
    </div>
  );
}
