"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionStyle } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardTablet } from "./ProjectCardTablet";
import { ProjectCardPhone } from "./ProjectCardPhone";
import { ProjectFrame } from "./ProjectFrame";
import { ProjectTile } from "./ProjectTile";
import { ProjectTileContent } from "./ProjectTileContent";
import { ProjectTileContentTablet } from "./ProjectTileContentTablet";
import { ProjectTileContentPhone } from "./ProjectTileContentPhone";
import { useProjectGeometry } from "./useProjectGeometry";
import { useProjectSnap } from "./useProjectSnap";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { usePrefersReducedMotion, useViewportBelow } from "@/lib/motion";
import type { Project } from "@/content/projects";
import { contentClipPath, MIN_MECHANIC_FLOOR_W, NAV_H, type ProjectGeometry, type ProjectTier } from "./projectGeometry";

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
//
// Session R4a: every geometric value this file reads (FRAME_H, GUTTER,
// BUFFER, PITCH, TRAVEL, TILE_W/H, STAGE_H, SECTION_H, ...) used to be a
// flat module-scope constant, correct only at the 1710px reference width.
// This file now runs the same mechanic at every tier the geometry can
// support, reading `geo` (projectGeometry.ts's geometryFor, via
// useProjectGeometry) instead — see that module's own header comment for
// the full model. The three content leaves below (ProjectTileContent /
// -Tablet / -Phone) are otherwise identical in contract (project, visible,
// magnetEnabled); `CONTENT_FOR` picks the right one by tier so this file
// never branches on tier more than once per render.
const CONTENT_FOR: Record<
  ProjectTier,
  (props: { project: Project; visible?: boolean; magnetEnabled?: boolean }) => React.JSX.Element
> = {
  phone: ProjectTileContentPhone,
  tablet: ProjectTileContentTablet,
  desktop: ProjectTileContent,
};

// The mechanic's own per-tier tile styling — NOT shared with the fallback
// cards (ProjectCard*.tsx keep their own independent, already-correct
// inline classes; see those files' own comments for why). This is purely
// how ProjectTile.tsx's tier-agnostic width/height/radius/padding/gap
// props get filled in here, mirroring each tier's own card design:
//   - phone: rounded-card on BOTH frame and card (931:4274's own bug-fix
//     pass, ProjectCardPhone.tsx), px-md/py-md, gap-sm.
//   - tablet: rounded-panel (desktop's own pairing, kept — 931:4275's own
//     literal frame-30/card-20 reading was a hand-typed slip in the mock,
//     confirmed with Alice; see ProjectCardTablet.tsx), p-lg, gap-md.
//   - desktop: unchanged from before this session — rounded-panel,
//     px-xl/py-lg, gap-lg (ProjectTile.tsx's own defaults).
const TILE_STYLE_FOR: Record<ProjectTier, { radiusClass: string; paddingClass: string; gapClass: string }> = {
  phone: { radiusClass: "rounded-card", paddingClass: "px-md py-md", gapClass: "gap-sm" },
  tablet: { radiusClass: "rounded-panel", paddingClass: "p-lg", gapClass: "gap-md" },
  desktop: { radiusClass: "rounded-panel", paddingClass: "px-xl py-lg", gapClass: "gap-lg" },
};

