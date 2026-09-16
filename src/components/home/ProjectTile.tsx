import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

// The white project tile (Figma "project card" instance, 441:5988), split
// into three independent aspects so one component covers three different
// jobs without duplicating its geometry or styling:
//
//   chrome  — bg-true-white, rounded corner, shadow-card
//   padded  — padding + flex flex-col gap (the content padding box)
//   clip    — overflow: hidden
//
// The mechanic (ProjectSection.tsx) needs them split across two roles,
// because each project's content is a separate layer stacked inside one
// shared window, clipped by `clip-path` rather than by `overflow: hidden`
// on itself:
//   - the window: chrome + clip, no padding — the one fixed white rounded
//     rectangle, sized exactly width x height, that never moves.
//   - each project's content layer inside it: padded only, no chrome — an
//     absolutely-positioned box, also exactly width x height, so its own
//     padding travels with its content rather than living on the window
//     (which would double-count it, since all four layers share the one
//     window's chrome).
// Putting the tile's real chrome on the window only, reusing this
// component for each layer's padding, means neither the padding numbers
// nor the panel's visual styling exist in two places.
//
// Session R4a: width/height/radiusClass/paddingClass/gapClass are now
// required props instead of a desktop-only default (TILE_W/TILE_H, a
// fixed rounded-panel/px-xl-py-lg/gap-lg) — those values are tier- and
// viewport-dependent now (projectGeometry.ts's geometryFor), and this
// component's only consumer (ProjectSection.tsx — confirmed by grep; the
// three fallback cards each draw their own bespoke panel, never this one)
// already computes geometry once per render and can pass it straight
// through. A default here would silently mean "desktop."
export function ProjectTile({
  chrome = true,
  padded = true,
  clip = false,
  width,
  height,
  radiusClass = "rounded-panel",
  paddingClass = "px-xl py-lg",
  gapClass = "gap-lg",
  style,
  children,
  ...rest
}: {
  chrome?: boolean;
  padded?: boolean;
  clip?: boolean;
  width: number;
  height: number;
  radiusClass?: string;
  paddingClass?: string;
  gapClass?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "style" | "children">) {
  const classes = [
    "relative",
    chrome && `${radiusClass} bg-true-white`,
    padded && `flex flex-col ${gapClass} ${paddingClass}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        width,
        height,
        boxShadow: chrome ? "var(--shadow-card)" : undefined,
        overflow: clip ? "hidden" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
