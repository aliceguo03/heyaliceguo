import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";

// Row labels are structural chrome (same treatment as MetaRow.tsx's own
// hardcoded "/" suffix) — the values themselves are the only project
// content, and every one comes from content/projects.ts (CLAUDE.md rule
// 9). A row whose field is empty on a given project (team/tools are
// F3Global-only today) is skipped rather than rendered blank.
const ROWS: { label: string; key: "role" | "timeline" | "type" | "tools" | "team" }[] = [
  { label: "ROLE /", key: "role" },
  { label: "TIMELINE /", key: "timeline" },
  { label: "PROJECT TYPE /", key: "type" },
  { label: "TOOLS & SKILLS /", key: "tools" },
  { label: "TEAM /", key: "team" },
];

// Overview section's metadata panel content (736:6047/736:6048, compact
// variant 839:3145 "type=info"; tablet's plain bordered box 1029:8723;
// phone's plain list 1005:7995) — five label/value rows, then a gap down to
// the status pill. Values are already stored all-caps in content/
// projects.ts, so no CSS text-transform here (CLAUDE.md rule 9).
//
// `compact` steps both label and value down from --text-mono (20/26) to
// --text-mono-caption (16/21) — the only difference the compact Figma
// variant shows; padding, gaps, and the pill are unchanged (see
// caseStudyGeometry.ts's PANEL_COMPACT_H comment). `compact` is a desktop-
// only concept (CasePanel.tsx never passes it true below --breakpoint-
// desktop), so it's never in tension with the tier-driven sizing below.
//
// Session R5 (case study responsive pass): `fixed` mirrors InfoPanel.tsx's
// own prop — `true` (desktop) keeps the original `h-full`/`justify-between`
// distribution across the shell's fixed height, byte-identical to before
// this session. `false` (tablet/phone) drops both: InfoPanel's own box has
// no explicit height there, so `h-full` would resolve against an
// undefined ancestor height and collapse to zero — this renders a plain
// flowing column instead, with its own gap down to the pill (20 at phone,
// matching the phone mock's own "roles"->"back to top button" gap; 30 at
// tablet, matching 1029:8724's own measured gap).
//
// Type size: `text-mono-mobile tablet:text-mono` (not a `fixed`-driven
// branch) resolves correctly at every tier without extra logic — desktop
// and tablet both satisfy the `tablet:` variant (giving --text-mono,
// 20/26) and phone alone falls through to --text-mono-mobile (14/18),
// matching the phone mock's own JetBrains/Mobile style exactly. `compact`
// only ever fires at desktop, so the ternary and the tier-driven fallback
// never compete for the same render.
export function PanelMeta({
  project,
  compact = false,
  fixed = true,
}: {
  project: Project;
  compact?: boolean;
  fixed?: boolean;
}) {
  const type = compact ? "text-mono-caption" : "text-mono-mobile tablet:text-mono";
  return (
    <div
      className={
        fixed ? "flex h-full w-full flex-col justify-between" : "flex w-full flex-col gap-md tablet:gap-lg"
      }
    >
      <div className="flex flex-col gap-sm tablet:gap-md">
        {ROWS.map(({ label, key }) => {
          const value = project[key];
          if (!value) return null;
          return (
            <div key={key} className="flex flex-col gap-xs tablet:gap-s">
              <p className={`${type} font-mono text-accent-project`}>{label}</p>
              <p className={`${type} font-mono text-deep-black`}>{value}</p>
            </div>
          );
        })}
      </div>
      {project.status && (
        <StatusPill
          label={project.status.label}
          kind={project.status.kind}
          href={project.status.href}
          arrowHover="right"
        />
      )}
    </div>
  );
}
