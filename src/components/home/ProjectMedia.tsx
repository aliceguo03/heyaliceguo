"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// The source recordings carry a thin window-chrome border. ~20px is cropped
// from each edge of the 1035px-wide media well by scaling the video up
// slightly inside its (already overflow-hidden) well. Not a design token —
// recording artifact correction, same treatment as the geometry consts in
// ProjectCard. Static images have no such border and are left unscaled.
const VIDEO_ZOOM = 1.04;

// Fills the project card's media well (I441:5988;439:5398). Falls back to a
// static image when no video is given. When a video is given, playback is
// driven entirely by an IntersectionObserver — play on enter, pause on exit —
// rather than the `autoPlay` attribute, so `prefers-reduced-motion` can be
// checked before a single frame plays instead of racing a browser-started
// video. Under reduced motion, no observer is created at all: the poster is
// the final state.
export function ProjectMedia({
  thumbnail,
  video,
  alt,
}: {
  thumbnail: string;
  video?: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [video]);

  if (!video) {
    return (
      <Image
        src={thumbnail}
        alt={alt}
        fill
        sizes="1035px"
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
