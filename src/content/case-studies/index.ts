import type { CaseStudy } from "./types";
import { f3global } from "./f3global";

// One entry per project with a finished case study. A slug with no entry
// here renders the CLAUDE.md stub (title only) instead — see
// src/app/work/[slug]/page.tsx. Keyed by slug so a case study's own file
// never has to know its position in content/projects.ts.
export const CASE_STUDIES: Record<string, CaseStudy> = {
  f3global,
};
