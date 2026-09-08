import Image from "next/image";
import type { ReactNode } from "react";

// The gray frame's chrome (Figma "about", 523:6601): the background image
// and the stacking fix, and nothing else. Session 5B split the pinned
// layout (AboutSection.tsx) and the reduced-motion fallback (AboutFallback,
// via the same wrapper) out of this component — both need identical
// chrome, so this stays the one place that chrome is defined, taking
// `height` (a CSS length string, or omitted for natural height in the
// fallback) and `children` for whatever fills it.
//
// Background is a single image layer at 40% opacity, bottom-aligned within
// the frame — same next/image fill + object-cover pattern
// ProjectFrame.tsx already uses for a gradient-backed frame, with
// object-bottom added to match this frame's bottom-aligned crop.
//
// The content wrapper needs its own stacking position (relative z-10):
// the background image is position:absolute (fill), and an
// absolutely-positioned element paints above a statically-positioned one
// regardless of DOM order — so without this, the columns rendered after
// the image in markup still painted underneath it, washing everything in
// the gradient's 40% opacity instead of leaving it visible only in the
// empty space around them. (Session 5A bug, fixed acec80d — this is the
// one place that fix lives; do not duplicate this layering anywhere else.)
//
// This component must never receive, and never pass down, a z-index: a
// caller may wrap it in a `position: sticky` element (AboutSection.tsx
// does, to pin it), which already establishes its own stacking context
// regardless of z-index. Adding a z-index here would additionally make
// this subtree's stacking compared as one number against unrelated
// page-level z-indexes (the nav's z-50, the cursor bubble's --z-cursor at
// body level) instead of falling through as `auto` — see the 5B plan §A8.
export function AboutFrame({ height, children }: { height?: string; children: ReactNode }) {
  return (
    <div
      data-testid="about-frame"
      className="relative flex items-start justify-between overflow-hidden rounded-card px-xl py-3xl"
      style={height ? { height } : undefined}
    >
      <Image
        src="/about/frame-gradient.jpg"
        alt=""
        fill
        sizes="(max-width: 1710px) 100vw, 1610px"
        className="z-0 object-cover object-bottom opacity-40"
      />

      <div className="relative z-10 flex w-full items-start justify-between">{children}</div>
    </div>
  );
}
