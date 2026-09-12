import type { MouseEvent } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// Section sidebar content (736:6071/672:4320, compact variant 839:3144
// "type=jump section") — four topics and the LIVE SITE pill all sit in one
// flat, evenly-distributed column: the real page instance measured all five
// gaps equal (see InfoPanel.tsx's comment), so this uses justify-between
// across all five siblings rather than a fixed gap plus a separate pill
// split.
//
// `activeIndex` is the one committed value from useCaseStudyPanel.ts — the
// same index CasePanel.tsx uses to pick this variant over PanelMeta in the
// first place. Every topic stays a real anchor to its section id (deep-
// linkable, keyboard-navigable, functional with JS off); `onJump` only
// intercepts a plain left click so the browser's own new-tab/new-window
// gestures on cmd/ctrl/shift/middle-click still work.
//
// Active state is color only, by deliberate choice (not a WCAG 1.4.1 gap to
// fix here) — no rule, bar, dot, or weight change. Inactive renders in
// --color-dark-gray (not Figma's own --color-muted-gray, which measures
// 3.45:1 against porcelain and fails AA at this 20px-and-under body/mono
// text; dark-gray's 6.68:1 passes AA and AAA — see this session's plan for
// the full readout). Hover darkens further to --color-ink; active renders
// in the project accent. `compact` steps the header type down from
// --text-mono (20/26) to --text-mono-caption (16/21) and tightens the
// title-to-sub-label gap from gap-sm (12) to gap-s (8) — the only two
// differences the compact Figma variant shows.
export function PanelNav({
  sections,
  activeIndex,
  status,
  compact = false,
  onJump,
}: {
  sections: Section[];
  activeIndex: number;
  status?: Project["status"];
  compact?: boolean;
  onJump?: (index: number) => void;
}) {
  const headerType = compact ? "text-mono-caption" : "text-mono";
  const titleGap = compact ? "gap-s" : "gap-sm";

  function handleClick(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onJump?.(index);
  }

  return (
    <nav aria-label="Case study sections" className="flex h-full w-full flex-col justify-between">
      {sections.map((section, index) => {
        const active = index === activeIndex;
        const color = active
          ? "text-accent-project"
          : "text-dark-gray transition-colors duration-200 ease-standard hover:text-ink";
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active ? "location" : undefined}
            onClick={(event) => handleClick(event, index)}
            className={`flex flex-col ${titleGap} ${color}`}
          >
            <div className={`flex gap-sm whitespace-nowrap ${headerType} font-mono`}>
              <span>{section.number} /</span>
              <span>{section.navLabel}</span>
            </div>
            <p className="text-body font-sans">{section.navSubLabel}</p>
          </a>
        );
      })}
      {status && (
        <StatusPill label={status.label} kind={status.kind} href={status.href} arrowHover="right" />
      )}
    </nav>
  );
}
