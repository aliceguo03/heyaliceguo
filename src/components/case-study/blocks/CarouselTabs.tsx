"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Statement } from "./Statement";
import { Prose } from "./Prose";
import { Figure } from "./Figure";
import { SelectTab } from "@/components/ui/SelectTab";
import { DUR, EASE, usePrefersReducedMotion } from "@/lib/motion";
import type { Block } from "@/content/case-studies/types";

type TabsCarouselItem = Extract<Block, { kind: "carousel"; mode: "tabs" }>["items"][number];

// GeminiCut's "design decisions" carousel (Figma 767:7270) — click-driven
// tab selection, a deliberate departure from the scrub carousel's scroll-
// scrubbed mechanic (CarouselStage.tsx), not a bug to reconcile with it. No
// pin, no scroll math: this is ordinary static-flow content, which is also
// why CaseStudySection.tsx's ScrollReveal wraps it same as any other block
// (only the *scrub* mode's sticky stage can't tolerate a transformed
// ancestor).
//
// Layout: tab row -> heading+prose -> video well, all four items' text/media
// stacked in one grid cell each (col-start-1 row-start-1) so the well never
// jumps height on selection and no video ever needs its `src` reset (no
// flash, no re-fetch) — the same reasoning CarouselStage.tsx documents for
// its own three always-mounted items.
//
// ARIA: a real tablist/tabpanel pattern with roving tabindex. Inactive
// panels get `inert` + `aria-hidden` — CLAUDE.md's ProjectStack "never
// inert" rule doesn't apply here: that rule exists because an off-window
// project there had no other route into focus, where here every panel is
// one tab press away, and the ARIA tabs pattern requires inactive panels be
// out of the accessibility tree, not just visually hidden.
//
// Playback gate: only the selected tab's video plays, and only once this
// stage is on screen. Per the approved answer, the initially-selected first
// tab autoplays on scroll-into-view with no click needed — same treatment as
// ProjectMedia.tsx's homepage cards. Under reduced motion, that changes:
// nothing plays until a real click happens (a scroll crossing isn't one),
// but a click *does* still play its video, since that's content the visitor
// explicitly asked to see, not ambient motion "prefers-reduced-motion" is
// meant to suppress.
export function CarouselTabs({ items }: { items: TabsCarouselItem[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const baseId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [selected, setSelected] = useState(0);
  const [clickedOnce, setClickedOnce] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.intersectionRatio > 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function select(index: number) {
    setSelected(index);
    setClickedOnce(true);
    tabRefs.current[index]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;

    event.preventDefault();
    select(next);
  }

  return (
    <div ref={stageRef} className="flex w-full flex-col gap-lg">
      <div role="tablist" aria-label="Editing modes" className="flex items-center gap-md">
        {items.map((item, index) => (
          <SelectTab
            key={item.label}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={`${baseId}-tab-${index}`}
            controls={`${baseId}-panel-${index}`}
            label={item.label}
            selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          />
        ))}
      </div>

      <div className="grid w-full">
        {items.map((item, index) => {
          const active = selected === index;
          const shouldPlayVideo = active && onScreen && (clickedOnce || !reducedMotion);

          return (
            <motion.div
              key={item.label}
              id={`${baseId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${index}`}
              inert={!active}
              aria-hidden={!active}
              className="col-start-1 row-start-1 flex w-full flex-col gap-md"
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : DUR.reveal, ease: EASE }}
            >
              <Statement text={item.heading} />
              <Prose paragraphs={item.paragraphs} />
              <Figure figure={item.figure} visible={shouldPlayVideo} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
