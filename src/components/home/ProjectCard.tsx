import Image from "next/image";
import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

// Figma "project showcase" (441:5987) + "project card" (441:5988). Geometry
// below is frame-specific pixel math, not a design token — same treatment as
// the consts in Hero.tsx / PhotoStack.tsx. Only the outer frame participates
// in the future stacking scroll interaction (step 10); everything from the
// white card inward is static. Frame width comes from the parent's
// max-w-page (globals.css) rather than a local const, so it isn't
// duplicated in two places.
const FRAME_MIN_HEIGHT = 940;
const CARD_WIDTH = 1135;
const MEDIA_HEIGHT = 593;

// Card-specific fields are optional on Project because five of nine projects
// have no case-study data yet (see content/projects.ts). ProjectCard is only
// ever rendered from FEATURED_PROJECTS, which always carries them — but the
// type doesn't know that, so each is rendered conditionally rather than
// asserted non-null.
export function ProjectCard({ project }: { project: Project }) {
  const { slug, number, name, status, role, timeline, type, color, gradient, thumbnail, video } =
    project;

  return (
    <article
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ minHeight: FRAME_MIN_HEIGHT, backgroundColor: color }}
    >
      {/* Solid `color` on the article above is the pre-load fallback — it
          shows through until this image decodes, and stays as the base if
          `gradient` is ever absent. */}
      {gradient && (
        <Image
          src={gradient}
          alt=""
          fill
          sizes="(max-width: 1710px) 100vw, 1610px"
          className="object-cover"
        />
      )}

      <div
        className="relative flex flex-col gap-lg rounded-panel bg-true-white px-xl py-lg"
        style={{ width: CARD_WIDTH, boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex w-full items-center justify-between">
          <h3 className="flex items-center gap-s text-mono-header font-mono">
            <span className="text-muted-gray">{number}.</span>
            <span className="text-deep-black">{name}</span>
          </h3>
          {status && <StatusPill {...status} />}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-card border border-divider"
          style={{ height: MEDIA_HEIGHT }}
        >
          {thumbnail && (
            <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} />
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
    </article>
  );
}
