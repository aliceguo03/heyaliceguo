import { Hero } from "@/components/home/Hero";
import { ProjectSection } from "@/components/home/ProjectSection";
import { WorkSectionActions } from "@/components/home/WorkSectionActions";
import { FEATURED_PROJECTS } from "@/content/projects";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProjectSection projects={FEATURED_PROJECTS} />
      <div className="pb-lg">
        <WorkSectionActions />
      </div>
    </main>
  );
}
