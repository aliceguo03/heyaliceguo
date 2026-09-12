"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();
  return {
    isHome: pathname === "/",
    // Prefix match — Nav's own WORK pill reads this to stay "selected"
    // while browsing any case study, not just the literal /work index.
    // Not the same check the Footer's plain "Work" link needs (see
    // isWorkIndex below) — the two can legitimately disagree while a
    // project page is open, and that's by design, not a bug to reconcile.
    isWork: pathname.startsWith("/work"),
    // Exact match — the Footer's "Work" link (chassis-level nav, not the
    // per-project columns) is only active on the literal /work index,
    // never on /work/[slug]. Kept separate from `isWork` above rather than
    // changing that check's meaning: the Footer bug was two things bolding
    // at once ("Work" + the current project), which is fixed by narrowing
    // *this* link's own match, not by narrowing every consumer of
    // `pathname.startsWith("/work")`.
    isWorkIndex: pathname === "/work",
    isAbout: pathname.startsWith("/about"),
  };
}

// "/work/f3global" -> "f3global"; "/work" (the index) or anything else ->
// null. Keyed off the route itself against PROJECTS' own slugs, not a
// per-page value, so a fifth/sixth/... case study needs no change here.
// Shared by Nav's WORK dropdown and Footer's project columns — both
// highlight whichever project matches the current route off this same
// derivation, not two separately-maintained copies of it.
function activeProjectSlug(pathname: string) {
  if (!pathname.startsWith("/work/")) return null;
  return pathname.slice("/work/".length).split("/")[0] || null;
}

export function useActiveProjectSlug() {
  const pathname = usePathname();
  return activeProjectSlug(pathname);
}
