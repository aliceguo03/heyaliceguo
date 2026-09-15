import type { Project } from "@/content/projects";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

// Session R1: split into two full `<nav aria-label="Main">` landmarks,
// toggled by CSS (`hidden tablet:block` / `block tablet:hidden`), not by
// JS viewport detection — no hydration flash either direction, and
// `display: none` removes the inactive one from the accessibility tree at
// both ends, so assistive tech only ever sees one "Main" landmark.
// DesktopNav is the previous Nav.tsx's content, lifted unchanged.
//
// `projects` is LIVE_PROJECTS (content/liveProjects.ts), computed
// server-side in layout.tsx and passed down as a plain prop — see that
// file's own comment on why this component doesn't import PROJECTS
// directly.
export function Nav({ projects }: { projects: Project[] }) {
  return (
    <>
      <DesktopNav projects={projects} />
      <MobileNav projects={projects} />
    </>
  );
}
