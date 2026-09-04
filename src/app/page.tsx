import { Hero } from "@/components/home/Hero";
import { ProjectCard, type ProjectCardProps } from "@/components/home/ProjectCard";
import { SectionLabel } from "@/components/ui/SectionLabel";

// Step 6 replaces this with src/content/projects.ts — kept as a local literal
// for now so the card can be built and reviewed on its own.
const F3GLOBAL: ProjectCardProps = {
  slug: "f3global",
  number: "01",
  name: "F3GLOBAL",
  status: { label: "LIVE SITE", kind: "live" },
  role: "DESIGN LEAD",
  timeline: "8 MOS",
  type: "WEBSITE & ADMIN PORTAL",
  color: "var(--color-project-f3global)",
  thumbnail: "/projects/f3.jpg",
  video: "/projects/f3.mp4",
};

// Matches the outer frame's max-width (441:5985) so the label and card align.
const SECTION_MAX_WIDTH = 1610;

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="px-xl pt-xl">
        <div
          className="mx-auto flex flex-col gap-md"
          style={{ maxWidth: SECTION_MAX_WIDTH }}
        >
          <SectionLabel>SELECTED WORK.</SectionLabel>
          <ProjectCard {...F3GLOBAL} />
        </div>
      </section>
    </main>
  );
}
