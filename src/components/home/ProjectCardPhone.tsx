import Image from "next/image";
import type { Project } from "@/content/projects";
import { ProjectTileContentPhone } from "./ProjectTileContentPhone";

// Phone project card (Figma "project card", phone variant 931:4274),
// rendered by ProjectSection.tsx's fallback below --breakpoint-tablet
// (744). Mocked at iPhone SE (988:7226, frame 355px) and iPhone 16 Pro
// (988:7296, frame 390px) — both render this exact card at a fixed 340px;
// only the surrounding gradient frame's width differs between them.
//
// R3 diagnostic (see the session's own plan doc) confirmed this is the
// flat static fallback, not a frame of the pinned scroll mechanic. Session
// R4a re-slots it from "the phone selected-work experience" to "the
// reduced-motion / short-viewport fallback at phone widths" — the role
// ProjectCard.tsx already played on desktop — once the pinned mechanic
// itself started running down to MIN_MECHANIC_FLOOR_W. Its own interior
// (title row, media well, meta rows, CTA) moved to
// ProjectTileContentPhone.tsx, session R4a, so the mechanic's phone tier
// can render the identical content instead of a second, hand-copied
// version of it — this file keeps only the frame and the panel wrapper
// (chrome, sizing, containment), which the mechanic does NOT reuse (it has
// its own tier-configured ProjectTile.tsx instead — see that file and
// ProjectSection.tsx's own comments for why the two wrappers stay
// independent, not shared).
const FRAME_H = 788;
const CARD_W = 340;

// Session R4a pre-flight: maxWidth used to be a bare "100%", which is only
// a safety valve against overflow, not a floor against touching the frame
// — the residual inset it left was pure centering leftover, and that hit
// exactly 0 at every width from 375px down to this card's own floor (same
// failure shape R1.1 Part C already fixed once for ProjectCard.tsx's
// desktop fallback: a fixed-width card with no minimum gap of its own).
// Now capped against --card-inset-x (globals.css) the same way Part C
// capped ProjectCard — which, as a side effect, resolves the 10-vs-20px SE
// discrepancy this comment used to flag as out of scope: --card-inset-x is
// already 10px below 395px (independently measured off the same 988:7226
// node), so reading it here instead of a flat 20 lands on Figma's own
// number at iPhone SE width, not just close to it.
export function ProjectCardPhone({ project }: { project: Project }) {
  const { color, gradient } = project;

  return (
    <article
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ height: FRAME_H, backgroundColor: color }}
    >
      {gradient && (
        <Image
          src={gradient}
          alt=""
          fill
          sizes="(max-width: 1710px) 100vw, 1610px"
          className="object-cover"
        />
      )}

      {/* Four flat children at a uniform gap-sm (12px) — 931:4274's own
          container is a single flex-col with one gap value between title
          row, media well, meta rows, and the CTA, not a nested
          meta+button group. Bug fix pass: corner radius is rounded-card
          (20) on both the frame and the card — unlike ProjectCardTablet.tsx,
          which keeps the desktop rounded-card/rounded-panel pairing. Top/
          bottom padding is py-md (20), not py-sm (12) — px-md stays
          unchanged. */}
      <div
        data-card-panel
        data-card-tier="phone"
        className="relative flex flex-col gap-sm rounded-card bg-true-white px-md py-md"
        style={{
          width: CARD_W,
          maxWidth: `min(${CARD_W}px, calc(100% - 2 * var(--card-inset-x)))`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <ProjectTileContentPhone project={project} />
      </div>
    </article>
  );
}
