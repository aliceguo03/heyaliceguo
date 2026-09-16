import Image from "next/image";
import type { Project } from "@/content/projects";
import { ProjectTileContentTablet } from "./ProjectTileContentTablet";

// Tablet project card (Figma "project card", tablet variant 931:4275),
// rendered by ProjectSection.tsx's fallback between --breakpoint-tablet
// (744) and MIN_MECHANIC_VIEWPORT_W (1440). Mocked at iPad mini (988:7459,
// frame 704px) and iPad Pro 12.9 (988:7539, frame 964px) — both render this
// exact card; only the surrounding gradient frame's width differs between
// them, never the card's own shape.
//
// Unlike ProjectCard.tsx's fluid 1135px cap, this card is a FIXED 659px at
// every width in its range (CLAUDE.md rule 11 — "content does not scale
// with the viewport," only the surrounding frame flexes). maxWidth caps
// against --card-inset-x (globals.css) rather than a bare "100%", same
// R1.1 Part C precedent as ProjectCard.tsx and ProjectCardPhone.tsx — see
// the latter's own comment for why a bare 100% is a safety valve, not a
// floor. Latent here (659px never actually outgrows a 744-1439px frame
// after --page-x/--card-inset-x are subtracted), unlike ProjectCardPhone's
// live case, but fixed identically so it can't become live silently if
// either ramp changes later.
//
// R3 diagnostic (see the session's own plan doc) confirmed this is the
// flat static fallback, not a frame of the pinned scroll mechanic. Session
// R4a re-slots it from "the tablet selected-work experience" to "the
// reduced-motion / short-viewport fallback at tablet widths," the role
// ProjectCard.tsx already played on desktop. Its own interior moved to
// ProjectTileContentTablet.tsx so the mechanic's tablet tier renders the
// identical content — see that file, and ProjectCardPhone.tsx's own
// comment for the fuller version of this same story.
const FRAME_H = 788; // gradient frame height, flat across the whole tablet range
const CARD_W = 659;

// Session R3: corner radii are intentionally NOT what 931:4275 literally
// draws (frame 30 / card 20, inverted from desktop). Those mobile values
// are raw and unbound to a Figma variable, while desktop's pairing (frame
// rounded-card/20, card rounded-panel/30) is bound to "corner
// rounding/large" — read as a hand-typed slip in the mock, not a real
// design change, and confirmed with Alice before building. Frame keeps
// rounded-card, card keeps rounded-panel, same as ProjectCard.tsx.
export function ProjectCardTablet({ project }: { project: Project }) {
  const { color, gradient } = project;

  return (
    <article
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ height: FRAME_H, backgroundColor: color }}
    >
      {/* Solid `color` is the pre-load fallback, same treatment as
          ProjectCard.tsx and ProjectFrame.tsx. */}
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
        data-card-tier="tablet"
        className="relative flex flex-col gap-md rounded-panel bg-true-white p-lg"
        style={{
          width: CARD_W,
          maxWidth: `min(${CARD_W}px, calc(100% - 2 * var(--card-inset-x)))`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <ProjectTileContentTablet project={project} />
      </div>
    </article>
  );
}
