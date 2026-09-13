"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "@/content/case-studies/types";

// The "design decisions" tabs carousel's own video behavior (CLAUDE.md
// "GeminiCut case study" — "Autoplay on tab selection is a response to a
// real click"): muted, native `loop` (so a cycle boundary is never a visible
// stop or freeze frame — no JS-managed replay), no controls. A separate file
// from FeatureVideo.tsx, not a shared component with a `behavior` branch, so
// the two video treatments on this page provably can't bleed into each
// other — see VideoSource's own comment on why `behavior` is a closed union.
//
// `playing` mirrors ProjectMedia.tsx's `visible` prop exactly: when the
// caller passes it (CarouselTabs.tsx, which knows both "is this tab
// selected" and "is the stage on screen"), this component just obeys it.
// Left undefined, it falls back to its own IntersectionObserver — same
// reduced-motion short-circuit as ProjectMedia — for any future use with no
// caller-owned gate.
export function AmbientVideo({
  video,
  poster,
  alt,
  playing,
}: {
  video: VideoSource;
  poster: string;
  alt: string;
  playing?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [observedOnScreen, setObservedOnScreen] = useState(false);

  useEffect(() => {
    if (playing !== undefined) return; // caller owns the gate — see comment above
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setObservedOnScreen(entry.intersectionRatio > 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playing]);

  const shouldPlay = playing ?? observedOnScreen;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (shouldPlay) {
      el.play().catch(() => {});
    } else {
      // Reset immediately on deselect, not on the next reselection — a tab
      // switched away from and back to should always start its video fresh,
      // regardless of how many times it's been visited. `shouldPlay` already
      // goes false the instant CarouselTabs.tsx deselects this item (or it
      // scrolls off screen), so there's no separate "deselected" signal to
      // plumb through — this effect firing IS that signal.
      el.pause();
      el.currentTime = 0;
    }
  }, [shouldPlay]);

  return (
    <video
      ref={videoRef}
      src={video.src}
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="metadata"
      className="size-full object-cover"
      style={video.zoom ? { transform: `scale(${video.zoom})` } : undefined}
    />
  );
}
