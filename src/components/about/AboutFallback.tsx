"use client";

import { useRef } from "react";
import { ABOUT_SECTIONS } from "@/content/about";
import { AboutFallbackRow } from "./AboutFallbackRow";
import { useAboutSpotlight } from "./useAboutSpotlight";
import type { AboutGeometry } from "./aboutGeometry";

// The reduced-motion / short-viewport fallback for tablet+desktop (Figma
// "about - reduced motion", 705:5453), and About's own real phone-tier
// layout (Figma "about", 1064:9880, page "final") for every phone-width
// visitor — no pin, no clip, no transform; every section and photo
// present at once, differing per tier only in (AboutFallbackRow's own
// job) column layout and, at phone tier, the spotlight below.
//
// Mobile static stack session: this row gap was originally tier-aware —
// gap-xl (50) below --breakpoint-about, gap-3xl (100) at tablet/desktop —
// with phone's 50px an explicit call from Alice (705:5453's own measured
// value is 100px; the phone mock only draws one pair, so there was nothing
// to measure for a second row directly).
//
// B follow-up: phone's value changes to 100 too — a design override
// ("the 50px number was right per spec, the spec is being changed"), not
// a bug fix. Collapsed to one flat gap-3xl now that both sides agree,
// rather than keeping a same-valued `about:` variant around for a
// distinction that no longer exists.
//
// Mobile spotlight session: `reducedMotion` (threaded from AboutSection,
// which already computes it — a second subscription here would be
// redundant) gates the spotlight, not just its own transition durations.
// `spotlightEnabled` is true only at phone tier with motion allowed —
// tablet/desktop's own reduced-motion/short-viewport fallback keeps
// rendering everything filled, unchanged from before this session.
// useAboutSpotlight is still called UNCONDITIONALLY (rules of hooks;
// `disabled` mirrors useAboutPin.ts's own shape — see that hook's own
// comment) and is a real no-op at tablet/desktop regardless: there are no
// `[data-about-pair]` markers there to measure (AboutFallbackRow only adds
// that marker on its phone branch), so its ResizeObserver would find zero
// targets even if it ran.
export function AboutFallback({ geo, reducedMotion }: { geo: AboutGeometry; reducedMotion: boolean }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const spotlightEnabled = geo.tier === "phone" && !reducedMotion;
  const spotlightIndex = useAboutSpotlight(contentRef, !spotlightEnabled);

  return (
    <div ref={contentRef} data-testid="about-fallback-stack" className="flex w-full flex-col gap-3xl">
      {ABOUT_SECTIONS.map((section, index) => (
        <AboutFallbackRow
          key={section.id}
          section={section}
          priority={index === 0}
          geo={geo}
          active={!spotlightEnabled || index === spotlightIndex}
        />
      ))}
    </div>
  );
}
