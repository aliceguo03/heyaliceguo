"use client";

import { AboutFrame } from "./AboutFrame";
import { AboutFallback } from "./AboutFallback";
import { TextColumn } from "./TextColumn";
import { PhotoColumn } from "./PhotoColumn";
import { useAboutPin } from "./useAboutPin";
import { useAboutGeometry } from "./useAboutGeometry";
import { usePrefersReducedMotion } from "@/lib/motion";
import { BOTTOM_GAP } from "./aboutGeometry";

// The About page's gray frame section (Figma "about scroll section",
// 523:7013 desktop / 1045:9704 tablet). See CLAUDE.md's "session-5b" plan
// for the pin's original derivation, and the tablet-pin-reflow session's
// own plan for how it now generalizes to a second tier.
//
// Tablet pin reflow session: the gate used to be a flat
// `useViewportBelow(MIN_ABOUT_VIEWPORT_H, MIN_MECHANIC_VIEWPORT_W)` —
// reduced motion, a viewport shorter than a single flat height threshold,
// or narrower than 1440px, all routed to the SAME AboutFallback. Now:
//
// - geo.tier === "phone" (< --breakpoint-about, 980px): a genuinely
//   different mechanism (no pin at all — stacked pairs with a
//   reading-line spotlight, mobile spotlight session), not a fallback of
//   this one. AboutFallback's own phone-tier branch is About's real phone
//   layout; `reducedMotion` is threaded down to it so it can gate the
//   spotlight specifically (every pair renders filled under reduced
//   motion — see that file's own comment) while still using AboutFallback
//   for the actual DOM/layout either way.
// - tablet/desktop, but reduced motion or geo.svh < geo.MIN_VIEWPORT_H
//   (the exact viewport height this tier's own photo-at-this-width, pill,
//   and frame padding need — see aboutGeometry.ts's minViewportH): the
//   same AboutFallback, at this tier's own real numbers instead of a flat
//   per-tier constant.
// - tablet/desktop, otherwise: the pin, at this tier's own geometry.
//
// MIN_MECHANIC_VIEWPORT_W (lib/motion.ts) no longer governs this page —
// About is the second mechanic (after ProjectSection) to retire it in
// favor of real tiered geometry; nothing on this page imports it anymore.
export function AboutSection() {
  const reducedMotion = usePrefersReducedMotion();
  const geo = useAboutGeometry();
  const tooShort = geo.svh < geo.MIN_VIEWPORT_H;
  const disabled = geo.tier === "phone" || reducedMotion || tooShort;

  // Always called (rules of hooks) — a no-op internally whenever the
  // fallback below renders instead; see useAboutPin.ts's own comment.
  // currentIndex drives the paragraph reveal AND the photo/counter snap —
  // one value, so they can never disagree about which frame they're on.
  const { sectionRef, wrapperRef, windowRef, contentRef, textY, currentIndex } = useAboutPin(disabled);

  if (disabled) {
    return (
      <div data-testid="about-section-fallback" className="mx-auto max-w-page">
        <AboutFrame>
          <AboutFallback geo={geo} reducedMotion={reducedMotion} />
        </AboutFrame>
      </div>
    );
  }

  // Both numeric now (geo.FRAME_H, geo.svh) rather than CSS calc strings —
  // useAboutGeometry already tracks 100svh reactively (its own probe +
  // ResizeObserver), so there's no need for the browser to re-derive this
  // from a var()/calc() chain the way the pre-tier version did. Same
  // SSR-assumes-desktop tradeoff ProjectSection's own geometry hook
  // already accepts (a non-desktop-tier or short visitor's first paint
  // uses the desktop-reference numbers, corrected one client render later)
  // — not a new risk this session introduces.
  const stickyTop = geo.svh - BOTTOM_GAP - geo.FRAME_H;

  return (
    <div
      ref={sectionRef}
      data-testid="about-section"
      className="relative mx-auto max-w-page"
      style={{ height: `calc(${geo.FRAME_H}px + max(0px, var(--about-pin-scroll, ${geo.PIN_SCROLL_ESTIMATE}px)))` }}
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
        style={{ top: stickyTop, height: geo.FRAME_H }}
      >
        <AboutFrame height="100%">
          <TextColumn
            geo={geo}
            y={textY}
            windowRef={windowRef}
            contentRef={contentRef}
            currentIndex={currentIndex}
          />
          <PhotoColumn geo={geo} activeIndex={currentIndex} />
        </AboutFrame>
      </div>
    </div>
  );
}
