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
//
// Session R3: this is now specifically the >=MIN_MECHANIC_VIEWPORT_W (1440)
// fallback — reduced motion at desktop widths, or the short-viewport 13"
// Air case (ProjectSection.tsx). Below 1440, ProjectSection renders
// ProjectCardTablet or ProjectCardPhone instead: two purpose-built, fixed-
// width cards, not a further step of this one's own fluid scale. The
// from-scratch 659px card this file used to flag as future work (Figma
// 931:4275) now exists as ProjectCardTablet.tsx.
const FRAME_MIN_HEIGHT = 940;
// Session R1: CARD_MAX_W is now a max-width, not a fixed width — R0's
// viewport-width guard means this fallback renders at every width from
// 744 up (not just a short-viewport desktop edge case), so the old fixed
// 1135px was about to become a real overflow bug. 1440x760 is unchanged:
// at CARD_MAX_W itself the fluid width resolves to exactly 1135, same as
// before this session. Figma "project showcase" (439:5605).
//
// Session R1.1 Part C: the frame previously had no horizontal padding at
// all, so this max-width's own centering was the only thing keeping the
// card off the frame's edge — and that residual inset hit zero at
// ~1195px and stayed there all the way to 744, unguarded by any check.
// Now capped against --card-inset-x (globals.css) as well, so the card
// can't reach the frame regardless of how CARD_MAX_W and the viewport
// relate.
const CARD_MAX_W = 1135;
// MEDIA_HEIGHT is now a ratio, not a fixed px — CARD_MAX_W minus the
// panel's own left+right px-xl (50+50) is the media well's width at rest
// (1135-100=1035); at that width the ratio below resolves to exactly the
// old fixed 593, so 1440x760 is pixel-identical. Below 1135 both the well
// and its height shrink together instead of the well going nearly square.
const MEDIA_ASPECT_RATIO = "1035 / 593";

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
        data-card-panel
        className="relative flex w-full flex-col gap-lg rounded-panel bg-true-white px-xl py-lg"
        style={{
          maxWidth: `min(${CARD_MAX_W}px, calc(100% - 2 * var(--card-inset-x)))`,
          boxShadow: "var(--shadow-card)",
        }}
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
          style={{ aspectRatio: MEDIA_ASPECT_RATIO }}
        >
          {thumbnail && (
            <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} />
          )}
        </div>

        {/* flex-wrap: below CARD_MAX_W the panel's own fixed px-xl (50px)
            padding is untouched (card-internal, out of this session's page-
            gutter ramp), so content width shrinks with the viewport — at
            phone widths (~235px here) the meta list and CTA button can no
            longer sit side by side without overflowing. */}
        <div className="flex w-full flex-wrap items-end justify-between gap-md">
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
