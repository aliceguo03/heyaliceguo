"use client";

import { AnimatePresence, motion } from "motion/react";
import { InfoPanel } from "./InfoPanel";
import { PanelMeta } from "./PanelMeta";
import { PanelNav } from "./PanelNav";
import { MIN_PANEL_VIEWPORT_H } from "./caseStudyGeometry";
import { DUR, EASE, MIN_MECHANIC_VIEWPORT_W, usePrefersReducedMotion, useViewportBelow } from "@/lib/motion";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// The one sticky panel — InfoPanel's shell, crossfading between its two
// content variants as `current` (useCaseStudyPanel.ts) moves past -1. Both
// variants share this one shell instance rather than living in two separate
// sections (see InfoPanel.tsx's own comment for why that merge was
// necessary before a single sticky panel was possible at all).
//
// Session R5 (case study responsive pass): `belowDesktop` is a genuinely
// different question from `compact` below it, not a smaller step of the
// same one. Below --breakpoint-desktop there is no section nav to swap to
// at all — Figma's tablet mock has no sidebar node anywhere in its content
// scroll — so this renders PanelMeta unconditionally, with no
// AnimatePresence and no crossfade, rather than degrading the sticky shell
// the way `compact` does. `useViewportBelow(0, MIN_MECHANIC_VIEWPORT_W)`
// reads as "width < 1440" (the height floor of 0 never trips) — the same
// width-only reading CarouselTabs.tsx's own `tightViewport` AND-gate uses
// this session. No hydration flash: useCaseStudyPanel.ts already
// initialises `current` to -1 (show metadata) for its own first render, so
// server and client agree on PanelMeta at every width before this gate
// even runs — `belowDesktop` only decides whether PanelNav ever becomes
// reachable later, not what paints first.
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
// The crossfade animates opacity only, never a transform: InfoPanel is
// `position: sticky`, and a transformed ancestor would break sticky
// positioning on anything nested inside it (see ScrollReveal.tsx's own
// comment on the same constraint). Reduced motion collapses the transition
// to zero duration — sticky itself isn't motion and stays; only the fade
// goes away, per CLAUDE.md's explicit call for this component.
export function CasePanel({
  project,
  sections,
  current,
  onJump,
}: {
  project: Project;
  sections: Section[];
  current: number;
  onJump: (index: number) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const belowDesktop = useViewportBelow(0, MIN_MECHANIC_VIEWPORT_W);
  const shortViewport = useViewportBelow(MIN_PANEL_VIEWPORT_H);
  const compact = !belowDesktop && shortViewport;

  if (belowDesktop) {
    return (
      <InfoPanel fixed={false}>
        <PanelMeta project={project} fixed={false} />
      </InfoPanel>
    );
  }

  const key = current === -1 ? "meta" : "nav";

  return (
    <InfoPanel fixed compact={compact}>
      <div className="relative h-full w-full">
        {/* initial={false}: the panel's very first render (meta, before any
            scroll) must not fade in — only a later crossing should ever
            animate. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={key}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // pointerEvents: "none" lands instantly at the start of the exit
            // transition (motion applies non-interpolable style values
            // immediately, not eased) — a keyboard tab can't land on a link
            // that's mid-fade-out underneath the incoming variant.
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: reducedMotion ? 0 : DUR.hover, ease: EASE }}
          >
            {current === -1 ? (
              <PanelMeta project={project} compact={compact} fixed />
            ) : (
              <PanelNav
                sections={sections}
                activeIndex={current}
                status={project.status}
                compact={compact}
                onJump={onJump}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </InfoPanel>
  );
}
