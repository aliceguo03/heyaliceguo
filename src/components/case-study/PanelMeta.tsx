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

// Overview section's metadata panel content (736:6047/736:6048) — five
// label/value rows at gap-md, then one large justify-between gap down to
// the LIVE SITE pill. Values are already stored all-caps in
// content/projects.ts, so no CSS text-transform here (CLAUDE.md rule 9).
export function PanelMeta({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex flex-col gap-md">
        {ROWS.map(({ label, key }) => {
          const value = project[key];
          if (!value) return null;
          return (
            <div key={key} className="flex flex-col gap-s">
              <p className="text-mono font-mono text-accent-project">{label}</p>
              <p className="text-mono font-mono text-deep-black">{value}</p>
            </div>
          );
        })}
      </div>
      {project.status && (
        <StatusPill label={project.status.label} kind={project.status.kind} href={project.status.href} />
      )}
    </div>
  );
}
