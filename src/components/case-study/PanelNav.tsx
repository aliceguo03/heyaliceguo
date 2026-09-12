import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// Section sidebar content (736:6071/672:4320) — four topics and the LIVE
// SITE pill all sit in one flat, evenly-distributed column: the real page
// instance measured all five gaps equal (see InfoPanel.tsx's comment), so
// this uses justify-between across all five siblings rather than a fixed
// gap plus a separate pill split.
//
// `activeSection` is hardcoded to the first section this session — no
// scroll position exists to derive it from yet (CLAUDE.md "this session is
// static only"). Each topic is a real anchor to its section id, so jumping
// (and hover/focus affordance) works today even without a later session's
// scroll-driven active state.
export function PanelNav({
  sections,
  activeId,
  status,
}: {
  sections: Section[];
  activeId: string;
  status?: Project["status"];
}) {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      {sections.map((section) => {
        const active = section.id === activeId;
        const color = active ? "text-accent-project" : "text-muted-gray hover:text-deep-black";
        return (
          <a key={section.id} href={`#${section.id}`} className={`flex flex-col gap-sm ${color}`}>
            <div className="flex gap-sm whitespace-nowrap text-mono font-mono">
              <span>{section.number}/</span>
              <span>{section.navLabel}</span>
            </div>
            <p className="text-body font-sans">{section.navSubLabel}</p>
          </a>
        );
      })}
      {status && (
        <StatusPill label={status.label} kind={status.kind} href={status.href} arrowHover="right" />
      )}
    </div>
  );
}
