import { BlackButton } from "@/components/ui/BlackButton";
import { MetaRow } from "@/components/ui/MetaRow";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Project } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

// Phone tier's project content — title row, status pill, media well, meta
// rows, CTA (Figma "project card", phone variant 931:4274). Lifted from
// ProjectCardPhone.tsx's own panel interior (session R4a): that file used
// to inline this markup directly since it was the only place it rendered;
// now the fixed-tile mechanic's phone tier (ProjectSection.tsx, below
// MIN_MECHANIC_VIEWPORT_W) needs the identical content inside its own
// clipped content layer, so this is a genuine extraction, not a rewrite —
// ProjectCardPhone.tsx now renders this component inside its own frame,
// same as ProjectTileContent.tsx's relationship to the desktop tier.
//
// `visible`/`magnetEnabled` mirror ProjectTileContent.tsx's own contract
// exactly (undefined in normal flow, where ProjectMedia/BlackButton own
// their own visibility; a boolean under the mechanic, where a clip-path
// defeats IntersectionObserver — see ProjectMedia.tsx's own comment).
const MEDIA_H = 171;

export function ProjectTileContentPhone({
  project,
  visible,
  magnetEnabled,
}: {
  project: Project;
  visible?: boolean;
  magnetEnabled?: boolean;
}) {
  const { slug, number, name, shortName, status, role, type, shortType, thumbnail, video } = project;
  // Session R3.1: re-checked against 988:7340-7346 fresh — the phone card
  // genuinely shortens the title and project-type row on two of four
  // projects (not a uniform truncation rule), so both fall back to the
  // full string rather than deriving one from it. See shortName/shortType's
  // own comments in projects.ts.
  const displayName = shortName ?? name;
  const displayType = shortType ?? type;

  // A bare fragment, not a self-wrapping flex/gap/width div the way
  // ProjectTileContent.tsx (desktop) has one: both this component's
  // callers already supply that wrapper themselves — ProjectCardPhone.tsx's
  // own panel div (`flex flex-col gap-sm ... px-md py-md`) in normal flow,
  // and ProjectTile.tsx's own `padded` styling (tier-configured by
  // ProjectSection.tsx) inside the mechanic — so adding a second, redundant
  // one here would apply the same flex/gap twice for no effect. Desktop's
  // own doubled wrapper is pre-existing and out of this session's scope;
  // this is a deliberate choice for the new component, not an oversight.
  return (
    <>
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
          <ProjectMedia thumbnail={thumbnail} video={video} alt={`${name} project screenshot`} visible={visible} />
        )}
      </div>

      {/* No TIMELINE row, same as the tablet content — but prefixes stay
          visible here: 931:4274 keeps "ROLE /" and "PROJECT /" as real
          text nodes (unlike the tablet card, which has none at all).
          Label is "PROJECT", not ProjectTileContent's "PROJECT TYPE" —
          re-confirmed against 920:4074 and its siblings on all four phone
          showcases; this size genuinely uses the shorter label. */}
      <dl className="flex flex-col gap-xs">
        {role && <MetaRow label="ROLE" value={role} compact />}
        {displayType && <MetaRow label="PROJECT" value={displayType} compact />}
      </dl>

      <BlackButton href={`/work/${slug}`} fullWidth magnetEnabled={magnetEnabled}>
        VIEW CASE STUDY
      </BlackButton>
    </>
  );
}
