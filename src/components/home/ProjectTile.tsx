import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { TILE_W, TILE_H } from "./projectGeometry";

// The white project tile (Figma "project card" instance, 441:5988), split
// into three independent aspects so one component covers three different
// jobs without duplicating its geometry or styling:
//
//   chrome  — bg-true-white, rounded-panel, shadow-card
//   padded  — px-xl py-lg + flex flex-col gap-lg (the content padding box)
//   clip    — overflow: hidden
//
// Flow mode (ProjectCard.tsx) wants all three on one instance: a
// self-contained tile, chrome and padding and content together.
//
// The mechanic (ProjectSection.tsx) needs them split across two roles
// instead, because each project's content is a separate layer stacked
// inside one shared window, clipped by `clip-path` rather than by
// `overflow: hidden` on itself:
//   - the window: chrome + clip, no padding — the one fixed white rounded
//     rectangle, sized exactly TILE_W x TILE_H, that never moves.
//   - each project's content layer inside it: padded only, no chrome — an
//     absolutely-positioned box, also exactly TILE_W x TILE_H, so its own
//     px-xl/py-lg padding travels with its content rather than living on
//     the window (which would double-count it, since all four layers share
//     the one window's chrome).
// Putting the tile's real chrome on the window only, reusing this
// component for each layer's padding, means neither the padding numbers
// nor the panel's visual styling exist in two places.
export function ProjectTile({
  chrome = true,
  padded = true,
  clip = false,
  style,
  children,
  ...rest
}: {
  chrome?: boolean;
  padded?: boolean;
  clip?: boolean;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "style" | "children">) {
  const classes = [
    "relative",
    chrome && "rounded-panel bg-true-white",
    padded && "flex flex-col gap-lg px-xl py-lg",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        width: TILE_W,
        height: TILE_H,
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
