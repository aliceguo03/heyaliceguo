"use client";

import { useSyncExternalStore } from "react";
import { geometryFor, type AboutGeometry } from "./aboutGeometry";

// Mirrors useProjectGeometry.ts exactly — same SSR-assumes-desktop
// convention, same svh probe (never window.innerHeight — see that file's
// own comment for the iOS address-bar hazard this stays out of by
// construction), same shared-module-scope-probe pattern (one AboutSection
// per page, so one probe is correct, not a shortcut).
const SERVER_GEOMETRY = geometryFor(1710, 1080);

let probeEl: HTMLDivElement | null = null;
let subscriberCount = 0;
let lastWidth = SERVER_GEOMETRY.width;
let lastSvh = SERVER_GEOMETRY.svh;
let lastGeo: AboutGeometry = SERVER_GEOMETRY;

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

function getSnapshot(): AboutGeometry {
  // documentElement.clientWidth, NOT window.innerWidth — a right-side-gap
  // bug (Alice, confirmed on a real resized window, not devtools) traced
  // to exactly this: window.innerWidth includes a reserved scrollbar's
  // width (CSSOM View spec), but the frame's own rendered width comes from
  // ordinary CSS block layout (max-w-page, percentage-based — see
  // AboutSection.tsx), which excludes it, same as clientWidth does. On any
  // page tall enough to always scroll vertically (About always is), the
  // two values differ by exactly the scrollbar's width wherever the
  // platform reserves space for one (Windows; macOS with "always show
  // scrollbars" or a mouse connected) — every child width this file
  // computes (ROW_W, COLUMN_W, PHONE_TEXT_W) was a few px wider than the
  // frame's real content box could actually hold, pushing content past
  // its right edge. Invisible in a headless/overlay-scrollbar environment
  // (this codebase's own sandbox measures a 0px gutter between the two —
  // confirmed, not assumed), which is exactly why two earlier rounds of
  // individual-element measurement here never found it.
  const width = document.documentElement.clientWidth;
  const svh = probeEl ? probeEl.getBoundingClientRect().height : window.innerHeight;
  if (width === lastWidth && svh === lastSvh) return lastGeo;
  lastWidth = width;
  lastSvh = svh;
  lastGeo = geometryFor(width, svh);
  return lastGeo;
}

function getServerSnapshot(): AboutGeometry {
  return SERVER_GEOMETRY;
}

// The About page's per-viewport geometry (aboutGeometry.ts's geometryFor),
// reactive to both width and svh.
export function useAboutGeometry(): AboutGeometry {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
