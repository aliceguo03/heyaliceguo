import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";

export const metadata: Metadata = {
  title: "About — Alice Guo",
  description: "Alice Guo — product designer and design engineer, San Diego.",
};

export default function About() {
  return (
    <main>
      <AboutHero />
    </main>
  );
}
