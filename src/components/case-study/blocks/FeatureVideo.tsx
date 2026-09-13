"use client";

import { useRef, useState } from "react";
import { BlackButton } from "@/components/ui/BlackButton";
import type { VideoSource } from "@/content/case-studies/types";

// Commercial Showcase's own video behavior (CLAUDE.md "GeminiCut case
// study"): a real 2-minute video with audio and native controls, click-to-
// play — never autoplays, never loops. A separate file from AmbientVideo.tsx
// so this behavior can't drift toward the carousel's (or vice versa); see
// VideoSource's own comment on why `behavior` is a closed union rather than
// independent booleans one caller could half-set.
//
// Ends once and stops; per your spec, that's a defect to cover, not a state
// to leave the viewer in — an overlay (scrim + REPLAY, reusing BlackButton
// rather than inventing a second button style) appears over the final frame
// instead of freezing on it. No Figma source for this state — Figma has no
// "ended" variant for a video it can't actually play — so the overlay's
// exact look is this session's own call, built from tokens already in use
// elsewhere on the card (bg-ink/40 dims to grayed-out content, BlackButton
// reads as an action).
export function FeatureVideo({
  video,
  poster,
  alt,
}: {
  video: VideoSource;
  poster: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  function replay() {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  return (
    <div className="relative size-full">
      <video
        ref={videoRef}
        src={video.src}
        poster={poster}
        aria-label={alt}
        controls
        playsInline
        preload="metadata"
        onEnded={() => setEnded(true)}
        onPlay={() => setEnded(false)}
        className="size-full object-cover"
      />
      {ended && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
          <BlackButton onClick={replay}>REPLAY</BlackButton>
        </div>
      )}
    </div>
  );
}
