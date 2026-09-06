import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";
import { CONTENT_W, MEDIA_H } from "./projectGeometry";

// One project's content — title row, status pill, media well, meta rows,
// CTA (Figma "card content", I441:5988;565:1455). Used both as the static
// contents of the flow-mode tile (ProjectCard.tsx) and as one block of the
// content strip in the fixed-tile mechanic (ProjectSection.tsx).
//
// Card-specific fields are optional on Project because five of nine
// projects have no case-study data yet (see content/projects.ts). This is
// only ever rendered from FEATURED_PROJECTS, which always carries them —
// but the type doesn't know that, so each is rendered conditionally rather
// than asserted non-null.
//
// `visible` is only meaningful when this block has a video: it passes
// straight through to ProjectMedia, which needs it to gate playback in the
// fixed-card mechanic (see ProjectMedia's comment on why `clip-path`
// defeats its own IntersectionObserver). Undefined in the normal-flow
// fallback, where ProjectMedia owns its own visibility instead.
export function ProjectTileContent({
  project,
  visible,
}: {
  project: Project;
  visible?: boolean;
}) {
  const { slug, number, name, status, role, timeline, type, thumbnail, video } = project;

  return (
    <div className="flex flex-col gap-lg" style={{ width: CONTENT_W }}>
      <div className="flex w-full items-center justify-between">
        <h3 className="flex items-center gap-s text-mono-header font-mono">
          <span className="text-muted-gray">{number}.</span>
          <span className="text-deep-black">{name}</span>
        </h3>
        {status && <StatusPill {...status} />}
      </div>

      <div
        className="relative w-full overflow-hidden rounded-card border border-divider"
        style={{ height: MEDIA_H }}
      >
        {thumbnail && (
          <ProjectMedia
            thumbnail={thumbnail}
            video={video}
            alt={`${name} project screenshot`}
            visible={visible}
          />
        )}
      </div>

      <div className="flex w-full items-end justify-between">
        <dl className="flex flex-col gap-xs">
          {role && <MetaRow label="ROLE" value={role} />}
          {timeline && <MetaRow label="TIMELINE" value={timeline} />}
          {type && <MetaRow label="PROJECT TYPE" value={type} />}
        </dl>
        <BlackButton href={`/work/${slug}`}>VIEW CASE STUDY</BlackButton>
      </div>
    </div>
  );
}
