"use client";

import Image from "next/image";
import { PHOTO_ASPECT_H, PHOTO_ASPECT_W } from "./aboutGeometry";
import { DUR, usePrefersReducedMotion } from "@/lib/motion";

// One "photo and caption" instance (Figma 523:7208 etc.) — a rounded photo
// plus a mono caption beneath it, gap-md between them. Caption is rendered
// verbatim, no CSS text-transform.
//
// Tablet pin reflow session: `width` (a number, px) replaces the old fixed
// `PHOTO_COL_W` + explicit `height` props. The photo's own height is now
// derived from that width via `aspect-ratio` (653/448, confirmed identical
// at all three Figma tiers — see aboutGeometry.ts) rather than an
// independently-set pixel height: the same box that used to size via
// `fill` inside a fixed-height wrapper now sizes itself from its width
// alone, so a caller only ever has one number to get right. The caption's
// own width is the SAME wrapper's width, so it's always exactly the
// photo's rendered width by construction, never a second measurement that
// happens to usually match (rule 12: an `aspect-ratio` box, not `fill`
// inside a fixed-height parent, is still an explicitly sized parent — the
// image itself still gets `fill` + explicit `sizes`, so there's no
// unsized-image layout shift). The caption needs its own `w-full`: the
// wrapper is `items-start`, so a child with no explicit width — the
// caption `<p>`, before this fix — shrink-wraps to its own text content
// rather than filling the wrapper, which is what actually let "caption
// width == photo width" silently NOT hold (a real, if invisible-at-a-
// glance, pre-existing gap between the code and its own comment, caught by
// this session's verify script measuring it directly rather than assumed
// true from the shared-wrapper structure alone).
//
// Mobile static stack session: two things step at --breakpoint-about
// (980), confirmed against 1064:9925/1064:9926/1064:9927 (phone) vs
// 1045:9750/1045:9751/1045:9752 (tablet) and 523:7128 (desktop):
//   - photo<->caption gap: 12 (phone) vs 20 (tablet/desktop)
//   - caption type: --text-mono-mobile, 14px (phone) vs --text-mono-
//     caption, 16px (tablet/desktop, unchanged)
// B follow-up: photo corner radius does NOT step — confirmed 20px
// (rounded-card) at every tier, phone included, resolving the open
// discrepancy the original scoping session flagged (it had guessed
// rounded-btn/10px for phone, by analogy with the selected-work
// mechanic's own per-tier radius pairing — a guess that turned out wrong
// for About specifically once actually confirmed).
// This component is shared by the pin (PhotoColumn, tablet/desktop only)
// and the fallback (AboutFallbackRow, all three tiers) — driving the two
// values above off the `about:` CSS variant rather than a prop means both
// consumers get the correct tier automatically, and the pin never renders
// below 980 so the phone values never apply there regardless.
//
// Mobile spotlight session: `active` (default true, so every existing
// caller — the pin's PhotoColumn, and AboutFallbackRow's tablet/desktop
// branch — renders at full brightness without knowing this prop exists)
// dims the whole photo+caption unit together when false, rather than
// dimming just the photo — the caption is already low-contrast muted-gray
// text, and dimming it further risked a real accessibility regression for
// no clear gain; the mock's own "muted gray/dimmed state" language reads
// as describing the pair as a unit, not the photo alone. Same transition
// shape as ColorReveal (DUR.reveal, --ease-standard) for visual
// consistency with the header/body color swap it always accompanies, but
// opacity instead of color — plain CSS, no motion/react needed, same
// reasoning ColorReveal's own comment gives for skipping it.
export function PhotoCaption({
  photo,
  alt,
  caption,
  priority,
  width,
  active = true,
}: {
  photo: string;
  alt: string;
  caption: string;
  priority?: boolean;
  width: number;
  active?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="flex shrink-0 flex-col items-start gap-sm about:gap-md"
      style={{
        width,
        opacity: active ? 1 : 0.4,
        ...(reducedMotion
          ? null
          : {
              transitionProperty: "opacity",
              transitionDuration: `${DUR.reveal}s`,
              transitionTimingFunction: "var(--ease-standard)",
            }),
      }}
    >
      <div
        data-testid="about-photo"
        className="relative w-full overflow-hidden rounded-card"
        style={{ aspectRatio: `${PHOTO_ASPECT_W} / ${PHOTO_ASPECT_H}` }}
      >
        <Image
          src={photo}
          alt={alt}
          fill
          sizes={`${Math.round(width)}px`}
          priority={priority}
          className="object-cover"
        />
      </div>
      <p className="w-full text-mono-mobile about:text-mono-caption font-mono text-muted-gray">{caption}</p>
    </div>
  );
}
