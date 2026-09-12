import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { CaseStudyActions } from "@/components/case-study/CaseStudyActions";
import { PROJECTS } from "@/content/projects";
import { CASE_STUDIES } from "@/content/case-studies";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Alice Guo`,
    description: `Alice Guo — product designer and design engineer, San Diego.`,
  };
}

// Nine projects (content/projects.ts), one case study each eventually
// (content/case-studies/*.ts). A slug with no case study entry yet renders
// the CLAUDE.md stub: project title, nothing else. `next` always resolves
// from PROJECTS' own order — no project name is ever hardcoded here.
export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const projectIndex = PROJECTS.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) notFound();

  const project = PROJECTS[projectIndex];
  const next = PROJECTS[(projectIndex + 1) % PROJECTS.length];
  const caseStudy = CASE_STUDIES[slug];

  if (!caseStudy) {
    return (
      <main className="flex w-full justify-center px-3xl pb-4xl pt-4xl">
        <PageTitle>{project.name}</PageTitle>
      </main>
    );
  }

  return (
    <main
      style={
        {
          "--color-accent-project": project.accent,
          "--gradient-project": project.gradient ? `url("${project.gradient}")` : undefined,
        } as React.CSSProperties
      }
    >
      <CaseStudyHero project={project} hero={caseStudy.hero} />
      <CaseStudyBody project={project} overview={caseStudy.overview} sections={caseStudy.sections} />
      <CaseStudyActions next={next} />
    </main>
  );
}
