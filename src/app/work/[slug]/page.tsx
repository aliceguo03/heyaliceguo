import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { CaseStudyActions } from "@/components/case-study/CaseStudyActions";
import { LIVE_PROJECTS } from "@/content/liveProjects";
import { CASE_STUDIES } from "@/content/case-studies";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return LIVE_PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = LIVE_PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.slug,
    description: `Alice Guo — product designer and design engineer, San Diego.`,
  };
}

// Four live projects (content/liveProjects.ts) each have a case study
// (content/case-studies/*.ts) — the two lists are the same size by
// construction, so `caseStudy` below can never be missing. A slug not in
// LIVE_PROJECTS (one of the five paused projects, or anything else) 404s;
// there is no title-only stub anymore. `next` always resolves from
// LIVE_PROJECTS' own order — no project name is ever hardcoded here.
export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const projectIndex = LIVE_PROJECTS.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) notFound();

  const project = LIVE_PROJECTS[projectIndex];
  const next = LIVE_PROJECTS[(projectIndex + 1) % LIVE_PROJECTS.length];
  const caseStudy = CASE_STUDIES[project.slug];

  return (
    <main
      style={
        {
          "--color-accent-project": project.accent,
          // caseStudyGradient (a full background-image value — url() or a
          // gradient function) wins when present; otherwise fall back to
          // wrapping the home card's own gradient image, F3Global's only
          // case today. See Project.caseStudyGradient's own comment.
          "--gradient-project":
            project.caseStudyGradient ??
            (project.gradient ? `url("${project.gradient}")` : undefined),
        } as React.CSSProperties
      }
    >
      <CaseStudyHero project={project} hero={caseStudy.hero} />
      <CaseStudyBody project={project} overview={caseStudy.overview} sections={caseStudy.sections} />
      <CaseStudyActions next={next} />
    </main>
  );
}
