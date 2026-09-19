import { BlackButton } from "@/components/ui/BlackButton";
import type { Project } from "@/content/projects";

// "buttons" band (736:6159) — BACK TO HOME (outline) and NEXT PROJECT
// (filled), not a prev/next pair: Figma shows no previous-project button,
// only a link back to the homepage (P1 plan "Flags" #8). `next` is derived
// by the caller from content/projects.ts order, so no project name is ever
// hardcoded here. Figma's own gap measures 19px, a non-token, non-Figma-
// variable value — taken as gap-md (20px), a 1px difference (Flags #6).
//
// `footerLabel`, not `name` — the short form ("Chase", "GeminiCut") the
// footer's own link columns already use for this project, per
// content/projects.ts's own comment that the two are deliberately distinct
// strings, not a casing transform of one another. The nav dropdown keeps
// `name` (the long form) unchanged; this button is the only other consumer
// that needed the short one.
//
// Session R5 (case study responsive pass): `gap-sm tablet:gap-md` — the
// phone mock's own buttons row (1005:8107) sits noticeably tighter than
// desktop/tablet's unchanged gap-md.
//
// Fix pass (item 4): below --breakpoint-actions (487px, globals.css — the
// exact width the longest possible pair, "BACK TO HOME" + "NEXT PROJECT:
// GEMINICUT", stops fitting on one row) the two buttons stack instead of
// wrapping mid-row. `flex-col` with no explicit width on either child
// already stretches both to the row's own width (the default
// `align-items: stretch`), so no `fullWidth` prop is needed on
// BlackButton — it reverts to each button's own content width for free
// once `actions:flex-row` restores `align-items: center` above the
// breakpoint. `px-case-x` is a no-op everywhere the row already fits (the
// row is `justify-center`, so side padding changes the content box, never
// where the buttons land) and is what the stacked width measures against.
export function CaseStudyActions({ next }: { next: Project }) {
  return (
    <div className="flex w-full flex-col gap-sm px-case-x pb-lg actions:flex-row actions:items-center actions:justify-center tablet:gap-md">
      <BlackButton variant="outline" outlineKind="secondary" href="/">
        BACK TO HOME
      </BlackButton>
      <BlackButton variant="filled" href={`/work/${next.slug}`}>
        NEXT PROJECT: {next.footerLabel}
      </BlackButton>
    </div>
  );
}
