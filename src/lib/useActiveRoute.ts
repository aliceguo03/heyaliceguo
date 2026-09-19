"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();
  return {
    isHome: pathname === "/",
    // Prefix match — Nav's own WORK pill reads this to stay "selected"
    // while browsing any case study. There is no literal /work index route
    // to disambiguate against (permanently cancelled, session R0 — see
    // DesktopNav.tsx's WORK pill comment), so this is the only "is Work
    // active" check the app needs.
    isWork: pathname.startsWith("/work"),
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
