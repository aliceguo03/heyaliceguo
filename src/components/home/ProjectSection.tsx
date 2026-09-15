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
import { usePrefersReducedMotion, useViewportBelow, MIN_MECHANIC_VIEWPORT_W } from "@/lib/motion";
import type { Project } from "@/content/projects";
import {
  BUFFER,
  contentClipPath,
  CONTENT_INSET_BOTTOM,
  CONTENT_INSET_TOP,
  FRAME_H,
  FRAME_PIN,
  FRAME_STRIP_H,
  GUTTER,
  MIN_VIEWPORT_H,
  NAV_H,
  PITCH,
  SECTION_H,
  STAGE_H,
  TILE_H,
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
  const tooSmall = useViewportBelow(MIN_VIEWPORT_H, MIN_MECHANIC_VIEWPORT_W);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollAction();

  // Always called (rules of hooks) — a no-op internally, attaching zero
  // listeners, whenever the static fallback below renders instead (see the
  // hook's own top guard).
  useProjectSnap(sectionRef, reducedMotion || tooSmall);

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
  // geometry makes `full` hold across s ∈ [-260, +260] inside the 1210px
  // pitch (projectGeometry.ts's CONTENT_INSET_TOP/BOTTOM, both 60+BUFFER —
  // widened this session, on purpose: the same dwell that keeps content
  // unclipped longer also keeps a CTA magnet-eligible longer), so at rest
  // exactly one card CTA is ever magnet-eligible and mid-transition none are.
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
  //
  // Defaults false, not true: project 0's `s` is exactly 0 at stripY=0 (the
  // page-load rest state, before any scroll), so visibilityMasks() already
  // marks it "partial visible" from the very first render regardless of
  // this flag. An optimistic `true` default here used to combine with that
  // to make project 0's video (and CTA magnet) look on-screen and eligible
  // before this effect's IntersectionObserver ever got to fire its first,
  // asynchronous callback — child effects (ProjectMedia's play/pause) run
  // before this parent effect on the same mount, so the race was real, not
  // hypothetical. `false` costs one corrected frame on every load instead
  // (section starts "not confirmed on screen" until the observer says
  // otherwise), which is invisible for both consumers: no video plays a
  // frame early, and no cursor is ever already sitting on a CTA at t=0 to
  // notice a one-frame magnet-eligibility delay.
  const [sectionOnScreen, setSectionOnScreen] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion || tooSmall) return;

    // `entry.intersectionRatio > 0`, not `entry.isIntersecting` — the same
    // quirk ProjectMedia.tsx's own observer already guards against: an
    // element whose top edge exactly abuts the viewport's bottom edge
    // reports `isIntersecting: true` at `ratio: 0`. That abutment isn't a
    // corner case here — it's this page's *normal* rest layout: the hero
    // is built to `min-height: 100svh` (CLAUDE.md's viewport-fill rule), so
    // on first load, on almost any real viewport, this section's top edge
    // sits exactly at the viewport's bottom edge. Verified via a temporary
    // console.log, not assumed: `isIntersecting` really does read `true`
    // (ratio 0) in that state, which is what let the video play right
    // through the whole "section not actually on screen" window instead of
    // just for one corrected frame.
    // threshold: [0, 0.01], not a single `0` — verified (not assumed) that
    // a single-value-0 observer on this element stops delivering any
    // notification after its initial callback, even once later scrolled to
    // 100% overlap; adding one more, non-zero threshold value made the same
    // element's observer refire correctly on every crossing. This is still
    // exactly "was there any overlap at all" for the callback below (still
    // gated on `intersectionRatio > 0`) — the extra value is what makes
    // Chromium actually keep recomputing, not a change in what counts as
    // "on screen."
    const observer = new IntersectionObserver(
      ([entry]) => setSectionOnScreen(entry.intersectionRatio > 0),
      { threshold: [0, 0.01] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, tooSmall]);

  // Reduced motion: no pin, no clip, no transform — four cards stacked in
  // normal flow, same as before any of this mechanic existed. Too-small
  // viewport: either the card plus its pin offset don't fit
  // (projectGeometry.ts, MIN_VIEWPORT_H — this is also this design's normal
  // rendering on a 13" Air, not just an edge case), or the viewport is
  // narrower than MIN_MECHANIC_VIEWPORT_W (lib/motion.ts) — a stopgap so a
  // phone or tablet doesn't run this desktop mechanic in a space far
  // narrower than it was built for, ahead of a later session's fluid
  // geometry. Renders ProjectCard, which inlines its own frame/panel/
  // content markup rather than composing ProjectFrame/ProjectTile/
  // ProjectTileContent (the mechanic below does compose those three) — a
  // stale claim of full leaf-sharing lived here before Session R1.1 Part C;
  // ProjectCard.tsx's own header explains why it's a separate, fluid-scale
  // stopgap instead.
  //
  // sectionRef still lands on this branch's own root, even though nothing
  // here reads stripY. useScroll (above, unconditionally called — rules of
  // hooks) throws "Target ref is defined but not hydrated" if its target
  // mounts pointing at nothing: harmless on a hard load (SSR/hydration both
  // guess the mechanic branch per useViewportBelow's getServerSnapshot, so
  // the ref attaches once before this branch can ever render), but real on
  // a client-side navigation that mounts straight into this branch — e.g.
  // /about -> / below MIN_MECHANIC_VIEWPORT_W. Attaching the ref here is a
  // no-op for this tree's own rendering and costs nothing.
  if (reducedMotion || tooSmall) {
    return (
      <div ref={sectionRef} className="px-page-x pt-xl pb-lg">
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
            layer's comment below for why that instant isn't a problem.
            Session gradient-extend: each ProjectFrame here is FRAME_STRIP_H
            tall now (FRAME_H core + BUFFER buffer on each edge), not FRAME_H
            — this mask's own height stays FRAME_H, so it shows only the
            centered core slice of whatever frame currently lines up, same as
            before. The translated column itself carries a static
            marginTop: -BUFFER, unrelated to the --strip-y transform: without
            it, project i's core would sit BUFFER below where i*PITCH expects
            it (since the core sits BUFFER into each taller element, not at
            its top edge), which would desync every rest position from
            useProjectSnap's i*PITCH slots and from contentClipPath's `s`.
            This offset is what keeps that alignment exact. */}
        <div className="absolute inset-x-0 px-page-x" style={{ top: FRAME_PIN, height: FRAME_H, zIndex: 10 }}>
          <div className="mx-auto h-full max-w-page overflow-hidden rounded-card">
            <div style={{ transform: "translate3d(0, var(--strip-y), 0)", marginTop: -BUFFER }}>
              {projects.map((project, i) => (
                <div
                  key={project.slug}
                  data-project-frame={i}
                  style={{ marginTop: i === 0 ? 0 : GUTTER }}
                >
                  <ProjectFrame color={project.color} gradient={project.gradient} height={FRAME_STRIP_H} />
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
            i*PITCH+FRAME_H+BUFFER, height: GUTTER — the +BUFFER is new this
            session: each strip element now runs BUFFER px past FRAME_H
            before the real gutter starts, see FRAME_STRIP_H) sits exactly in
            a frame gap, so it never overlaps actual frame pixels regardless
            of the mask.
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
              style={{ top: i * PITCH + FRAME_H + BUFFER, height: GUTTER }}
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
        <div className="absolute inset-x-0 top-0 px-page-x" style={{ height: FRAME_PIN, zIndex: 40 }}>
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
    const topInset = Math.max(0, s - CONTENT_INSET_TOP);
    const bottomInset = Math.max(0, -s - CONTENT_INSET_BOTTOM);
    const visibleHeight = TILE_H - topInset - bottomInset;
    if (visibleHeight > 0) partial |= 1 << i;
    if (visibleHeight >= TILE_H) full |= 1 << i;
  }
  return { partial, full };
}

function isVisible(mask: number, i: number): boolean {
  return (mask & (1 << i)) !== 0;
}
