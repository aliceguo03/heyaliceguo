"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CONTENT_W } from "./projectGeometry";

// The source recordings carry a thin window-chrome border. ~20px is cropped
// from each edge of the media well by scaling the video up slightly inside
// its (already overflow-hidden) well. Not a design token — recording
// artifact correction, same treatment as the geometry consts in
// ProjectCard. Static images have no such border and are left unscaled.
const VIDEO_ZOOM = 1.04;

// Fills the project card's media well (I441:5988;439:5398). Falls back to a
// static image when no video is given. When a video is given, playback is
<<<<<<< Updated upstream
// driven entirely by an IntersectionObserver — play on enter, pause on exit —
// rather than the `autoPlay` attribute, so `prefers-reduced-motion` can be
// checked before a single frame plays instead of racing a browser-started
// video. Under reduced motion, no observer is created at all: the poster is
// the final state.
=======
// gated by visibility — play on screen, pause off screen.
//
// Two ways a caller determines "on screen," selected by whether `visible`
// is passed:
//
// - Undefined (the normal-flow fallback, ProjectCard.tsx): this component
//   owns the gate itself, via a single IntersectionObserver on the video —
//   `intersectionRatio > 0` rather than `isIntersecting`, because an
//   element whose rect exactly abuts a clip boundary reports
//   `isIntersecting: true` at `ratio: 0`.
// - A boolean (the fixed-card mechanic, ProjectSection.tsx): the caller
//   owns the gate instead, because visibility there comes from a
//   `clip-path` — a video clipped that way keeps its full, on-screen rect
//   and an IntersectionObserver never fires (verified in Chromium, not
//   assumed from spec). ProjectSection computes the same visible-height
//   figure its clip-path uses and passes the result straight through, so
//   there is one definition of "visible," not two.
//
// Not verified in WebKit/Firefox — those binaries aren't in this project's
// Playwright cache.
//
// autoPlay is not used, so `prefers-reduced-motion` is checked before a
// single frame plays rather than racing a browser-started video. Under
// reduced motion, no observer is created at all: the poster is the final
// state.
>>>>>>> Stashed changes
export function ProjectMedia({
  thumbnail,
  video,
  alt,
  visible,
}: {
  thumbnail: string;
  video?: string;
  alt: string;
  visible?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
<<<<<<< Updated upstream
=======
  const [observedOnScreen, setObservedOnScreen] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    if (!video) return;
    if (visible !== undefined) return; // caller owns the gate — see comment above
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
<<<<<<< Updated upstream
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
=======
      ([entry]) => setObservedOnScreen(entry.intersectionRatio > 0),
>>>>>>> Stashed changes
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [video, visible]);

  const onScreen = visible ?? observedOnScreen;

<<<<<<< Updated upstream
=======
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;

    if (onScreen) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [onScreen, video]);

>>>>>>> Stashed changes
  if (!video) {
    return (
      <Image
        src={thumbnail}
        alt={alt}
        fill
        sizes={`${CONTENT_W}px`}
        className="object-cover"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={video}
      poster={thumbnail}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="metadata"
      className="size-full object-cover"
      style={{ transform: `scale(${VIDEO_ZOOM})` }}
    />
  );
}
