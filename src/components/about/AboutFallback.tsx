import { ABOUT_SECTIONS } from "@/content/about";
import { AboutFallbackRow } from "./AboutFallbackRow";

// The reduced-motion / short-viewport fallback (Figma "about - reduced
// motion", 705:5453 — a real mock, not derived from the pinned view). One
// component serving both triggers AboutSection checks for: no pin, no
// clip, no transform, no listeners — a plain vertical document with all
// six sections and all six photos visible at once. gap-3xl matches
// Figma's 100px row gap.
export function AboutFallback() {
  return (
    <div className="flex w-full flex-col gap-3xl">
      {ABOUT_SECTIONS.map((section, index) => (
        <AboutFallbackRow key={section.id} section={section} priority={index === 0} />
      ))}
    </div>
  );
}
