"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { InfoPanel } from "./InfoPanel";
import { PanelMeta } from "./PanelMeta";
import { PanelNav } from "./PanelNav";
import { MIN_PANEL_VIEWPORT_H } from "./caseStudyGeometry";
import { MIN_MECHANIC_VIEWPORT_W, usePrefersReducedMotion, useViewportBelow } from "@/lib/motion";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// The one sticky panel — InfoPanel's shell, stacking its two content
// variants as `current`/`stackProgress` (useCaseStudyPanel.ts) move past
// -1. Both variants share this one shell instance rather than living in two
// separate sections (see InfoPanel.tsx's own comment for why that merge was
// necessary before a single sticky panel was possible at all).
//
// Session R5 (case study responsive pass): `belowDesktop` is a genuinely
// different question from `compact` below it, not a smaller step of the
// same one. Below --breakpoint-desktop there is no section nav to swap to
// at all — Figma's tablet mock has no sidebar node anywhere in its content
// scroll — so this renders PanelMeta unconditionally, with no stacking
// mechanic at all, rather than degrading the sticky shell the way `compact`
// does. `useViewportBelow(0, MIN_MECHANIC_VIEWPORT_W)` reads as "width <
// 1440" (the height floor of 0 never trips) — the same width-only reading
// CarouselTabs.tsx's own `tightViewport` AND-gate uses this session. No
// hydration flash: useCaseStudyPanel.ts already initialises `current` to -1
// (show metadata) for its own first render, so server and client agree on
// PanelMeta at every width before this gate even runs — `belowDesktop` only
// decides whether PanelNav ever becomes reachable later, not what paints
// first.
//
// `compact` comes from the same useViewportBelow hook ProjectSection.tsx
// and AboutSection.tsx already use (useSyncExternalStore-based, so SSR and
// the hydration render agree by construction — no layout-affecting
// hydration mismatch) — height-only on its own, no width floor: this
// degrades a shell rather than disabling a mechanic, so Session R0's
// MIN_MECHANIC_VIEWPORT_W guard doesn't apply to it directly. Session R5
// scopes it to desktop only (`!belowDesktop && shortViewport`, both hooks
// called unconditionally per the Rules of Hooks — the `&&` only combines
// their results, it never skips a call): unguarded, a 1024x768 landscape
// tablet would satisfy `useViewportBelow(976)` and wrongly step the type
// down on a shell that, below desktop, isn't sticky or fixed-height at
// all — PANEL_H/PANEL_COMPACT_H only mean something once `fixed` is true.
// Below MIN_PANEL_VIEWPORT_H at desktop, the full 840px shell no longer
// fits under the sticky offset plus PANEL_BOTTOM_GAP, so this steps down
// to the compact shell instead of releasing to static — the panel stays
// sticky at every supported desktop viewport height (CLAUDE.md's
// 1440x760 floor sits inside the compact range with room to spare; see
// caseStudyGeometry.ts).
//
// Fix pass (item 1): the metadata->nav swap is no longer a time-based
// opacity crossfade. Both variants now mount for the section's whole life,
// stacked as two `absolute inset-0` layers inside an `overflow-hidden`
// wrapper: the metadata layer at the bottom, never transformed; the nav
// layer on top, translated with `y` from `stackProgress` (a MotionValue,
// 0..1, written every scroll frame by useCaseStudyPanel.ts — see that
// file's own comment on why this is a second value rather than one derived
// from `current`). At 0 the nav layer sits fully below the shell (`y:
// 100%`); at 1 it's flush (`y: 0%`) — a percentage `y` resolves against the
// layer's OWN height, so the 840px and 600px (`compact`) shells each get
// their correct slide distance for free, no height threaded through. This
// reads as the nav card sliding up and covering the metadata card, not a
// dissolve — and because it's driven by scroll position rather than time,
// scrolling back up genuinely reverses it rather than replaying a second
// one-way transition.
//
// Review pass (item 3): the border/radius/padding/background used to live
// on InfoPanel's own shared shell, one level above both layers — so only
// each layer's TEXT slid while that chrome sat fixed in place, reading as
// content moving inside a static window rather than a card moving. `CARD`
// below is that same chrome (unchanged values — InfoPanel.tsx's own
// previous classes), now applied to each of the two `absolute inset-0`
// layers directly, with `chrome={false}` passed to InfoPanel so it isn't
// rendered a second, redundant time on the ancestor. `stackProgress`'s `y`
// transform sits on the same element that carries this chrome, so the
// border/background/padding and the content inside move as one rigid unit.
// Both layers need the same background (not just the topmost one) so each
// genuinely occludes the other wherever it's the layer currently on top —
// see CARD's own comment.
//
// `overflow-hidden` sits on the wrapper INSIDE InfoPanel's own sticky box,
// not on InfoPanel itself or anything above it — a transformed ANCESTOR of
// a sticky element breaks its positioning (see ScrollReveal.tsx's own
// comment on that constraint), but a transformed DESCENDANT, which this is,
// doesn't. Figma's own flat static layout has no scroll mechanic to show
// this layering at all — same as ProjectSection.tsx's L1/L2/L3 stacking,
// depth here comes from this doc/session, not the file.
//
// `Math.max(current, 0)` feeds PanelNav's `activeIndex` rather than
// `current` itself, so section 01 is already lit by the time the nav layer
// is visible at all — it would otherwise arrive fully slid-in with nothing
// highlighted for the fraction of a scroll before `current` flips.
//
// `inert` toggles on `current` (a discrete, state-driven boolean), not on
// `stackProgress` (continuous, per-frame) — the parked layer drops out of
// the tab order once it's covered, without re-evaluating that every scroll
// frame. This is strictly tighter than the old crossfade, which unmounted
// the hidden variant outright (removing it from the accessibility tree
// entirely) rather than making it merely unreachable.
//
// Review pass (item 1): no shadow on the sliding layer. A first pass
// reused --shadow-card with its Y offset negated, but at partial progress
// that shadow painted across the metadata layer's own NOT-YET-COVERED
// region — it reads as a defect (a stray band sitting on content the nav
// card hasn't reached yet), not as a leading edge casting depth onto what
// it's about to cover. Removed rather than retuned: the slide now reads as
// one flat card moving over another, with no depth cue at all.
//
// Reduced motion collapses to the original instant swap: a single layer,
// chosen by `current`, no wrapper, no transform — not a fast version of
// the slide (CLAUDE.md's explicit call for this component).
const CARD = "rounded-card border border-divider bg-porcelain p-lg";

