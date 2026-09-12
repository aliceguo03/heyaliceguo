"use client";

import { AnimatePresence, motion } from "motion/react";
import { InfoPanel } from "./InfoPanel";
import { PanelMeta } from "./PanelMeta";
import { PanelNav } from "./PanelNav";
import { MIN_PANEL_VIEWPORT_H } from "./caseStudyGeometry";
import { DUR, EASE, usePrefersReducedMotion, useViewportTooShort } from "@/lib/motion";
import type { Project } from "@/content/projects";
import type { Section } from "@/content/case-studies/types";

// The one sticky panel — InfoPanel's shell, crossfading between its two
// content variants as `current` (useCaseStudyPanel.ts) moves past -1. Both
// variants share this one shell instance rather than living in two separate
// sections (see InfoPanel.tsx's own comment for why that merge was
// necessary before a single sticky panel was possible at all).
//
// `compact` comes from the same useViewportTooShort hook ProjectSection.tsx
// and AboutSection.tsx already use (useSyncExternalStore-based, so SSR and
// the hydration render agree by construction — no layout-affecting
// hydration mismatch). Below MIN_PANEL_VIEWPORT_H the full 840px shell no
// longer fits under the sticky offset plus PANEL_BOTTOM_GAP, so this steps
// down to the compact shell instead of releasing to static — the panel
// stays sticky at every supported viewport height (CLAUDE.md's 1440x760
// floor sits inside the compact range with room to spare; see
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
  const compact = useViewportTooShort(MIN_PANEL_VIEWPORT_H);
  const key = current === -1 ? "meta" : "nav";

  return (
    <InfoPanel compact={compact}>
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
              <PanelMeta project={project} compact={compact} />
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
