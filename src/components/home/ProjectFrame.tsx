import Image from "next/image";
import type { ReactNode } from "react";

// The gradient-backed rounded frame behind a project's white tile (Figma
// "project showcase", 441:5987), used as one element of the gradient strip
// in the fixed-tile mechanic (ProjectSection.tsx).
//
// All four corners rounded — this frame doesn't govern the strip's outer
// boundary (that convex corner, wherever it sits on scroll, comes from the
// rounded overflow-hidden viewport wrapping the whole strip; see L1's
// comment in ProjectSection.tsx). What this frame's own rounding does shape
// is the gutter mid-strip: with both the frame above a gutter and the frame
// below it independently rounded on all corners, the porcelain gap between
// two adjacent frames reads as a rounded-cornered seam, not a hard-edged
// slot cut into two square blocks.
//
// Session R4a: `height` is now required, not defaulted to FRAME_H — that
// default was written for "the static ProjectCard fallback" per this
// comment's own earlier text, but ProjectCard.tsx has never actually
// imported this component (it draws its own inline frame markup; grep
// confirms the only consumer of ProjectFrame is ProjectSection.tsx's L1
// strip, which already always passed an explicit height). FRAME_H is also
// no longer a single static constant to default to — it's viewport- and
// tier-dependent (projectGeometry.ts's geometryFor) — so a bare default
// would silently mean "desktop," exactly the kind of implicit assumption
// this session is removing.
export function ProjectFrame({
  color,
  gradient,
  height,
  children,
}: {
  color?: string;
  gradient?: string;
  // The L1 strip (ProjectSection.tsx) passes FRAME_STRIP_H — object-cover
  // just reveals more of the same gradient image, no crop/position change
  // needed (see projectGeometry.ts's BUFFER comment).
  height: number;
  children?: ReactNode;
}) {
  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ height, backgroundColor: color }}
    >
      {/* Solid `color` above is the pre-load fallback — it shows through
          until this image decodes, and stays as the base if `gradient` is
          ever absent. */}
      {gradient && (
        <Image
          src={gradient}
          alt=""
          fill
          sizes="(max-width: 1710px) 100vw, 1610px"
          className="object-cover"
        />
      )}
      {children}
    </div>
  );
}
