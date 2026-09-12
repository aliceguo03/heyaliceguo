"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { DUR, EASE, cubicBezier } from "@/lib/motion";

// Lenis's `easing` option is the same EASE curve, adapted to the (t) =>
// progress shape Lenis expects — see the comment on cubicBezier itself.
const SCROLL_EASING = cubicBezier(EASE);

// Tag forwarded through Lenis's 'scroll' event (lenis.userData) on every
// scroll this app itself initiates — the wrapper below, and
// useProjectSnap.ts's own direct lenis.scrollTo call. A listener that sees
// this on the *last* scroll it observed knows that scroll was programmatic
// (a button, focus-follow, or a snap), not the user's hand on the wheel —
// see useProjectSnap.ts for why "last observed" (not "currently in
// userData") is what a listener has to track: Lenis clears userData back to
// {} synchronously right after a scroll's final event, so a listener has to
// capture the tag at event time, not re-read it later.
export const PROGRAMMATIC_SCROLL_USER_DATA = { source: "app-scroll" } as const;

// The one sitewide anchor for "top of page" — Hero's wordmark carries this
// id (and a negative tabIndex) so there's a meaningful element for keyboard
// focus to land on after a "top" jump; y=0 itself has nothing to focus.
const TOP_FOCUS_ID = "page-top";

// "top", an absolute document y in pixels (ProjectSection.tsx's
// focus-follows-scroll — see resolveFocusTarget below), or a CSS selector
// e.g. "#selected-work".
export type ScrollTarget = "top" | number | string;

type ScrollOptions = {
  // Name of a CSS custom property (e.g. "--spacing-nav-height") to read at
  // call time and apply as a negative offset, so the destination clears a
  // fixed element like the sticky nav without duplicating its pixel height
  // here as a literal.
  offsetVar?: string;
};

type ScrollToFn = (target: ScrollTarget, options?: ScrollOptions) => void;

const ScrollContext = createContext<ScrollToFn | null>(null);

// A stable ref (not React state) exposing the live Lenis instance —
// useProjectSnap.ts needs the real instance to read `.velocity` and attach
// its own 'scroll' listener with `lock: false`, which the ScrollToFn
// wrapper above doesn't give a caller access to. A ref rather than state:
// nothing here should re-render when the instance is (re)created (only on
// a reduced-motion toggle, and only imperative consumers read it).
const LenisRefContext = createContext<RefObject<Lenis | null> | null>(null);

function resolveElement(target: ScrollTarget): HTMLElement | null {
  if (typeof target !== "string" || target === "top") return null;
  return target.startsWith("#")
    ? document.getElementById(target.slice(1))
    : document.querySelector<HTMLElement>(target);
}

// A numeric target has no element to focus — it's an absolute y, used when
// the scroll is following an already-focused element (ProjectSection.tsx)
// rather than the other way round. Returning null there means
// focusDestination() below is a no-op, which is exactly right: moving
// focus again would fight the focus that triggered the scroll.
function resolveFocusTarget(target: ScrollTarget): HTMLElement | null {
  if (target === "top") return document.getElementById(TOP_FOCUS_ID);
  return resolveElement(target);
}

function readOffsetPx(varName: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName);
  return Number.parseFloat(raw) || 0;
}

// Lenis controls scrolling; window.scrollTo/scroll-behavior would fight it
// (see globals.css). This mounts one Lenis instance for the app and exposes
// a single scrollTo action that every button-triggered scroll goes through,
// so nav-offset math and the reduced-motion/focus handling live in one
// place rather than being re-implemented per button.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  // useLayoutEffect, not useEffect: React fires every component's layout
  // effects (whole tree, bottom-up) before any component's passive effects
  // (also whole tree, bottom-up) on initial mount. SmoothScroll wraps the
  // entire app, so as a plain useEffect this would run *after* a
  // descendant's own useEffect on first mount (children's passive effects
  // fire before their parent's) — useProjectSnap.ts's effect would then
  // read lenisRef.current as still null and never attach. useLayoutEffect
  // sidesteps the parent/child ordering entirely, since it's a different,
  // earlier phase than any passive effect anywhere in the tree.
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function sync(reduced: boolean) {
      lenisRef.current?.destroy();
      // Reduced motion: no Lenis instance at all, native scroll takes over
      // (the global CSS in globals.css already forces scroll-behavior: auto
      // as a backstop). Otherwise: one instance, driving its own rAF loop.
      lenisRef.current = reduced
        ? null
        : new Lenis({ duration: DUR.scroll, easing: SCROLL_EASING, autoRaf: true });
    }

    sync(media.matches);
    function onChange(event: MediaQueryListEvent) {
      sync(event.matches);
    }
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<ScrollToFn>((target, options) => {
    const offset = options?.offsetVar ? -readOffsetPx(options.offsetVar) : 0;
    const lenisTarget =
      target === "top" || typeof target === "number" ? target : (resolveElement(target) ?? target);

    function focusDestination() {
      const element = resolveFocusTarget(target);
      element?.focus();
    }

    const lenis = lenisRef.current;
    if (!lenis) {
      // Reduced motion: jump instantly, then move focus immediately.
      if (target === "top") {
        window.scrollTo({ top: 0, behavior: "auto" });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target + offset, behavior: "auto" });
      } else {
        const element = resolveElement(target);
        if (element) {
          // Mirrors Lenis's own scrollTo (lenis.mjs): it reads the target's
          // own `scroll-margin-top` and folds it into the landing position
          // automatically, so an element like CaseStudySection.tsx's
          // `scroll-mt-nav-height` needs no caller-supplied `offsetVar` on
          // top of it — this branch has to apply that same subtraction by
          // hand, or a target that relies on its own scroll-margin (rather
          // than an explicit offsetVar) would land flush under the nav here
          // while landing correctly through Lenis.
          const scrollMargin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
          const top = element.getBoundingClientRect().top + window.scrollY - scrollMargin + offset;
          window.scrollTo({ top, behavior: "auto" });
        }
      }
      focusDestination();
      return;
    }

    lenis.scrollTo(lenisTarget, {
      offset,
      duration: DUR.scroll,
      easing: SCROLL_EASING,
      onComplete: focusDestination,
      // Tags this call (and every 'scroll' event it fires while animating)
      // as app-initiated — see useProjectSnap.ts, whose idle check must
      // ignore BACK TO TOP / VIEW MY WORK / focus-follow-scroll landings,
      // not just its own.
      userData: PROGRAMMATIC_SCROLL_USER_DATA,
    });
  }, []);

  return (
    <ScrollContext.Provider value={scrollTo}>
      <LenisRefContext.Provider value={lenisRef}>{children}</LenisRefContext.Provider>
    </ScrollContext.Provider>
  );
}

export function useScrollAction(): ScrollToFn {
  const scrollTo = useContext(ScrollContext);
  if (!scrollTo) {
    throw new Error("useScrollAction must be used within <SmoothScroll>");
  }
  return scrollTo;
}

// Imperative access to the live Lenis instance — see LenisRefContext above.
// null whenever reduced motion is on (no instance exists at all).
export function useLenisRef(): RefObject<Lenis | null> {
  const ref = useContext(LenisRefContext);
  if (!ref) {
    throw new Error("useLenisRef must be used within <SmoothScroll>");
  }
  return ref;
}
