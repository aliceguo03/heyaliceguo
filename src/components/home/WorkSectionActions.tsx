"use client";

import { BlackButton } from "@/components/ui/BlackButton";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

// Figma "buttons" row (441:5995): BACK TO TOP (outline, 400:3559), centered
// below the last project card. ALL PROJECTS (filled, 441:5996) linked to
// the now-cancelled /work index and was removed — see the comment below.
export function WorkSectionActions() {
  const scrollTo = useScrollAction();

  return (
    <div className="flex items-center justify-center gap-md">
      <ScrollReveal as="div">
        <BlackButton variant="outline" outlineKind="backToTop" arrow="up" onClick={() => scrollTo("top")}>
          BACK TO TOP
        </BlackButton>
      </ScrollReveal>
      {/* A projects grid goes here in a later session; ALL PROJECTS linked to
          the cancelled /work index and was removed. */}
    </div>
  );
}
