"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionStyle } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectFrame } from "./ProjectFrame";
import { ProjectTile } from "./ProjectTile";
import { ProjectTileContent } from "./ProjectTileContent";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { usePrefersReducedMotion, useViewportTooShort } from "@/lib/motion";
import type { Project } from "@/content/projects";
import {
  contentClipPath,
  FRAME_H,
  FRAME_PIN,
  GUTTER,
  MIN_VIEWPORT_H,
  NAV_H,
  PITCH,
  SECTION_H,
  STAGE_H,
  TILE_H,
  TILE_INSET_BOTTOM,
  TILE_INSET_TOP,
  TILE_TOP,
  TRAVEL,
} from "./projectGeometry";

// The signature scroll interaction. Rewritten this session — the previous
// version translated the card's *contents* past a fixed clip window in
// lockstep with the gradient strip; see git history for that approach and
// the five defects that made it wrong (the card interrupting the seam,
// the banner painting under the gradient, dead space inside the card, an
// off-center card below the reference width, and a viewport-dependent gap
// to the buttons row).
//
// This version never translates any content. One white card is fixed on
// screen for the whole section and never moves; its four projects' content
// blocks are all laid out statically, at rest, exactly filling it, stacked
// on top of each other and clipped with `clip-path` to the slice of the
// card that currently overlaps that project's gradient frame. Three layers,
// back to front:
//
//   L1  gradient frame strip — translates.
//   L2  the one fixed card — never moves; renders all four content blocks,
//       each clipped to its own visible slice.
//   L3  seam layer — porcelain bands, exactly the frame gutters, at full
//       viewport width, in front of the card. Translates with L1.
//
// (A banner sits above all three, painting over the strip rather than
// under it — see the label markup below.)
//
// L1 and L3 both read their position from ONE custom property, `--strip-y`,
// written by the single motion.div below. That's what guarantees the seam
// inside the card always lands on the same line as the seam behind it: any
// per-frame lag in the write applies to both consumers identically, so the
// seam can't split. Each content layer's `clip-path` (projectGeometry.ts's
// contentClipPath) is plain CSS reading that same property via `calc()` —
// once written to the DOM, the browser keeps it in lockstep with zero
// further JS, the same as L1 and L3's `transform`.
//
// This — one MotionValue driving several elements' position through a
// shared custom property — is CLAUDE.md's one exception to the site's
// no-per-frame-work rule: a shared scroll-position seam is what an
// IntersectionObserver can't express. See the "Video" section below for the
// one additional, narrowly-scoped consumer this design requires: a
// clip-path defeats IntersectionObserver outright (the clipped element's
// own rect never changes), so video play/pause is driven from the same
// value instead, at the same frequency the strip already updates at.
export function ProjectSection({ projects }: { projects: Project[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const tooShort = useViewportTooShort(MIN_VIEWPORT_H);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollAction();

  // Always called (rules of hooks) — inert whenever the fallback below
  // renders instead, since nothing reads `stripY` in that tree.
  //
  // offset ends at a fixed pixel line ("end {STAGE_H}px"), not "end end":
  // progress 1 is defined as "the section's bottom edge reaches the point
  // STAGE_H from the viewport's top" — exactly where the sticky pin
  // naturally releases, given the section's own height is TRAVEL + STAGE_H.
  // That's independent of viewport height entirely, unlike "end end" (which
  // divides by the section height minus whatever the viewport happens to
  // be) — see scripts/verify-project-section.mjs's seam-lockstep check,
  // which is what confirmed this rather than assuming it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", `end ${STAGE_H}px`],
  });
  const stripY = useTransform(scrollYProgress, [0, 1], ["0px", `${-TRAVEL}px`]);

  // Video visibility. clip-path clips paint, not intersection — a video
  // fully wiped by a content layer's clip-path still reports its full,
  // on-screen rect to IntersectionObserver, so it would never pause. Drive
  // play/pause from the same figure the clip-path uses instead: a layer is
  // visible exactly when its clipped height is greater than zero. Recomputed
  // on every `stripY` write (the same frequency L1/L3's transform already
  // updates at) but only committed to React state when the set of visible
  // projects actually changes — at most twice per project transition.
  const [visibleMask, setVisibleMask] = useState(() => visibilityMask(0, projects.length));
  useMotionValueEvent(stripY, "change", (latest) => {
    const px = typeof latest === "number" ? latest : Number.parseFloat(latest);
    const mask = visibilityMask(px, projects.length);
    setVisibleMask((prev) => (prev === mask ? prev : mask));
  });

  // AND-gated with a coarse, ordinary IntersectionObserver on the section
  // itself (never clipped, so this one is exactly what it looks like):
  // `stripY` clamps at -TRAVEL once the section scrolls past and stays
  // there, which would otherwise leave project 4 marked "visible" forever.
  const [sectionOnScreen, setSectionOnScreen] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion || tooShort) return;

    const observer = new IntersectionObserver(([entry]) => setSectionOnScreen(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, tooShort]);

  // Reduced motion: no pin, no clip, no transform — four cards stacked in
  // normal flow, same as before any of this mechanic existed. Too-short
  // viewport: the card plus its pin offset don't fit (projectGeometry.ts,
  // MIN_VIEWPORT_H), so this is also this design's normal rendering on a
  // 13" Air, not just an edge case. Reuses ProjectCard (itself Frame > Tile
  // > Content) rather than a second hand-written layout — no card
  // geometry, styling, or content exists twice between this branch and the
  // mechanic below.
  if (reducedMotion || tooShort) {
    return (
      <div className="px-xl pt-xl pb-lg">
        <div className="mx-auto flex max-w-page flex-col gap-md">
          <ScrollReveal as="div">
            <SectionLabel id="selected-work">SELECTED WORK.</SectionLabel>
          </ScrollReveal>
          <div className="flex flex-col gap-lg">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // All four content layers stay in the DOM and tabbable — never `inert`,
  // which would remove off-window projects from the accessibility tree
  // entirely. Tabbing into one scrolls the section to bring it under the
  // card, so a keyboard user's focus is never on a clipped-away layer. This
  // can't loop: scrolling itself never moves focus (so the scrollTo below
  // can't re-trigger this handler), and re-focusing the layer already
  // showing is a same-index no-op.
  function handleFocusCapture(event: FocusEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-project-index]");
    const section = sectionRef.current;
    if (!target || !section) return;

    const index = Number(target.dataset.projectIndex);
    if (Number.isNaN(index)) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    scrollTo(sectionTop + index * PITCH);
  }

  return (
    <div ref={sectionRef} className="relative mb-lg" style={{ height: SECTION_H }}>
      <motion.div
        className="sticky top-0 overflow-hidden"
        // MotionStyle's own type doesn't list custom properties, but
        // motion/react's DOM writer treats any "--"-prefixed key as a CSS
        // variable and writes a bound MotionValue to it every frame exactly
        // like any other style value — this is the one write --strip-y
        // ever gets; the cast is only papering over a type gap, not a
        // runtime one.
        style={{ height: STAGE_H, "--strip-y": stripY } as MotionStyle}
      >
        {/* L1 — gradient frame strip. Real frame elements, real gutters —
            only this column's own transform is driven by --strip-y; each
            frame's own layout (width, radius, gradient image) is
            untouched. */}
        <div className="absolute inset-x-0 px-xl" style={{ top: FRAME_PIN, zIndex: 10 }}>
          <div className="mx-auto max-w-page" style={{ transform: "translate3d(0, var(--strip-y), 0)" }}>
            {projects.map((project, i) => (
              <div
                key={project.slug}
                data-project-frame={i}
                style={{ marginTop: i === 0 ? 0 : GUTTER }}
              >
                <ProjectFrame color={project.color} gradient={project.gradient} />
              </div>
            ))}
          </div>
        </div>

        {/* L2 — the one fixed card. Centered by flexbox against the full
            stage width (== viewport width, since the stage has no
            max-width of its own) rather than any pixel offset against a
            reference width — card center equals viewport center at any
            width. All four content layers live inside, each clipped to its
            own visible slice; content itself never translates. */}
        <div className="absolute inset-0 flex justify-center" style={{ zIndex: 20 }} onFocusCapture={handleFocusCapture}>
          <ProjectTile
            padded={false}
            clip
            data-testid="project-card"
            style={{ marginTop: TILE_TOP }}
          >
            {projects.map((project, i) => (
              <div
                key={project.slug}
                data-project-index={i}
                className="absolute inset-0"
                style={{ clipPath: contentClipPath(i) }}
              >
                <ProjectTile chrome={false}>
                  <ProjectTileContent project={project} visible={sectionOnScreen && isVisible(visibleMask, i)} />
                </ProjectTile>
              </div>
            ))}
          </ProjectTile>
        </div>

        {/* L3 — seam layer. Renders only the gutters, as porcelain bands
            spanning the full viewport width, front-most in the section —
            in front of the card, so the seam is never interrupted by it.
            Same --strip-y transform as L1: the two can't drift apart. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{ top: FRAME_PIN, zIndex: 30, transform: "translate3d(0, var(--strip-y), 0)" }}
        >
          {projects.slice(0, -1).map((project, i) => (
            <div
              key={project.slug}
              data-seam-band={i}
              className="absolute inset-x-0 bg-porcelain"
              style={{ top: i * PITCH + FRAME_H, height: GUTTER }}
            />
          ))}
        </div>

        {/* L4 — banner. A sticky white band above both the strip and the
            seam layer, not layered under the gradient the way Figma's flat
            static layout would suggest — depth here is spec, not Figma
            (see CLAUDE.md). */}
        <div className="absolute inset-x-0 top-0 bg-porcelain" style={{ height: FRAME_PIN, zIndex: 40 }}>
          <div className="relative mx-auto h-full max-w-page px-xl">
            <div className="absolute inset-x-0" style={{ top: NAV_H }}>
              <ScrollReveal as="div">
                <SectionLabel id="selected-work">SELECTED WORK.</SectionLabel>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Bit `i` set means project `i`'s clipped height (per contentClipPath's own
// math, kept in sync with it deliberately) is greater than zero at this
// stripY. Kept as a plain function rather than a component/hook: it's pure
// arithmetic over constants, called from a MotionValue event handler and
// once for initial state, not from render.
function visibilityMask(stripY: number, count: number): number {
  let mask = 0;
  for (let i = 0; i < count; i++) {
    const s = i * PITCH + stripY;
    const topInset = Math.max(0, s - TILE_INSET_TOP);
    const bottomInset = Math.max(0, -s - TILE_INSET_BOTTOM);
    const visibleHeight = TILE_H - topInset - bottomInset;
    if (visibleHeight > 0) mask |= 1 << i;
  }
  return mask;
}

function isVisible(mask: number, i: number): boolean {
  return (mask & (1 << i)) !== 0;
}
