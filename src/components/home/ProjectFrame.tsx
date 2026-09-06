import Image from "next/image";
import type { ReactNode } from "react";
import { FRAME_H } from "./projectGeometry";

// The gradient-backed rounded frame behind a project's white tile (Figma
// "project showcase", 441:5987). Used both as the static per-project
// background in the normal-flow fallback (ProjectCard.tsx) and as one
// element of the gradient strip in the fixed-tile mechanic
// (ProjectSection.tsx) — same frame, same Image, different parent.
export function ProjectFrame({
  color,
  gradient,
  children,
}: {
  color?: string;
  gradient?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-card"
      style={{ height: FRAME_H, backgroundColor: color }}
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
