"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { DUR, EASE, cubicBezier } from "@/lib/motion";

// Lenis's `easing` option is the same EASE curve, adapted to the (t) =>
// progress shape Lenis expects — see the comment on cubicBezier itself.
const SCROLL_EASING = cubicBezier(EASE);

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

  useEffect(() => {
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
          const top = element.getBoundingClientRect().top + window.scrollY + offset;
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
    });
  }, []);

  return <ScrollContext.Provider value={scrollTo}>{children}</ScrollContext.Provider>;
}

export function useScrollAction(): ScrollToFn {
  const scrollTo = useContext(ScrollContext);
  if (!scrollTo) {
    throw new Error("useScrollAction must be used within <SmoothScroll>");
  }
  return scrollTo;
}
