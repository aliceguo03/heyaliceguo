"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionStyle } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectFrame } from "./ProjectFrame";
import { ProjectTile } from "./ProjectTile";
import { ProjectTileContent } from "./ProjectTileContent";
import { useProjectSnap } from "./useProjectSnap";
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

  // Always called (rules of hooks) — a no-op internally, attaching zero
  // listeners, whenever the static fallback below renders instead (see the
  // hook's own top guard).
  useProjectSnap(sectionRef, reducedMotion || tooShort);

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

  // Visibility, two thresholds from the one `visibleHeight` this already
  // computed for video. `partial` (>0, the original mask) still gates video
  // play/pause. `full` (>=TILE_H) is new: a project's CTA is only
  // magnet-eligible while its whole frame — not just a sliver — is under the
  // card, so a button doesn't start pulling while it's still mid-clip. The
  // geometry makes `full` hold across s ∈ [-60, +60] inside the 810px pitch
  // (projectGeometry.ts's TILE_INSET_TOP/BOTTOM, both 60), so at rest exactly
  // one card CTA is ever magnet-eligible and mid-transition none are.
  //
  // Both masks are recomputed on every `stripY` write (the same frequency
  // L1/L3's transform already updates at) but committed to React state
  // together, only when either actually changes — at most twice per project
  // transition, same as before this was two masks instead of one.
  const [visMask, setVisMask] = useState(() => visibilityMasks(0, projects.length));
  useMotionValueEvent(stripY, "change", (latest) => {
    const px = typeof latest === "number" ? latest : Number.parseFloat(latest);
    const next = visibilityMasks(px, projects.length);
    setVisMask((prev) => (prev.partial === next.partial && prev.full === next.full ? prev : next));
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
            untouched.
            The outer div is unbounded height (as before) — the sticky
            stage's own overflow-hidden + STAGE_H already clips it, that
            part is unchanged. The new piece is the inner viewport: fixed to
            exactly FRAME_H tall, overflow-hidden, rounded-card on all four
            corners. Whatever's at that box's own top/bottom edge — a
            frame's actual corner at rest, or a bare slice of a frame's flat
            body mid-transition — gets clipped to the same convex curve, so
            the strip's visible boundary is rounded at any scroll position,
            not just at rest. ProjectFrame's own rounding (all corners, see
            its own comment) is a second, independent thing: it shapes the
            gutter *between* frames, which this outer mask never touches
            since gutters sit in the interior, not at this box's edge,
            except for one narrow instant per transition — see the seam
            layer's comment below for why that instant isn't a problem. */}
        <div className="absolute inset-x-0 px-xl" style={{ top: FRAME_PIN, height: FRAME_H, zIndex: 10 }}>
          <div className="mx-auto h-full max-w-page overflow-hidden rounded-card">
            <div style={{ transform: "translate3d(0, var(--strip-y), 0)" }}>
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
                  <ProjectTileContent
                    project={project}
                    visible={sectionOnScreen && isVisible(visMask.partial, i)}
                    magnetEnabled={sectionOnScreen && isVisible(visMask.full, i)}
                  />
                </ProjectTile>
              </div>
            ))}
          </ProjectTile>
        </div>

        {/* L3 — seam layer. Renders only the gutters, as porcelain bands
            spanning the full viewport width, front-most in the section —
            in front of the card, so the seam is never interrupted by it.
            Same --strip-y transform as L1: the two can't drift apart.
            Sits entirely outside L1's rounded viewport mask (unclipped, own
            z-index above the card) — it has to: the mask must stay behind
            the card (z-20) so the fixed tile can paint over the strip, but
            this seam must stay in front of the card, so the two can't share
            one clipped container. Checked, not assumed, that this doesn't
            square off the mask's rounded corners: a band's own rect (top:
            i*PITCH+FRAME_H, height: GUTTER) sits exactly in a frame gap, so
            it never overlaps actual frame pixels regardless of the mask.
            The one moment a band does reach this box's top/bottom edge —
            a few px into a transition, as a gutter crosses the boundary —
            the mask's cutout there was only ever revealing porcelain
            background (body/html's own bg-porcelain, globals.css), the same
            color this band paints. A rounded cut and a square cut of an
            identical color are indistinguishable, so there's nothing to see
            regardless of which one "wins" at that instant. Verified with
            screenshots through that exact window, not inferred. */}
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
            (see CLAUDE.md).
            Outer/inner split mirrors L1's exactly (px-xl on the outer,
            mx-auto max-w-page on the inner, nothing else) rather than a
            parallel calculation — the inner div is what the strip and card
            both resolve their own centering against, so this is the same
            centering, not one that happens to agree at 1710px and drifts
            below it. A plain rectangle — no corner rounding here. A convex
            rounded corner where the strip emerges from beneath it can't come
            from rounding this straight edge (that only ever cuts a concave
            notch); it comes from L1's own rounded overflow-hidden viewport
            instead (see L1's comment above).
            Outside that inner box, y < FRAME_PIN has no L1/L2/L3 content at
            any width, so leaving it uncovered here just falls through to
            the page's own porcelain background — same color, no seam. */}
        <div className="absolute inset-x-0 top-0 px-xl" style={{ height: FRAME_PIN, zIndex: 40 }}>
          <div className="relative mx-auto h-full max-w-page bg-porcelain">
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

// Bit `i` of `partial` set means project `i`'s clipped height (per
// contentClipPath's own math, kept in sync with it deliberately) is greater
// than zero at this stripY; bit `i` of `full` means that height equals
// TILE_H — the whole card, not a sliver. Kept as a plain function rather than
// a component/hook: it's pure arithmetic over constants, called from a
// MotionValue event handler and once for initial state, not from render.
function visibilityMasks(stripY: number, count: number): { partial: number; full: number } {
  let partial = 0;
  let full = 0;
  for (let i = 0; i < count; i++) {
    const s = i * PITCH + stripY;
    const topInset = Math.max(0, s - TILE_INSET_TOP);
    const bottomInset = Math.max(0, -s - TILE_INSET_BOTTOM);
    const visibleHeight = TILE_H - topInset - bottomInset;
    if (visibleHeight > 0) partial |= 1 << i;
    if (visibleHeight >= TILE_H) full |= 1 << i;
  }
  return { partial, full };
}

function isVisible(mask: number, i: number): boolean {
  return (mask & (1 << i)) !== 0;
}
