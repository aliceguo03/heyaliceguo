"use client";

import { useSyncExternalStore } from "react";
import { geometryFor, type ProjectGeometry } from "./projectGeometry";

// SSR and the hydration render both assume the desktop tier at its own
// frame ceiling — same "guess the common case, correct after hydration"
// convention as lib/motion.ts's usePrefersReducedMotion/useViewportBelow.
// Any width/svh pair that resolves to the desktop tier with FRAME_H at its
// own FRAME_H_MAX works identically here; 1710x1080 is just representative.
const SERVER_GEOMETRY = geometryFor(1710, 1080);

// A `height: 100svh` probe element, measured via ResizeObserver — never
// window.innerHeight. svh is the browser's *smallest* viewport height and
// does not change when a mobile browser's address bar collapses mid-scroll
// the way window.innerHeight does, so a bar transition can't move
// PITCH/SECTION_H under a user who's mid-gesture in the pinned section.
// That's the exact hazard the R4a plan scopes to R4b — this keeps it out
// by construction (an input that structurally can't move mid-scroll)
// rather than by care taken elsewhere.
//
// Module-scope state, not a per-instance ref, mirroring subscribeResize's
// own window-level listener pattern below it in lib/motion.ts — safe here
// for the same reason: the page renders exactly one ProjectSection, so one
// shared probe (created on first subscribe, torn down when the last
// unsubscribes) is correct, not a shortcut.
let probeEl: HTMLDivElement | null = null;
let subscriberCount = 0;
let lastWidth = SERVER_GEOMETRY.width;
let lastSvh = SERVER_GEOMETRY.svh;
let lastGeo: ProjectGeometry = SERVER_GEOMETRY;

function ensureProbe(): HTMLDivElement {
  if (!probeEl) {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none;";
    document.body.appendChild(el);
    probeEl = el;
  }
  return probeEl;
}

function subscribe(onStoreChange: () => void) {
  const probe = ensureProbe();
  subscriberCount++;

  const resizeObserver = new ResizeObserver(onStoreChange);
  resizeObserver.observe(probe);
  // Width isn't observable through the height-only probe, so a plain
  // window resize listener covers it — same pairing About's own pin uses
  // (a ResizeObserver for measured content height, a resize listener for
  // everything else) rather than inventing a second probe for width.
  window.addEventListener("resize", onStoreChange);

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("resize", onStoreChange);
    subscriberCount--;
    if (subscriberCount === 0 && probeEl) {
      probeEl.remove();
      probeEl = null;
    }
  };
}

function getSnapshot(): ProjectGeometry {
  const width = window.innerWidth;
  const svh = probeEl ? probeEl.getBoundingClientRect().height : window.innerHeight;
  // Recompute only when the resulting inputs actually changed — geometryFor
  // returns a new object every call, and useSyncExternalStore re-renders
  // whenever the returned reference differs, so returning the cached
  // object on a no-op resize (e.g. a horizontal-only resize once svh is
  // already settled) is what keeps this from re-rendering ProjectSection
  // on every pixel of unrelated resize churn.
  if (width === lastWidth && svh === lastSvh) return lastGeo;
  lastWidth = width;
  lastSvh = svh;
  lastGeo = geometryFor(width, svh);
  return lastGeo;
}

function getServerSnapshot(): ProjectGeometry {
  return SERVER_GEOMETRY;
}

// The selected-work pin mechanic's per-viewport geometry
// (projectGeometry.ts's geometryFor), reactive to both width and svh.
export function useProjectGeometry(): ProjectGeometry {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
