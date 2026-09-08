import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutFrame } from "@/components/about/AboutFrame";

export const metadata: Metadata = {
  title: "About — Alice Guo",
  description: "Alice Guo — product designer and design engineer, San Diego.",
};

export default function About() {
  return (
    <main>
      <AboutHero />
      {/* Full-bleed padded wrapper + capped, centered frame — same pattern
          Footer.tsx uses so this tracks the same 1610px cap and 50px
          gutter as the rest of the page's chrome. */}
      <div className="px-xl pb-lg">
        <div className="mx-auto max-w-page">
          <AboutFrame />
        </div>
      </div>
    </main>
  );
}