export function CasePanel({
  project,
  sections,
  current,
  stackProgress,
  onJump,
}: {
  project: Project;
  sections: Section[];
  current: number;
  stackProgress: MotionValue<number>;
  onJump: (index: number) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const belowDesktop = useViewportBelow(0, MIN_MECHANIC_VIEWPORT_W);
  const shortViewport = useViewportBelow(MIN_PANEL_VIEWPORT_H);
  const compact = !belowDesktop && shortViewport;

  // Called unconditionally, ahead of every early return below, per the
  // Rules of Hooks — harmless when a branch that follows never reads it.
  const y = useTransform(stackProgress, [0, 1], ["100%", "0%"]);

  if (belowDesktop) {
    return (
      <InfoPanel fixed={false}>
        <PanelMeta project={project} fixed={false} />
      </InfoPanel>
    );
  }

  const showingNav = current !== -1;

  if (reducedMotion) {
    return (
      <InfoPanel fixed compact={compact}>
        {showingNav ? (
          <PanelNav
            sections={sections}
            activeIndex={current}
            status={project.status}
            compact={compact}
            onJump={onJump}
          />
        ) : (
          <PanelMeta project={project} compact={compact} fixed />
        )}
      </InfoPanel>
    );
  }

  return (
    <InfoPanel fixed compact={compact} chrome={false}>
      <div className="relative h-full w-full overflow-hidden">
        <div data-panel-meta-layer className={`absolute inset-0 ${CARD}`} inert={showingNav}>
          <PanelMeta project={project} compact={compact} fixed />
        </div>

        <motion.div
          data-panel-nav-layer
          className={`absolute inset-0 ${CARD}`}
          style={{ y }}
          inert={!showingNav}
        >
          <PanelNav
            sections={sections}
            activeIndex={Math.max(current, 0)}
            status={project.status}
            compact={compact}
            onJump={onJump}
          />
        </motion.div>
      </div>
    </InfoPanel>
  );
}
