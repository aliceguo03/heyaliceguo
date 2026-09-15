import { PROJECTS, type Project } from "./projects";
import { CASE_STUDIES } from "./case-studies";

// Projects with a finished case study — the only ones reachable anywhere in
// the UI: the WORK nav dropdown, the footer link column, /work/[slug]'s
// generateStaticParams, and the NEXT PROJECT wrap. Restoring a paused
// project means adding its content file and its CASE_STUDIES entry; nothing
// here changes. Deliberately not keyed off `featured` (a homepage-curation
// flag that only coincidentally matches today) — this is keyed off content
// actually existing.
//
// Deliberately its own module, not re-exported from projects.ts:
// projects.ts is imported by Nav.tsx/Footer.tsx, client components in the
// root layout, and importing CASE_STUDIES from there measurably leaked
// ~50KB of case-study prose into the shared client bundle on every page
// (the module graph a client component pulls in isn't per-export
// tree-shaken here). Only server components import this file — layout.tsx
// (which computes the list once and hands it to Nav/Footer as a plain
// serializable prop) and work/[slug]/page.tsx.
export const LIVE_PROJECTS: Project[] = PROJECTS.filter((project) => project.slug in CASE_STUDIES);
