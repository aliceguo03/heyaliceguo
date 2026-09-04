// Labels for the WORK dropdown (navLabel, per Figma node 432:4563) and the
// footer link columns (footerLabel, per Figma node 441:5999). The two are
// deliberately different strings, not a casing transform of one another
// (e.g. "JPMORGAN CHASE" vs "Chase", "HOMEWORK" vs "hoMEwork") — both are
// rendered verbatim, with no text-transform applied by either consumer.
//
// TODO: reconcile with projects.ts at build step 6. Only four of these
// (F3GLOBAL, JPMORGAN CHASE, GOOGLE GEMINICUT, UC SAN DIEGO BFS BLINK) exist
// in the content model as real projects with slugs; the rest have no
// case-study page yet, so every entry points at /work for now.
export const NAV_PROJECTS = [
  { navLabel: "F3GLOBAL", footerLabel: "F3Global", href: "/work" },
  { navLabel: "JPMORGAN CHASE", footerLabel: "Chase", href: "/work" },
  { navLabel: "GOOGLE GEMINICUT", footerLabel: "GeminiCut", href: "/work" },
  { navLabel: "UC SAN DIEGO BFS BLINK", footerLabel: "Blink", href: "/work" },
  { navLabel: "ANATOLE QUARTET", footerLabel: "Anatole Quartet", href: "/work" },
  { navLabel: "TSE", footerLabel: "TSE", href: "/work" },
  { navLabel: "HOMEWORK", footerLabel: "hoMEwork", href: "/work" },
  { navLabel: "KINSIGHT", footerLabel: "KindSight", href: "/work" },
  { navLabel: "URBAN COLLABORATIVE PROJECT", footerLabel: "UCProject", href: "/work" },
] as const;
