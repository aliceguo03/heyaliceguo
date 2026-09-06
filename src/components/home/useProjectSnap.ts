"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { DUR, EASE, cubicBezier } from "@/lib/motion";
import { PROGRAMMATIC_SCROLL_USER_DATA, useLenisRef } from "@/components/chassis/SmoothScroll";
import {
  PITCH,
  PROJECT_COUNT,
  SNAP_DEADZONE,
  SNAP_IDLE_MS,
  SNAP_RADIUS,
  SNAP_VELOCITY_EPS,
  TRAVEL,
} from "./projectGeometry";

const SNAP_EASING = cubicBezier(EASE);

// Eases the pinned selected-work section to the nearest of its four rest
// slots (sectionTop + i*PITCH, i in 0..3 — the same offsets the mechanic
// itself derives, not a second source) once scrolling settles nearby. See
// CLAUDE.md's "THE SNAP MECHANIC". Every guard below must pass before the
// one lenis.scrollTo call at the bottom runs.
export function useProjectSnap(sectionRef: RefObject<HTMLElement | null>, disabled: boolean) {
  const lenisRef = useLenisRef();

  useEffect(() => {
    // Reduced motion / too-short viewport: no listener attached at all —
    // not attached-and-inert. Both conditions are folded into `disabled` by
    // the caller (ProjectSection.tsx), which already computes them for its
    // own static-fallback branch.
    if (disabled) return;

    const lenis = lenisRef.current;
    if (!lenis) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    // Captured at the moment of each 'scroll' event, not re-read from
    // lenis.userData when the idle timer later fires: Lenis clears userData
    // back to {} synchronously right after a scroll's own final event, so
    // by the time our (debounced, later) timer runs, reading it live would
    // already say "not programmatic" even for a scroll that just was. See
    // PROGRAMMATIC_SCROLL_USER_DATA's comment in SmoothScroll.tsx.
    let lastScrollWasProgrammatic = false;

    function clearIdleTimer() {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function attemptSnap() {
      const section = sectionRef.current;
      const currentLenis = lenisRef.current;
      if (!section || !currentLenis) return;

      // Guard: the scroll that just settled was programmatic (BACK TO TOP,
      // ALL PROJECTS, VIEW MY WORK, focus-follow-scroll, or a previous
      // snap). Reacting here would fight a button's landing, or — for the
      // snap's own scrollTo — loop.
      if (lastScrollWasProgrammatic) return;

      // Guard: still moving. The idle debounce alone isn't enough — real
      // wheel events during trackpad momentum can arrive >SNAP_IDLE_MS
      // apart even mid-gesture, so velocity is a second, required check.
      if (Math.abs(currentLenis.velocity) >= SNAP_VELOCITY_EPS) return;

      // Guard: focus is inside the section (a keyboard user tabbed to a
      // CTA) — don't move the page out from under them.
      if (document.activeElement && section.contains(document.activeElement)) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollY = window.scrollY;
      const offsetInSection = scrollY - sectionTop;

      // Guard: outside the pinned stage's own scroll range.
      if (offsetInSection < 0 || offsetInSection > TRAVEL) return;

      const slotIndex = Math.min(
        PROJECT_COUNT - 1,
        Math.max(0, Math.round(offsetInSection / PITCH)),
      );
      const slotY = sectionTop + slotIndex * PITCH;
      const distance = Math.abs(scrollY - slotY);

      // Guard: already at rest there (snapping a handful of px is jitter),
      // or too far away to reach gently.
      if (distance < SNAP_DEADZONE || distance > SNAP_RADIUS) return;

      currentLenis.scrollTo(slotY, {
        lock: false,
        duration: DUR.reveal,
        easing: SNAP_EASING,
        userData: PROGRAMMATIC_SCROLL_USER_DATA,
      });
    }

    function onScroll(instance: Lenis) {
      lastScrollWasProgrammatic =
        (instance.userData as { source?: string } | undefined)?.source ===
        PROGRAMMATIC_SCROLL_USER_DATA.source;
      clearIdleTimer();
      idleTimer = setTimeout(attemptSnap, SNAP_IDLE_MS);
    }

    const unsubscribe = lenis.on("scroll", onScroll);
    return () => {
      clearIdleTimer();
      unsubscribe();
    };
  }, [disabled, sectionRef, lenisRef]);
}
