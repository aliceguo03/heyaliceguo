import { BlackButton } from "@/components/ui/BlackButton";
import type { Project } from "@/content/projects";

// "buttons" band (736:6159) — BACK TO HOME (outline) and NEXT PROJECT
// (filled), not a prev/next pair: Figma shows no previous-project button,
// only a link back to the homepage (P1 plan "Flags" #8). `next` is derived
// by the caller from content/projects.ts order, so no project name is ever
// hardcoded here. Figma's own gap measures 19px, a non-token, non-Figma-
// variable value — taken as gap-md (20px), a 1px difference (Flags #6).
export function CaseStudyActions({ next }: { next: Project }) {
  return (
    <div className="flex w-full items-center justify-center gap-md pb-lg">
      <BlackButton variant="outline" href="/">
        BACK TO HOME
      </BlackButton>
      <BlackButton variant="filled" href={`/work/${next.slug}`}>
        NEXT PROJECT: {next.name}
      </BlackButton>
    </div>
  );
}
