import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

// Tablet tier's project content — title row, status pill, media well, meta
// rows, CTA (Figma "project card", tablet variant 931:4275). Lifted from
// ProjectCardTablet.tsx's own panel interior (session R4a) — see
// ProjectTileContentPhone.tsx's own comment for the full reasoning; same
// extraction, same reused-not-rewritten relationship to its fallback.
//
// A bare fragment, not a self-wrapping div — see ProjectTileContentPhone's
// comment on the same choice; both this component's callers (the fallback
// panel div, and the mechanic's tier-configured ProjectTile) already supply
// the flex/gap/padding wrapper.
const MEDIA_H = 344;

export function ProjectTileContentTablet({
  project,
  visible,
  magnetEnabled,
}: {
  project: Project;
  visible?: boolean;
  magnetEnabled?: boolean;
}) {
  const { slug, number, name, status, role, type, thumbnail, video } = project;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        {/* text-mono (20px), not ProjectTileContent's text-mono-header
            (24px) — 931:4275's own title text style is JetBrains/Regular
            20/0.06em, confirmed via get_variable_defs, genuinely smaller
            than the desktop tier's title. */}
        <h3 className="flex items-center gap-s text-mono font-mono">
          <span className="text-muted-gray">{number}.</span>
          <span className="text-deep-black">{name}</span>
        </h3>
        {status && <StatusPill {...status} size="tablet" />}
      </div>

      <div
        className="relative w-full overflow-hidden rounded-nav border border-divider"
        style={{ height: MEDIA_H }}
      >
        {thumbnail && (
          <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} visible={visible} />
        )}
      </div>

      {/* No TIMELINE row and no "ROLE /" / "PROJECT TYPE /" prefixes —
          931:4275 has neither: two stacked values only, first deep-black
          (role), second dark-gray (type). `hideLabel` keeps the label in
          the DOM as sr-only rather than dropping it. flex-wrap + gap-md is
          the same safety net ProjectCard.tsx's own meta row carries, even
          though this tier's fixed-within-range width never actually
          approaches wrapping. */}
      <div className="flex w-full flex-wrap items-end justify-between gap-md">
        <dl className="flex flex-col gap-xs">
          {role && <MetaRow label="ROLE" value={role} hideLabel />}
          {type && <MetaRow label="PROJECT TYPE" value={type} hideLabel dim />}
        </dl>
        <BlackButton href={`/work/${slug}`} magnetEnabled={magnetEnabled}>
          VIEW CASE STUDY
        </BlackButton>
      </div>
    </>
  );
}