export function ProjectSection({ projects }: { projects: Project[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const geo = useProjectGeometry();
  // tooSmall's height threshold is the CURRENT geometry's own
  // MIN_VIEWPORT_H (tier-dependent — see projectGeometry.ts) rather than a
  // single flat number; its width threshold, MIN_MECHANIC_FLOOR_W, is the
  // one genuinely new floor this session adds — below it the mechanic
  // can't hold a non-wrapping phone tile at all (see that constant's own
  // comment in projectGeometry.ts for the measurement behind it).
  // MIN_MECHANIC_VIEWPORT_W (lib/motion.ts, 1440) stays exported and
  // documented but is deliberately unused here now — see CLAUDE.md's
  // "Deferred work" and the R4a plan for why restoring it is meant to stay
  // a one-line revert, not a re-derivation, if this doesn't survive
  // physical review.
  const tooSmall = useViewportBelow(geo.MIN_VIEWPORT_H, MIN_MECHANIC_FLOOR_W);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollAction();

  // Always called (rules of hooks) — a no-op internally, attaching zero
  // listeners, whenever the static fallback below renders instead (see the
  // hook's own top guard).
  useProjectSnap(sectionRef, reducedMotion || tooSmall, geo);

  // Always called (rules of hooks) — inert whenever the fallback below
  // renders instead, since nothing reads `stripY` in that tree.
  //
  // offset ends at a fixed pixel line ("end {geo.STAGE_H}px"), not "end
  // end": progress 1 is defined as "the section's bottom edge reaches the
  // point geo.STAGE_H from the viewport's top" — exactly where the sticky
  // pin naturally releases, given the section's own height is
  // geo.TRAVEL + geo.STAGE_H. That's independent of viewport height
  // entirely, unlike "end end" — see scripts/verify-project-section.mjs's
  // seam-lockstep check, which is what confirmed this rather than assuming
  // it. motion/react's useScroll re-subscribes whenever this offset string
  // changes (its own effect deps include JSON.stringify(options.offset) —
  // verified against node_modules/framer-motion's source, not assumed), so
  // a tier or height change that moves geo.STAGE_H correctly restarts the
  // scroll tracking with the new value rather than tracking a stale one.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", `end ${geo.STAGE_H}px`],
  });
  const stripY = useTransform(scrollYProgress, [0, 1], ["0px", `${-geo.TRAVEL}px`]);

  // Visibility, two thresholds from the one `visibleHeight` this already
  // computed for video. `partial` (>0, the original mask) still gates video
  // play/pause. `full` (>=geo.TILE_H) is new: a project's CTA is only
  // magnet-eligible while its whole frame — not just a sliver — is under the
  // card, so a button doesn't start pulling while it's still mid-clip. The
  // geometry makes `full` hold across a fixed-width window centered on each
  // rest slot (projectGeometry.ts's CONTENT_INSET_TOP/BOTTOM, both
  // TILE_INSET + BUFFER), so at rest exactly one card CTA is ever
  // magnet-eligible and mid-transition none are.
  //
  // Both masks are recomputed on every `stripY` write (the same frequency
  // L1/L3's transform already updates at) but committed to React state
  // together, only when either actually changes — at most twice per project
  // transition, same as before this was two masks instead of one.
  const [visMask, setVisMask] = useState(() => visibilityMasks(0, projects.length, geo));
  useMotionValueEvent(stripY, "change", (latest) => {
    const px = typeof latest === "number" ? latest : Number.parseFloat(latest);
    const next = visibilityMasks(px, projects.length, geo);
    setVisMask((prev) => (prev.partial === next.partial && prev.full === next.full ? prev : next));
  });

  // AND-gated with a coarse, ordinary IntersectionObserver on the section
  // itself (never clipped, so this one is exactly what it looks like):
  // `stripY` clamps at -geo.TRAVEL once the section scrolls past and stays
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
  // viewport: either the card plus its pin offset don't fit for the
  // current tier (projectGeometry.ts, geo.MIN_VIEWPORT_H), or the viewport
  // is narrower than MIN_MECHANIC_FLOOR_W (the phone tile's own
  // non-wrapping floor) — see that constant's comment.
  //
  // Session R3: which card this fallback renders steps by width, per its
  // own dedicated Figma mocks (988:7226/988:7296 phone, 988:7459/988:7539
  // tablet — see the R3 plan doc for the diagnostic confirming these are
  // the flat static fallback, not a frame of the mechanic below). Session
  // R4a re-derives which card from `geo.tier` directly instead of two
  // separate useViewportBelow calls — one tier definition (tierFor,
  // projectGeometry.ts), not two independently-maintained boundary checks
  // that happened to agree. All three — ProjectCardPhone, ProjectCardTablet,
  // ProjectCard — inline their own frame/panel markup rather than composing
  // ProjectFrame/ProjectTile (the mechanic below does compose those); each
  // now renders its own tier's content component
  // (ProjectTileContentPhone/-Tablet, or ProjectTileContent for desktop)
  // for its interior, which the mechanic reuses too — see those files. The
  // section's own vertical rhythm between cards steps too — gap-md (20,
  // per every mock) below desktop, gap-lg (30) at desktop, unchanged from
  // before this session.
  //
  // sectionRef still lands on this branch's own root, even though nothing
  // here reads stripY. useScroll (above, unconditionally called — rules of
  // hooks) throws "Target ref is defined but not hydrated" if its target
  // mounts pointing at nothing: harmless on a hard load (SSR/hydration both
  // guess the mechanic branch per useViewportBelow's getServerSnapshot, so
  // the ref attaches once before this branch can ever render), but real on
  // a client-side navigation that mounts straight into this branch — e.g.
  // /about -> / below MIN_MECHANIC_FLOOR_W. Attaching the ref here is a
  // no-op for this tree's own rendering and costs nothing.
  if (reducedMotion || tooSmall) {
    const CardComponent =
      geo.tier === "phone" ? ProjectCardPhone : geo.tier === "tablet" ? ProjectCardTablet : ProjectCard;
    return (
      <div ref={sectionRef} className="px-page-x pt-xl pb-lg">
        <div className="mx-auto flex max-w-page flex-col gap-md">
          <ScrollReveal as="div">
            <SectionLabel id="selected-work">SELECTED WORK.</SectionLabel>
          </ScrollReveal>
          <div className={`flex flex-col ${geo.tier === "desktop" ? "gap-lg" : "gap-md"}`}>
            {projects.map((project) => (
              <CardComponent key={project.slug} project={project} />
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
    scrollTo(sectionTop + index * geo.PITCH);
  }

  const Content = CONTENT_FOR[geo.tier];
  const tileStyle = TILE_STYLE_FOR[geo.tier];

  return (
    <div ref={sectionRef} className="relative mb-lg" style={{ height: geo.SECTION_H }}>
      <motion.div
        className="sticky top-0 overflow-hidden"
        // MotionStyle's own type doesn't list custom properties, but
        // motion/react's DOM writer treats any "--"-prefixed key as a CSS
        // variable and writes a bound MotionValue to it every frame exactly
        // like any other style value — this is the one write --strip-y
        // ever gets; the cast is only papering over a type gap, not a
        // runtime one.
        style={{ height: geo.STAGE_H, "--strip-y": stripY } as MotionStyle}
      >
        {/* L1 — gradient frame strip. Real frame elements, real gutters —
            only this column's own transform is driven by --strip-y; each
            frame's own layout (width, radius, gradient image) is
            untouched.
            The outer div is unbounded height (as before) — the sticky
            stage's own overflow-hidden + geo.STAGE_H already clips it,
            that part is unchanged. The new piece is the inner viewport:
            fixed to exactly geo.FRAME_H tall, overflow-hidden,
            rounded-card on all four corners. Whatever's at that box's own
            top/bottom edge — a frame's actual corner at rest, or a bare
            slice of a frame's flat body mid-transition — gets clipped to
            the same convex curve, so the strip's visible boundary is
            rounded at any scroll position, not just at rest. This mask's
            own rounding is always rounded-card regardless of tier — it
            shapes the OUTER strip boundary, which Figma draws as
            rounded-card at every one of the fallback cards' own frames
            too (931:4274, 931:4275, 441:5987 all agree on this), unlike
            the per-tier radius swap that only applies to the white tile
            inside (TILE_STYLE_FOR above). ProjectFrame's own rounding (all
            corners, see its own comment) is a second, independent thing:
            it shapes the gutter *between* frames, which this outer mask
            never touches since gutters sit in the interior, not at this
            box's edge, except for one narrow instant per transition — see
            the seam layer's comment below for why that instant isn't a
            problem.
            Session gradient-extend: each ProjectFrame here is
            geo.FRAME_STRIP_H tall now (FRAME_H core + BUFFER buffer on
            each edge), not FRAME_H — this mask's own height stays
            geo.FRAME_H, so it shows only the centered core slice of
            whatever frame currently lines up, same as before. The
            translated column itself carries a static marginTop:
            -geo.BUFFER, unrelated to the --strip-y transform: without it,
            project i's core would sit BUFFER below where i*PITCH expects
            it (since the core sits BUFFER into each taller element, not at
            its top edge), which would desync every rest position from
            useProjectSnap's i*PITCH slots and from contentClipPath's `s`.
            This offset is what keeps that alignment exact. */}
        <div
          className="absolute inset-x-0 px-page-x"
          style={{ top: geo.FRAME_PIN, height: geo.FRAME_H, zIndex: 10 }}
        >
          <div className="mx-auto h-full max-w-page overflow-hidden rounded-card">
            <div style={{ transform: "translate3d(0, var(--strip-y), 0)", marginTop: -geo.BUFFER }}>
              {projects.map((project, i) => (
                <div
                  key={project.slug}
                  data-project-frame={i}
                  style={{ marginTop: i === 0 ? 0 : geo.GUTTER }}
                >
                  <ProjectFrame color={project.color} gradient={project.gradient} height={geo.FRAME_STRIP_H} />
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
            own visible slice; content itself never translates.
            Session R4a: width/height/radiusClass/paddingClass/gapClass are
            now explicit, geometry- and tier-driven props on ProjectTile
            (TILE_STYLE_FOR above) instead of that component's own
            desktop-only defaults — see ProjectTile.tsx's own comment. */}
        <div className="absolute inset-0 flex justify-center" style={{ zIndex: 20 }} onFocusCapture={handleFocusCapture}>
          <ProjectTile
            padded={false}
            clip
            width={geo.TILE_W}
            height={geo.TILE_H}
            radiusClass={tileStyle.radiusClass}
            data-testid="project-card"
            data-tier={geo.tier}
            style={{ marginTop: geo.TILE_TOP }}
          >
            {projects.map((project, i) => (
              <div
                key={project.slug}
                data-project-index={i}
                className="absolute inset-0"
                style={{ clipPath: contentClipPath(i, geo) }}
              >
                <ProjectTile
                  chrome={false}
                  width={geo.TILE_W}
                  height={geo.TILE_H}
                  paddingClass={tileStyle.paddingClass}
                  gapClass={tileStyle.gapClass}
                >
                  <Content
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
            i*geo.PITCH+geo.FRAME_H+geo.BUFFER, height: geo.GUTTER — the
            +BUFFER is because each strip element runs BUFFER px past
            FRAME_H before the real gutter starts, see FRAME_STRIP_H) sits
            exactly in a frame gap, so it never overlaps actual frame
            pixels regardless of the mask.
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
          style={{ top: geo.FRAME_PIN, zIndex: 30, transform: "translate3d(0, var(--strip-y), 0)" }}
        >
          {projects.slice(0, -1).map((project, i) => (
            <div
              key={project.slug}
              data-seam-band={i}
              className="absolute inset-x-0 bg-porcelain"
              style={{ top: i * geo.PITCH + geo.FRAME_H + geo.BUFFER, height: geo.GUTTER }}
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
            Outside that inner box, y < geo.FRAME_PIN has no L1/L2/L3
            content at any width, so leaving it uncovered here just falls
            through to the page's own porcelain background — same color, no
            seam. */}
        <div className="absolute inset-x-0 top-0 px-page-x" style={{ height: geo.FRAME_PIN, zIndex: 40 }}>
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
// geo.TILE_H — the whole card, not a sliver. Kept as a plain function
// rather than a component/hook: it's pure arithmetic over constants, called
// from a MotionValue event handler and once for initial state, not from
// render.
function visibilityMasks(
  stripY: number,
  count: number,
  geo: ProjectGeometry,
): { partial: number; full: number } {
  let partial = 0;
  let full = 0;
  for (let i = 0; i < count; i++) {
    const s = i * geo.PITCH + stripY;
    const topInset = Math.max(0, s - geo.CONTENT_INSET_TOP);
    const bottomInset = Math.max(0, -s - geo.CONTENT_INSET_BOTTOM);
    const visibleHeight = geo.TILE_H - topInset - bottomInset;
    if (visibleHeight > 0) partial |= 1 << i;
    if (visibleHeight >= geo.TILE_H) full |= 1 << i;
  }
  return { partial, full };
}

function isVisible(mask: number, i: number): boolean {
  return (mask & (1 << i)) !== 0;
}
