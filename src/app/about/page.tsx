import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutSection } from "@/components/about/AboutSection";

export const metadata: Metadata = {
  title: "About — Alice Guo",
  description: "Alice Guo — product designer and design engineer, San Diego.",
};

export default function About() {
  return (
    <main>
      <AboutHero />
      {/* Full-bleed padded wrapper — same 1610px cap / 50px gutter pattern
          Footer.tsx uses. AboutSection owns the centered frame itself
          (session 5B: the pin needs its own ref on that centering wrapper
          to measure scroll position off it). */}
      <div className="px-xl pb-lg">
        <AboutSection />
      </div>
    </main>
  );
}
