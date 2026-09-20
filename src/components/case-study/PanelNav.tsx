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
// Fix pass (item 4): active state is no longer color alone — a 4px bar in
// the project accent, flush against the panel's own outer edge (the gray
// card border every variant of this shell already carries), is the
// non-color signal. Resolves the WCAG 1.4.1 gap this component used to log
// as a deliberate deferral.
//
// Review pass: a first version put the bar on the item itself
// (`border-l-2`), which meant padding every item's text away from it to
// avoid overlap — text no longer matched Figma's own measured position.
// This version is a separate `aria-hidden` element per item instead, sized
// to that item's own height (`absolute inset-y-0` on a `relative` `<a>`,
// so no per-item measurement is needed — a taller-wrapping navSubLabel
// still gets a bar spanning its own full height for free) and reaches OUT
// to the panel's edge with `-left-lg`: the ancestor card's own `p-lg`
// padding (CasePanel.tsx's `CARD`, or InfoPanel.tsx's `chrome` classes in
// the reduced-motion fallback — every render path this component appears
// in uses that same token) sits an item's left edge exactly `--spacing-lg`
// inside the card's border, so `-left-lg` is the exact distance back out to
// it — not a magic number, the same token doing double duty on both ends.
// `w-1` (4px, bumped up from a first pass's 2px) is a built-in Tailwind
// width step, not an arbitrary value. Item text needs no padding or shift
// of its own any more; it renders at its original Figma position.
//
// Color: `bg-accent-project` active, `bg-transparent` otherwise — the same
// `transition-colors duration-200 ease-standard` already on the text color
// (Tailwind's transition-colors covers background-color for free, so this
// is the same transition, not a second one). Inactive text renders in
// --color-dark-gray (not Figma's own --color-muted-gray, which measures
// 3.45:1 against porcelain and fails AA at this 20px-and-under body/mono
// text; dark-gray's 6.68:1 passes AA and AAA — see this session's plan for
// the full readout). Hover darkens further to --color-ink; active renders
// in the project accent, on both the text and the bar. `compact` steps the
// header type down from --text-mono (20/26) to --text-mono-caption (16/21)
// and tightens the title-to-sub-label gap from gap-sm (12) to gap-s (8) —
// the only two differences the compact Figma variant shows.
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
        const textColor = active ? "text-accent-project" : "text-dark-gray hover:text-ink";
        const barColor = active ? "bg-accent-project" : "bg-transparent";
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active ? "location" : undefined}
            onClick={(event) => handleClick(event, index)}
            className={`relative flex flex-col ${titleGap} transition-colors duration-200 ease-standard ${textColor}`}
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 -left-lg w-1 transition-colors duration-200 ease-standard ${barColor}`}
            />
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
