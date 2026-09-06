"use client";

import { BlackButton } from "@/components/ui/BlackButton";
import { useScrollAction } from "@/components/chassis/SmoothScroll";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { STAGGER } from "@/lib/motion";

// Figma "buttons" row (441:5995), sitting centered below the last project
// card: BACK TO TOP (outline, 400:3559) on the left, ALL PROJECTS (filled,
// 441:5996) on the right.
//
// Each button gets its own ScrollReveal (rather than one wrapper around the
// row) so STAGGER can offset the second reveal from the first.
export function WorkSectionActions() {
  const scrollTo = useScrollAction();

  return (
    <div className="flex items-center justify-center gap-md">
      <ScrollReveal as="div">
        <BlackButton variant="outline" arrow="up" onClick={() => scrollTo("top")}>
          BACK TO TOP
        </BlackButton>
      </ScrollReveal>
      <ScrollReveal as="div" delay={STAGGER}>
        <BlackButton href="/work">ALL PROJECTS</BlackButton>
      </ScrollReveal>
    </div>
  );
}
