"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "motion/react";
import { BOTTOM_GAP } from "./aboutGeometry";

// Drives the About page's pin (session 5B — see CLAUDE.md's "session-5b"
// plan). Layout itself is CSS (aboutGeometry.ts's *Css exports) — this
// hook measures only what CSS can't know (the text content's own rendered
// height, which depends on font metrics, not viewport) and derives one
// MotionValue, `aboutProgress`, that everything else (the text column's
// translateY here; session 5C's reveals and photo index) must read rather
// than compute its own copy of — the same one-source rule projectGeometry
// / ProjectSection.tsx applies to --strip-y.
//
// Always called unconditionally (rules of hooks), same shape as
// useProjectSnap: a no-op internally — the ResizeObserver and resize
// listener are never attached — whenever `disabled` (reduced motion, or
// below MIN_ABOUT_VIEWPORT_H) is true and AboutSection renders the
// fallback instead. useScroll/useTransform themselves are still called in
// that branch (same precedent as ProjectSection.tsx's stripY: rules of
// hooks require it, and they're inert since nothing reads aboutProgress
// from the fallback tree).
export function useAboutPin(disabled: boolean) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // A ref, not state: written on every measure, read only inside the
  // aboutProgress transform below — re-rendering on every write would
  // defeat the point of driving position off a MotionValue.
  const lockStartRef = useRef(0);
  // travel DOES need to be state: it's read by textY's closure below, and
  // that closure must see a fresh value whenever a resize or font swap
  // changes it — but this only happens on ResizeObserver/resize events,
  // not per scroll frame, so a re-render here is cheap and correct rather
  // than a performance concern.
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    if (disabled) return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;

    function measure() {
      const windowEl = windowRef.current;
      const content = contentRef.current;
      if (!section || !wrapper || !windowEl || !content) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const frameH = wrapper.offsetHeight;
      // Measured off the DOM, not re-derived from frameH via the same
      // arithmetic textWindowCss uses — this is the actual, CSS-resolved
      // value (subject to browser rounding), so the section's travel can
      // never disagree with what the window really renders at.
      const textWindowH = windowEl.offsetHeight;
      const textContentH = content.offsetHeight;
      const nextTravel = Math.max(0, textContentH - textWindowH);

      lockStartRef.current = sectionTop - (window.innerHeight - BOTTOM_GAP - frameH);
      // Written directly to the DOM (mirrors --strip-y's own pattern in
      // ProjectSection.tsx) rather than through React state + inline
      // style: this is a plain CSS custom property that sectionHeightCss's
      // calc() reads, and React's next render only ever touches the
      // `height` key in this element's style object — a custom property
      // set imperatively outside that object survives untouched.
      section.style.setProperty("--about-text-content-h", `${textContentH}px`);
      setTravel((prev) => (prev === nextTravel ? prev : nextTravel));
    }

    measure();

    // ResizeObserver, not a one-shot measurement: textContentH depends on
    // rendered Satoshi metrics, so a font swap (next/font's display:
    // 'swap') changes it after mount, same as a window resize would.
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    if (windowRef.current) observer.observe(windowRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [disabled]);

  const { scrollY } = useScroll();
  const aboutProgress = useTransform(scrollY, (latest) => {
    if (travel <= 0) return 0;
    return Math.min(1, Math.max(0, (latest - lockStartRef.current) / travel));
  });
  // Transform only — this MotionValue is what TextColumn's motion.div
  // binds its `y` style to. Never native scroll of an inner element, never
  // a layout change.
  const textY = useTransform(aboutProgress, (progress) => -progress * travel);

  return { sectionRef, wrapperRef, windowRef, contentRef, aboutProgress, textY };
}
