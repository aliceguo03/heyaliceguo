import Image from "next/image";
import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

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
// flat static fallback, not a frame of the pinned scroll mechanic — no
// gradient strip, no seam layer, no shared fixed card in the source file.
const FRAME_H = 788; // gradient frame height, flat across the whole tablet range
const CARD_W = 659;
const MEDIA_H = 344;

// Session R3: corner radii are intentionally NOT what 931:4275 literally
// draws (frame 30 / card 20, inverted from desktop). Those mobile values
// are raw and unbound to a Figma variable, while desktop's pairing (frame
// rounded-card/20, card rounded-panel/30) is bound to "corner
// rounding/large" — read as a hand-typed slip in the mock, not a real
// design change, and confirmed with Alice before building. Frame keeps
// rounded-card, card keeps rounded-panel, same as ProjectCard.tsx.
export function ProjectCardTablet({ project }: { project: Project }) {
  const { slug, number, name, status, role, type, color, gradient, thumbnail, video } = project;

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
        className="relative flex flex-col gap-md rounded-panel bg-true-white p-lg"
        style={{
          width: CARD_W,
          maxWidth: `min(${CARD_W}px, calc(100% - 2 * var(--card-inset-x)))`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex w-full items-center justify-between">
          {/* text-mono (20px), not ProjectCard.tsx's text-mono-header
              (24px) — 931:4275's own title text style is JetBrains/Regular
              20/0.06em, confirmed via get_variable_defs, genuinely smaller
              than the desktop card's title, not a copy-paste of it. */}
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
            <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} />
          )}
        </div>

        {/* No TIMELINE row and no "ROLE /" / "PROJECT TYPE /" prefixes —
            931:4275 has neither: two stacked values only, first deep-black
            (role), second dark-gray (type). `hideLabel` keeps the label in
            the DOM as sr-only rather than dropping it, so a screen-reader
            user still gets the distinction a sighted user reads from
            color/position alone. flex-wrap + gap-md is the same safety net
            ProjectCard.tsx's own meta row already carries, even though this
            card's fixed 659px width never actually approaches wrapping
            within its 744–1439 range. */}
        <div className="flex w-full flex-wrap items-end justify-between gap-md">
          <dl className="flex flex-col gap-xs">
            {role && <MetaRow label="ROLE" value={role} hideLabel />}
            {type && <MetaRow label="PROJECT TYPE" value={type} hideLabel dim />}
          </dl>
          <BlackButton href={`/work/${slug}`}>VIEW CASE STUDY</BlackButton>
        </div>
      </div>
    </article>
  );
}
