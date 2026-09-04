import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill, type StatusKind } from "@/components/ui/StatusPill";
import { ProjectMedia } from "./ProjectMedia";

// Figma "project showcase" (441:5987) + "project card" (441:5988). Geometry
// below is frame-specific pixel math, not a design token — same treatment as
// the consts in Hero.tsx / PhotoStack.tsx. Only the outer frame participates
// in the future stacking scroll interaction (step 10); everything from the
// white card inward is static.
const FRAME_MAX_WIDTH = 1610;
const FRAME_MIN_HEIGHT = 1040;
const CARD_WIDTH = 1135;
const MEDIA_HEIGHT = 593;

export type ProjectCardProps = {
  slug: string;
  number: string;
  name: string;
  status: {
    label: string;
    kind: StatusKind;
    href?: string;
  };
  role: string;
  timeline: string;
  type: string;
  color: string;
  thumbnail: string;
  video?: string;
};

export function ProjectCard({
  slug,
  number,
  name,
  status,
  role,
  timeline,
  type,
  color,
  thumbnail,
  video,
}: ProjectCardProps) {
  return (
    <article
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ maxWidth: FRAME_MAX_WIDTH, minHeight: FRAME_MIN_HEIGHT, backgroundColor: color }}
    >
      <div
        className="flex flex-col gap-lg rounded-panel bg-true-white p-xl"
        style={{ width: CARD_WIDTH, boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex w-full items-center justify-between">
          <h3 className="flex items-center gap-s text-mono-header font-mono">
            <span className="text-muted-gray">{number}.</span>
            <span className="text-deep-black">{name}</span>
          </h3>
          <StatusPill {...status} />
        </div>

        <div
          className="relative w-full overflow-hidden rounded-card border border-divider"
          style={{ height: MEDIA_HEIGHT }}
        >
          <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} />
        </div>

        <div className="flex w-full items-end justify-between">
          <dl className="flex flex-col gap-xs">
            <MetaRow label="ROLE" value={role} />
            <MetaRow label="TIMELINE" value={timeline} />
            <MetaRow label="PROJECT TYPE" value={type} />
          </dl>
          <BlackButton href={`/work/${slug}`}>VIEW CASE STUDY</BlackButton>
        </div>
      </div>
    </article>
  );
}
