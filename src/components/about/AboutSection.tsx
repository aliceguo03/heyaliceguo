"use client";

import { AboutFrame } from "./AboutFrame";
import { AboutFallback } from "./AboutFallback";
import { TextColumn } from "./TextColumn";
import { PhotoColumn } from "./PhotoColumn";
import { useAboutPin } from "./useAboutPin";
import { usePrefersReducedMotion, useViewportTooShort } from "@/lib/motion";
import {
  MIN_ABOUT_VIEWPORT_H,
  frameHeightCss,
  photoHeightCss,
  photoWindowCss,
  sectionHeightCss,
  stickyTopCss,
  textWindowCss,
} from "./aboutGeometry";

// The About page's gray frame section (Figma "about scroll section",
// 523:7013) — session 5B's pin. See CLAUDE.md's session-5b plan for the
// full derivation.
//
// Reduced motion, or a viewport shorter than MIN_ABOUT_VIEWPORT_H (the
// frame plus its pin can't fit PHOTO_MIN_H of photo — this is short of the
// 1440x760 reference viewport, so it's normal rendering on some real
// laptops, not just an edge case): no pin, no clip, no transform, no
// listeners — AboutFallback renders instead, reusing the same
// TextBlock/PhotoCaption leaves rather than a second hand-written layout
// for the parts that ARE shared. It is not a compressed version of the
// pinned view — see AboutFallbackRow's own comment.
export function AboutSection() {
  const reducedMotion = usePrefersReducedMotion();
  const tooShort = useViewportTooShort(MIN_ABOUT_VIEWPORT_H);
  const disabled = reducedMotion || tooShort;

  // Always called (rules of hooks) — a no-op internally whenever the
  // fallback below renders instead; see useAboutPin.ts's own comment.
  // currentIndex drives the paragraph reveal AND the photo/counter snap —
  // one value, so they can never disagree about which frame they're on.
  const { sectionRef, wrapperRef, windowRef, contentRef, textY, currentIndex } = useAboutPin(disabled);

  if (disabled) {
    return (
      <div data-testid="about-section-fallback" className="mx-auto max-w-page">
        <AboutFrame>
          <AboutFallback />
        </AboutFrame>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      data-testid="about-section"
      className="relative mx-auto max-w-page"
      style={{ height: sectionHeightCss }}
    >
      {/*
        The sticky wrapper — never a z-index (see AboutFrame.tsx's own
        comment): position: sticky already establishes its own stacking
        context regardless, and adding one here would additionally compare
        this whole subtree against unrelated page-level z-indexes instead
        of falling through as `auto`. Sits OUTSIDE AboutFrame, which is
        overflow-hidden — a sticky child of a clipping ancestor would be
        bounded by it and could never actually pin.
      */}
      <div
        ref={wrapperRef}
        data-testid="about-sticky-wrapper"
        className="sticky"
        style={{ top: stickyTopCss, height: frameHeightCss }}
      >
        <AboutFrame height="100%">
          <TextColumn
            windowHeight={textWindowCss}
            y={textY}
            windowRef={windowRef}
            contentRef={contentRef}
            currentIndex={currentIndex}
          />
          <PhotoColumn windowHeight={photoWindowCss} photoHeight={photoHeightCss} activeIndex={currentIndex} />
        </AboutFrame>
      </div>
    </div>
  );
}
