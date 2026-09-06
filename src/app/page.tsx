import { Hero } from "@/components/home/Hero";
import { ProjectCard } from "@/components/home/ProjectCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FEATURED_PROJECTS } from "@/content/projects";

export default function Home() {
  return (
    <main>
      <Hero />
<<<<<<< Updated upstream

      <section className="px-xl pt-xl pb-lg">
        <div className="mx-auto flex max-w-page flex-col gap-md">
          <SectionLabel>SELECTED WORK.</SectionLabel>
          <div className="flex flex-col gap-lg">
            {FEATURED_PROJECTS.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
=======
      <ProjectSection projects={FEATURED_PROJECTS} />
      <div className="pb-lg">
        <WorkSectionActions />
      </div>
>>>>>>> Stashed changes
    </main>
  );
}
