import Image from "next/image";
import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

// Phone project card (Figma "project card", phone variant 931:4274),
// rendered by ProjectSection.tsx's fallback below --breakpoint-tablet
// (744). Mocked at iPhone SE (988:7226, frame 355px) and iPhone 16 Pro
// (988:7296, frame 390px) — both render this exact card at a fixed 340px;
// only the surrounding gradient frame's width differs between them.
//
// R3 diagnostic (see the session's own plan doc) confirmed this is the
// flat static fallback, not a frame of the pinned scroll mechanic.
const FRAME_H = 788;
const CARD_W = 340;
const MEDIA_H = 171;

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
  const { slug, number, name, shortName, status, role, type, shortType, color, gradient, thumbnail, video } =
    project;
  // Session R3.1: re-checked against 988:7340-7346 fresh — the phone card
  // genuinely shortens the title and project-type row on two of four
  // projects (not a uniform truncation rule), so both fall back to the
  // full string rather than deriving one from it. See shortName/shortType's
  // own comments in projects.ts.
  const displayName = shortName ?? name;
  const displayType = shortType ?? type;

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
        className="relative flex flex-col gap-sm rounded-card bg-true-white px-md py-md"
        style={{
          width: CARD_W,
          maxWidth: `min(${CARD_W}px, calc(100% - 2 * var(--card-inset-x)))`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex w-full items-center justify-between">
          <h3 className="flex items-center gap-s text-mono-caption font-mono">
            <span className="text-muted-gray">{number}.</span>
            <span className="text-deep-black">{displayName}</span>
          </h3>
          {status && <StatusPill {...status} size="phone" short />}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-media-s border border-divider"
          style={{ height: MEDIA_H }}
        >
          {thumbnail && (
            <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} />
          )}
        </div>

        {/* No TIMELINE row, same as the tablet card — but prefixes stay
            visible here: 931:4274 keeps "ROLE /" and "PROJECT /" as real
            text nodes (unlike the tablet card, which has none at all).
            Label is "PROJECT", not ProjectCard.tsx/ProjectTileContent's
            "PROJECT TYPE" — re-confirmed fresh against 920:4074 and its
            siblings on all four phone showcases; this size genuinely uses
            the shorter label, not a copy-paste of the desktop one. */}
        <dl className="flex flex-col gap-xs">
          {role && <MetaRow label="ROLE" value={role} compact />}
          {displayType && <MetaRow label="PROJECT" value={displayType} compact />}
        </dl>

        <BlackButton href={`/work/${slug}`} fullWidth>
          VIEW CASE STUDY
        </BlackButton>
      </div>
    </article>
  );
}
